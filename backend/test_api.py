import requests
import json

# Test health endpoint
response = requests.get("http://localhost:8000/health")
print("Health check:", response.json())

# Test prediction
test_comments = [
    "I love this video, amazing content! 🔥",
    "This is the worst video I've ever seen, waste of time.",
    "The video was okay, nothing special.",
    "Great explanation, very helpful!",
    "I don't understand why people like this."
]

response = requests.post(
    "http://localhost:8000/predict",
    json={"comments": test_comments}
)

print("\nPredictions:")
results = response.json()
for r in results["results"]:
    print(f"\nComment: {r['comment']}")
    print(f"Sentiment: {r['label']} (confidence: {r['confidence']})")
    print(f"Probs: {r['probabilities']}")
print(f"\nProcessing time: {results['processing_time_ms']}ms")