import os

INITIAL_RESEARCH_PROMPT = """
You are analyzing {ticker} for value investment. Follow these steps EXACTLY in order:

1. FIRST, call process_earnings_report with this URL: {earnings_url}
   This is the only URL that will work - any other URL will return an error.

2. ONLY after processing succeeds, use search_earnings_report with these queries in order:
   - "balance sheet"
   - "liabilities"
   - "accounting changes"
   - "contingent liabilities"
   - "off-balance sheet items"

3. THEN use YahooFinanceNews for {ticker}

4. FINALLY use news_search for "{ticker} financial news"

After each step, report what you found. You must complete each step in order.
The search_earnings_report tool will not work until process_earnings_report succeeds.
"""

ADJUSTMENT_PROMPT = """
Analyze these financial metrics and determine if any adjustments to the NCAV calculation are needed.
Base your analysis on the financial data and context provided. Only suggest adjustments if you find 
specific, quantifiable issues that affect asset values or liabilities.

Financial Metrics:
{metrics}

Context from earnings report and news:
{context}

You must respond in this exact format:

TOTAL_ADJUSTMENT: [number]

ADJUSTMENTS:
1. CATEGORY: [Receivables/Inventory/Cash/Liabilities]
AMOUNT: [number]
REASON: [specific reason with evidence]

2. CATEGORY: [Receivables/Inventory/Cash/Liabilities]
AMOUNT: [number]
REASON: [specific reason with evidence]

(continue for each adjustment)

NOTES:
- [Any qualitative observations that didn't result in adjustments]
- [Market conditions or other relevant factors]

Rules:
- All amounts must be per share
- Each adjustment must cite specific evidence from financials or reports
- Only adjust for concrete, quantifiable issues
- Amounts should be negative for value reductions, positive for additions
"""

FINAL_ANALYSIS_PROMPT = """
Based on the information gathered, provide a final analysis of {ticker}:

1. Base NCAV Calculation:
   - NCAV per share: ${ncav_per_share:.2f}
   - Adjustments per share: ${adjustments:.2f}
   - Final NCAV per share: ${final_ncav:.2f}
   
2. Adjustment Reasons:
{adjustment_reasons}

3. Research Findings:
{context}

Provide:
1. Verification of the NCAV calculation accuracy
2. Discussion of the adjustments made
3. Final investment recommendation
4. Key qualitative factors to consider (as notes only)

Focus on concrete findings and specific numbers from the financial statements.
""" 