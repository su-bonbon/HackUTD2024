from typing import Dict, List, Tuple
from langchain import hub
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_community.tools.yahoo_finance_news import YahooFinanceNewsTool
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import Tool
from langchain_core.callbacks import StdOutCallbackHandler
import asyncio
import nest_asyncio

from document_processor import DocumentProcessor
from config import (
    INITIAL_RESEARCH_PROMPT,
    ADJUSTMENT_PROMPT,
    FINAL_ANALYSIS_PROMPT
)

# nested event loop support
nest_asyncio.apply()

class ValueInvestmentAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            temperature=0, 
            model="gpt-4",
            callbacks=[StdOutCallbackHandler()]
        )
        self.search = DuckDuckGoSearchRun()
        self.doc_processor = DocumentProcessor()
        self.authorized_url = None
        self.is_processed = False

    async def async_process_earnings_report(self, url: str) -> str:
        """Async wrapper for processing earnings report"""
        if url != self.authorized_url:
            return f"Error: Invalid URL. Only authorized to process: {self.authorized_url}"
        
        try:
            result = await self.doc_processor.process_earnings_report(url)
            if "Error" not in result:
                self.is_processed = True
            return result
        except Exception as e:
            return f"Error processing earnings report: {str(e)}"

    def process_earnings_report(self, url: str) -> str:
        """Synchronous interface for processing earnings report"""
        try:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(self.async_process_earnings_report(url))
        except Exception as e:
            return f"Error processing earnings report: {str(e)}"

    def search_company_news(self, query: str) -> List[str]:
        """Search recent news about the company"""
        return self.search.run(f"{query} company news last 3 months")

    def search_earnings_report(self, query: str) -> str:
        """Search earnings report with processing check"""
        if not self.is_processed:
            return "Error: Must process earnings report first using the authorized URL"
        return self.doc_processor.search_earnings_report(query)

    def setup_tools(self):
        """Set up agent tools"""
        tools = [
            Tool(
                name="process_earnings_report",
                func=self.process_earnings_report,
                description="Processes the earnings report PDF. Must use the exact URL provided in the initial prompt."
            ),
            Tool(
                name="search_earnings_report",
                func=self.search_earnings_report,
                description="Searches the processed earnings report. Only works after successful processing."
            ),
            YahooFinanceNewsTool(),
            Tool(
                name="news_search",
                func=self.search_company_news,
                description="Searches recent news about a company"
            )
        ]
        
        prompt = hub.pull("hwchase17/openai-functions-agent")
        agent = create_openai_functions_agent(self.llm, tools, prompt)
        return AgentExecutor(agent=agent, tools=tools, verbose=True)

    def get_llm_adjustments(self, metrics: dict, context: str) -> Tuple[float, List[str]]:
        """Have LLM analyze metrics and determine adjustments"""
        # Add ncav_per_share to metrics if not present
        if 'ncav_per_share' not in metrics and 'base_ncav' in metrics:
            metrics['ncav_per_share'] = metrics['base_ncav']

        adjustment_prompt = ADJUSTMENT_PROMPT.format(
            metrics=metrics,
            context=context
        )

        response = self.llm.invoke(adjustment_prompt)
        
        try:
            content = response.content
            
            total_line = next(line for line in content.split('\n') if line.startswith('TOTAL_ADJUSTMENT:'))
            total_adjustment = float(total_line.split(':')[1].strip())
            
            adjustment_sections = content.split('ADJUSTMENTS:')[1].split('NOTES:')[0].strip().split('\n\n')
            reasons = []
            
            for section in adjustment_sections:
                if not section.strip():
                    continue
                    
                lines = section.strip().split('\n')
                category = next(line for line in lines if 'CATEGORY:' in line).split(':')[1].strip()
                amount = float(next(line for line in lines if 'AMOUNT:' in line).split(':')[1].strip())
                reason = next(line for line in lines if 'REASON:' in line).split(':')[1].strip()
                
                reasons.append(f"{category}: ${amount:,.2f} - {reason}")
            
            return total_adjustment, reasons
            
        except Exception as e:
            print(f"Error parsing LLM adjustments: {str(e)}")
            return 0.0, ["Error: Could not determine adjustments"]

    async def run_analysis(self, ticker: str, earnings_url: str, metrics: Dict, status_callback = None) -> Dict:
        """Run the full agent analysis process"""
        try:
            self.authorized_url = earnings_url
            self.is_processed = False
            
            agent_executor = self.setup_tools()
            
            if status_callback:
                await status_callback("research", "Beginning Research")
            
            initial_prompt = INITIAL_RESEARCH_PROMPT.format(
                ticker=ticker,
                earnings_url=earnings_url
            )
            context_result = agent_executor.invoke({
                "input": initial_prompt
            })
            
            # Ensure ncav_per_share is in metrics
            if 'ncav_per_share' not in metrics:
                metrics['ncav_per_share'] = metrics.get('base_ncav', 0.0)
            
            if status_callback:
                await status_callback("adjustment", "Adjusting NCAV values")
            
            adjustments, adjustment_reasons = self.get_llm_adjustments(
                metrics, 
                context_result['output']
            )
            
            if status_callback:
                await status_callback("finalizing", "Forming final thesis")
            
            final_prompt = FINAL_ANALYSIS_PROMPT.format(
                ticker=ticker,
                ncav_per_share=metrics['ncav_per_share'],
                adjustments=adjustments,
                final_ncav=metrics['ncav_per_share'] + adjustments,
                adjustment_reasons="\n".join(adjustment_reasons),
                context=context_result['output']
            )
            
            final_analysis = agent_executor.invoke({
                "input": final_prompt
            })
            
            return {
                "base_ncav": metrics['ncav_per_share'],
                "final_ncav": metrics['ncav_per_share'] + adjustments,
                "adjustments": adjustments,
                "adjustment_reasons": adjustment_reasons,
                "initial_research": context_result['output'],
                "final_analysis": final_analysis['output']
            }
            
        except Exception as e:
            return {"error": f"Agent analysis failed: {str(e)}"} 