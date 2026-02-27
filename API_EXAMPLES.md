# API Examples

## Text Chat Examples

### Example 1: Greeting

**Request:**
```bash
curl -X POST http://localhost:8000/chat/text \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, I need help",
    "session_id": null
  }'
```

**Response:**
```json
{
  "response": "Hello! I'm your Cloud Contact Center Assistant. How can I help you today?",
  "intent": "greeting",
  "confidence": 0.85,
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "audio_url": "/audio/12345678-abcd-ef90-1234-567890abcdef.mp3"
}
```

### Example 2: Order Status

**Request:**
```bash
curl -X POST http://localhost:8000/chat/text \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Where is my order?",
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }'
```

**Response:**
```json
{
  "response": "I can help you check your order status. Please provide your order number, and I'll look it up for you.",
  "intent": "order_status",
  "confidence": 0.85,
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "audio_url": "/audio/87654321-dcba-0987-6543-210fedcba098.mp3"
}
```

### Example 3: Pricing Query

**Request:**
```bash
curl -X POST http://localhost:8000/chat/text \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How much does your service cost?",
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }'
```

**Response:**
```json
{
  "response": "I'd be happy to help with pricing information. Our plans start at $29/month for basic support. Would you like detailed pricing information?",
  "intent": "pricing_query",
  "confidence": 0.85,
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "audio_url": "/audio/abcdef12-3456-7890-abcd-ef1234567890.mp3"
}
```

### Example 4: Technical Support

**Request:**
```bash
curl -X POST http://localhost:8000/chat/text \
  -H "Content-Type: application/json" \
  -d '{
    "message": "My application is not working",
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }'
```

**Response:**
```json
{
  "response": "I understand you need technical assistance. Let me gather some information to help resolve your issue quickly.",
  "intent": "technical_support",
  "confidence": 0.85,
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "audio_url": "/audio/fedcba09-8765-4321-0fed-cba098765432.mp3"
}
```

### Example 5: Complaint

**Request:**
```bash
curl -X POST http://localhost:8000/chat/text \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have a complaint about the service",
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }'
```

**Response:**
```json
{
  "response": "I'm sorry to hear you're experiencing issues. Let me connect you with our support team to resolve this immediately.",
  "intent": "complaint",
  "confidence": 0.85,
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "audio_url": "/audio/11223344-5566-7788-99aa-bbccddeeff00.mp3"
}
```

## Voice Chat Example

**Request:**
```bash
curl -X POST http://localhost:8000/chat/voice \
  -F "audio=@recording.wav" \
  -F "session_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

**Response:** Same format as text chat

## Analytics Examples

### Get Summary

**Request:**
```bash
curl http://localhost:8000/analytics/summary
```

**Response:**
```json
{
  "total_conversations": 150,
  "average_confidence": 0.78,
  "intent_distribution": {
    "greeting": 45,
    "technical_support": 30,
    "pricing_query": 25,
    "order_status": 20,
    "complaint": 15,
    "goodbye": 10,
    "fallback": 5
  }
}
```

### Get Intent Distribution

**Request:**
```bash
curl http://localhost:8000/analytics/intents
```

**Response:**
```json
{
  "greeting": 45,
  "technical_support": 30,
  "pricing_query": 25,
  "order_status": 20,
  "complaint": 15,
  "goodbye": 10,
  "fallback": 5
}
```

### Get Daily Stats

**Request:**
```bash
curl http://localhost:8000/analytics/daily?days=7
```

**Response:**
```json
{
  "2024-01-15": 25,
  "2024-01-16": 30,
  "2024-01-17": 28,
  "2024-01-18": 35,
  "2024-01-19": 20,
  "2024-01-20": 22,
  "2024-01-21": 18
}
```

## Python Client Example

```python
import requests

class ChatbotClient:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.session_id = None
    
    def send_message(self, message):
        response = requests.post(
            f"{self.base_url}/chat/text",
            json={
                "message": message,
                "session_id": self.session_id
            }
        )
        data = response.json()
        self.session_id = data["session_id"]
        return data
    
    def get_analytics(self):
        response = requests.get(f"{self.base_url}/analytics/summary")
        return response.json()

# Usage
client = ChatbotClient()

# Send messages
response1 = client.send_message("Hello")
print(f"Bot: {response1['response']}")
print(f"Intent: {response1['intent']}")

response2 = client.send_message("How much does it cost?")
print(f"Bot: {response2['response']}")

# Get analytics
analytics = client.get_analytics()
print(f"Total conversations: {analytics['total_conversations']}")
```

## JavaScript/React Example

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Send text message
async function sendMessage(message, sessionId) {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      message: message,
      session_id: sessionId
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Get analytics
async function getAnalytics() {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/summary`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Usage
(async () => {
  const result = await sendMessage('Hello', null);
  console.log('Response:', result.response);
  console.log('Intent:', result.intent);
  
  const analytics = await getAnalytics();
  console.log('Analytics:', analytics);
})();
```

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Error processing audio: Invalid audio format"
}
```

### 422 Validation Error

```json
{
  "detail": [
    {
      "loc": ["body", "message"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error"
}
```
