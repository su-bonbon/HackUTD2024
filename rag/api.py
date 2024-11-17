import json
from fastapi import FastAPI, HTTPException, WebSocket
from pydantic import BaseModel
from typing import List, Dict
from value_investment_service import ValueInvestmentService
import pymongo
from bson import json_util
from dotenv import load_dotenv, dotenv_values

load_dotenv()
app = FastAPI()
service = ValueInvestmentService()

class ValueAnalysisResponse(BaseModel):
    base_ncav: float
    quantitative_adjustments: float
    adjustment_reasons: List[str]
    final_ncav: float
    initial_research: str
    final_analysis: str

class StatusUpdate(BaseModel):
    status: str
    message: str
    data: Dict | None = None

@app.websocket("/ws/analysis")
async def websocket_analysis(websocket: WebSocket):
    await websocket.accept()
    
    try:
        data = await websocket.receive_json()
        ticker = data.get("ticker")
        
        if not ticker:
            await websocket.send_json({"error": "Ticker is required"})
            return

        await websocket.send_json(
            StatusUpdate(
                status="started",
                message=f"Starting analysis for {ticker}",
                data={}
            ).model_dump(exclude_none=True)
        )

        await websocket.send_json(
            StatusUpdate(
                status="searching",
                message="Searching for latest earnings report",
                data={}
            ).model_dump(exclude_none=True)
        )
        
        earnings_url = service.get_latest_earnings_url(ticker)
        if not earnings_url:
            await websocket.send_json({"error": f"No earnings report found for {ticker}"})
            return

        async def status_callback(status: str, message: str, data: Dict | None = None):
            await websocket.send_json(
                StatusUpdate(
                    status=status,
                    message=message,
                    data=data if data is not None else {}
                ).model_dump(exclude_none=True)
            )

        result = await service.analyze_company(ticker, earnings_url, status_callback)
        
        if "error" in result:
            await websocket.send_json({"error": result["error"]})
            return

        myclient = pymongo.MongoClient(dotenv_values()['MONGO_URI'])
        mydb = myclient["test-api"]
        mycol = mydb["analysis"]

        mycol.insert_one(json.loads(json_util.dumps(result)))

        # Send final result
        await websocket.send_json(
            StatusUpdate(
                status="completed",
                message="Analysis completed",
                data=result
            ).model_dump()
        )

    except Exception as e:
        await websocket.send_json({"error": str(e)})
    
    finally:
        await websocket.close()

# REST endpoint for backward comp
@app.get("/api/generate")
async def generate_analysis(ticker: str) -> ValueAnalysisResponse:
    try:
        earnings_url = service.get_latest_earnings_url(ticker)
        if not earnings_url:
            raise HTTPException(status_code=404, detail=f"No earnings report found for {ticker}")
            
        result = await service.analyze_company(ticker, earnings_url)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return ValueAnalysisResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))