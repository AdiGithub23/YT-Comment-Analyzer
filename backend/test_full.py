import requests
import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Add path for YouTube fetcher
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from youtube_api_test.fetch_comments import YouTubeCommentFetcher

# Configuration
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
API_URL = "http://localhost:8000/predict"

def test_full_pipeline(video_url, max_comments=100, batch_size=20):
    """Test: YouTube API → Backend API → Results"""
    
    print(f"Testing pipeline for video: {video_url}")
    
    # Step 1: Fetch comments
    print("\n1. Fetching comments from YouTube...")
    fetcher = YouTubeCommentFetcher(YOUTUBE_API_KEY)
    video_id = fetcher.get_video_id_from_url(video_url)
    comments = fetcher.fetch_comments(video_id, max_results=max_comments)
    
    print(f"   ✓ Fetched {len(comments)} comments")
    
    if not comments:
        print("   ✗ No comments found")
        return
    
    # Step 2: Process in batches
    print("\n2. Sending to sentiment API...")
    all_results = []
    
    for i in range(0, len(comments), batch_size):
        batch = comments[i:i+batch_size]
        
        response = requests.post(
            API_URL,
            json={"comments": batch}
        )
        
        if response.status_code == 200:
            batch_results = response.json()
            all_results.extend(batch_results["results"])
            print(f"   Batch {i//batch_size + 1}: {len(batch)} comments → {batch_results['processing_time_ms']}ms")
        else:
            print(f"   ✗ API error: {response.status_code}")
    
    # Step 3: Calculate video-level sentiment
    print("\n3. Aggregating results...")
    
    sentiment_counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
    total_confidence = 0
    
    for result in all_results:
        sentiment_counts[result["label"]] += 1
        total_confidence += result["confidence"]
    
    total = len(all_results)
    percentages = {
        k: round((v/total)*100, 1) for k, v in sentiment_counts.items()
    }
    avg_confidence = round(total_confidence/total, 3)
    
    # Step 4: Display summary
    print("\n" + "="*50)
    print("📊 VIDEO SENTIMENT SUMMARY")
    print("="*50)
    print(f"Total comments analyzed: {total}")
    print(f"Average confidence: {avg_confidence}")
    print("\nSentiment breakdown:")
    print(f"😊 Positive: {percentages['Positive']}% ({sentiment_counts['Positive']} comments)")
    print(f"😐 Neutral:  {percentages['Neutral']}% ({sentiment_counts['Neutral']} comments)")
    print(f"😞 Negative: {percentages['Negative']}% ({sentiment_counts['Negative']} comments)")
    print("="*50)
    
    # Save results
    import json
    with open("test_results.json", "w") as f:
        json.dump({
            "video_url": video_url,
            "total_comments": total,
            "percentages": percentages,
            "results": all_results
        }, f, indent=2)
    print("\nResults saved to test_results.json")

if __name__ == "__main__":
    # Test with a video
    test_full_pipeline(
        video_url="https://www.youtube.com/watch?v=yH1IdJAN7jA",
        max_comments=50,
        batch_size=10
    )
