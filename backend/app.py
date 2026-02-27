# python app.py

import os
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import time

app = FastAPI(title="YouTube Comment Sentiment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model/final_model")

# Label mapping
ID2LABEL = {0: "Positive", 1: "Neutral", 2: "Negative"}
LABEL2ID = {"Positive": 0, "Neutral": 1, "Negative": 2}
MAX_LENGTH = 128

# Global variables for model
tokenizer = None
model = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class CommentBatch(BaseModel):
    comments: List[str] = Field(..., description="List of comments to analyze")

class SentimentResult(BaseModel):
    comment: str
    label: str
    confidence: float
    probabilities: Dict[str, float]

class BatchResponse(BaseModel):
    results: List[SentimentResult]
    processing_time_ms: float

@app.on_event("startup")
async def load_model():
    """Load model on startup"""
    global tokenizer, model
    print(f"Loading model from {MODEL_PATH} on {device}...")
    
    # Load tokenizer and model
    tokenizer = DistilBertTokenizer.from_pretrained(MODEL_PATH)
    model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)
    model.to(device)
    model.eval()
    print("Model loaded successfully!")

@app.get("/")
async def root():
    return {
        "service": "YouTube Sentiment API",
        "status": "running",
        "model": "DistilBERT",
        "device": str(device)
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {"status": "healthy", "device": str(device)}

@app.post("/predict", response_model=BatchResponse)
async def predict_sentiment(batch: CommentBatch):
    """
    Predict sentiment for a batch of comments
    """
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    start_time = time.time()
    
    try:
        # Tokenize all comments at once
        inputs = tokenizer(
            batch.comments,
            padding="max_length",
            truncation=True,
            max_length=MAX_LENGTH,
            return_tensors="pt"
        ).to(device)
        
        # Run inference
        with torch.no_grad():
            outputs = model(**inputs)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        
        # Process results
        results = []
        for i, comment in enumerate(batch.comments):
            probs = probabilities[i].cpu().tolist()
            pred_id = torch.argmax(probabilities[i]).item()
            
            # Create probability dict for all classes
            prob_dict = {
                "Positive": round(probs[0], 4),
                "Neutral": round(probs[1], 4),
                "Negative": round(probs[2], 4)
            }
            
            results.append(SentimentResult(
                comment=comment[:100] + "..." if len(comment) > 100 else comment,
                label=ID2LABEL[pred_id],
                confidence=round(probs[pred_id], 4),
                probabilities=prob_dict
            ))
        
        processing_time = (time.time() - start_time) * 1000
        
        return BatchResponse(
            results=results,
            processing_time_ms=round(processing_time, 2)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)