import requests
import json

BASE_URL = "http://localhost:8000"

def test_text_chat():
    print("Testing Text Chat Endpoint...")
    
    test_messages = [
        "Hello",
        "I have a complaint about my service",
        "Where is my order?",
        "How much does it cost?",
        "I need technical support",
        "Goodbye"
    ]
    
    session_id = None
    
    for message in test_messages:
        response = requests.post(
            f"{BASE_URL}/chat/text",
            json={"message": message, "session_id": session_id}
        )
        
        if response.status_code == 200:
            data = response.json()
            session_id = data["session_id"]
            print(f"\n✅ Message: {message}")
            print(f"   Intent: {data['intent']} (Confidence: {data['confidence']:.2f})")
            print(f"   Response: {data['response'][:80]}...")
        else:
            print(f"\n❌ Error: {response.status_code}")

def test_analytics():
    print("\n\nTesting Analytics Endpoint...")
    
    response = requests.get(f"{BASE_URL}/analytics/summary")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ Analytics Summary:")
        print(f"   Total Conversations: {data['total_conversations']}")
        print(f"   Average Confidence: {data['average_confidence']}")
        print(f"   Intent Distribution: {json.dumps(data['intent_distribution'], indent=6)}")
    else:
        print(f"\n❌ Error: {response.status_code}")

def test_health():
    print("\n\nTesting Health Endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    
    if response.status_code == 200:
        print(f"✅ Server is healthy: {response.json()}")
    else:
        print(f"❌ Server health check failed")

if __name__ == "__main__":
    print("=" * 60)
    print("Cloud Contact Center AI - API Test Suite")
    print("=" * 60)
    
    try:
        test_health()
        test_text_chat()
        test_analytics()
        print("\n" + "=" * 60)
        print("All tests completed!")
        print("=" * 60)
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to server. Make sure it's running on port 8000")
