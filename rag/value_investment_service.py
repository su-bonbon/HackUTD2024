from typing import Dict, Optional
import yfinance as yf
from ncav_calculator import NCavCalculator
from agent_manager import ValueInvestmentAgent

class ValueInvestmentService:
    def __init__(self):
        self.ncav_calculator = NCavCalculator()
        self.agent = ValueInvestmentAgent()

    def get_latest_earnings_url(self, ticker: str) -> Optional[str]:
        """Get the latest 10-Q or 10-K URL for the given ticker"""
        try:
            stock = yf.Ticker(ticker)
            filings = stock.get_sec_filings()
            
            for filing in filings:
                if filing['type'] in ['10-Q', '10-K']:
                    exhibits = filing.get('exhibits', {})
                    if filing['type'] in exhibits:
                        return exhibits[filing['type']]
            
            print(f"No recent 10-Q or 10-K found for {ticker}")
            return None
            
        except Exception as e:
            print(f"Error getting earnings URL: {str(e)}")
            return None

    async def analyze_company(self, ticker: str, earnings_url: str, status_callback=None) -> dict:
        try:            
            if status_callback:
                await status_callback("calculation", "Calculating NCAV values")

            metrics = self.ncav_calculator.get_financial_data(ticker)
            
            analysis = await self.agent.run_analysis(ticker, earnings_url, metrics, status_callback)
            
            return analysis
            
        except Exception as e:
            return {"error": str(e)} 