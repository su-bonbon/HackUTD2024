from typing import Tuple, Optional
import yfinance as yf
import pandas as pd

class NCavCalculator:
    def get_financial_data(self, ticker_symbol: str) -> Optional[Tuple[float, dict]]:
        """
        Calculate NCAV and get balance sheet metrics
        NCAVPS = (Current Assets - (Current Liabilities + Preferred Stock)) / Shares Outstanding
        """
        try:
            ticker = yf.Ticker(ticker_symbol)
            
            balance_sheet = ticker.balance_sheet
            if balance_sheet.empty:
                return None
                
            latest_bs = balance_sheet.iloc[:, 0]  # First column is most recent
            
            shares_outstanding = ticker.info.get('sharesOutstanding', 0)
            if shares_outstanding == 0:
                return None

            current_assets = latest_bs.get('Current Assets', 0)
            
            cash = latest_bs.get('Cash And Cash Equivalents', 0)
            short_term_investments = latest_bs.get('Other Short Term Investments', 0)
            total_cash = cash + short_term_investments
            
            receivables = latest_bs.get('Receivables', 0)
            if receivables == 0:
                receivables = latest_bs.get('Accounts Receivable', 0)
                
            inventory = latest_bs.get('Inventory', 0)
            if inventory > 0:
                raw_materials = latest_bs.get('Raw Materials', 0)
                work_in_process = latest_bs.get('Work In Process', 0)
                finished_goods = latest_bs.get('Finished Goods', 0)
                other_inventory = latest_bs.get('Other Inventories', 0)

                if any([raw_materials, work_in_process, finished_goods, other_inventory]):
                    inventory = sum([raw_materials, work_in_process, finished_goods, other_inventory])
            
            current_liabilities = latest_bs.get('Current Liabilities', 0)
            
            preferred_stock = latest_bs.get('Preferred Stock', 0)
            
            current_lease = latest_bs.get('Current Capital Lease Obligation', 0)

            # NCAV
            ncav = current_assets - (current_liabilities + preferred_stock)
            ncav_per_share = ncav / shares_outstanding
            
            financial_metrics = {
                'base_ncav': ncav_per_share,
                'cash': total_cash,
                'short_term_investments': short_term_investments,
                'receivables': receivables,
                'inventory': inventory,
                'raw_materials': raw_materials if raw_materials else 0,
                'work_in_process': work_in_process if work_in_process else 0,
                'finished_goods': finished_goods if finished_goods else 0,
                'other_inventory': other_inventory if other_inventory else 0,
                'current_assets': current_assets,
                'current_liabilities': current_liabilities,
                'current_lease_obligations': current_lease,
                'long_term_debt': latest_bs.get('Long Term Debt', 0),
                'total_liabilities': latest_bs.get('Total Liabilities Net Minority Interest', 0),
                'preferred_stock': preferred_stock,
                'shares_outstanding': shares_outstanding,
                'current_ratio': current_assets / current_liabilities if current_liabilities != 0 else float('inf'),
                'cash_ratio': total_cash / current_liabilities if current_liabilities != 0 else float('inf')
            }
            
            print(f"\nNCAV Calculation Breakdown for {ticker_symbol}:")
            print(f"Current Assets: ${current_assets:,.2f}")
            print(f"Current Liabilities: ${current_liabilities:,.2f}")
            print(f"Preferred Stock: ${preferred_stock:,.2f}")
            print(f"Shares Outstanding: {shares_outstanding:,.0f}")
            print(f"NCAV: ${ncav:,.2f}")
            print(f"NCAV per share: ${ncav_per_share:.2f}")
            
            return financial_metrics
            
        except Exception as e:
            print(f"Error calculating NCAV: {str(e)}")
            return None

# Test
if __name__ == "__main__":
    calc = NCavCalculator()
    ticker = "NC"
    
    print(f"\nAnalyzing {ticker}...")
    ncav_result = calc.get_financial_data(ticker)
    
    if ncav_result:
        ncav_per_share, metrics = ncav_result
        print("\nKey Metrics:")
        for key, value in metrics.items():
            if isinstance(value, (int, float)):
                print(f"{key}: ${value:,.2f}")
    else:
        print("Failed to calculate NCAV")