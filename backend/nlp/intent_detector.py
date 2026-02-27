import spacy
from typing import Tuple
import re

class IntentDetector:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            self.nlp = None
        
        self.intent_patterns = {
            "greeting": [
                r"\b(hi|hello|hey|good morning|good afternoon|good evening)\b",
            ],
            "complaint": [
                r"\b(complaint|issue|problem|not working|broken|frustrated|angry|disappointed)\b",
            ],
            "order_status": [
                r"\b(order|delivery|shipment|tracking|status|where is my|when will)\b",
            ],
            "pricing_query": [
                r"\b(price|cost|pricing|how much|payment|billing|charge|fee)\b",
            ],
            "technical_support": [
                r"\b(technical|support|help|error|bug|not responding|crash|fix)\b",
            ],
            "goodbye": [
                r"\b(bye|goodbye|see you|thanks|thank you|that's all)\b",
            ],
        }
        
        self.responses = {
            "greeting": "Hello! I'm your Cloud Contact Center Assistant. How can I help you today?",
            "complaint": "I'm sorry to hear you're experiencing issues. Let me connect you with our support team to resolve this immediately.",
            "order_status": "I can help you check your order status. Please provide your order number, and I'll look it up for you.",
            "pricing_query": "I'd be happy to help with pricing information. Our plans start at $29/month for basic support. Would you like detailed pricing information?",
            "technical_support": "I understand you need technical assistance. Let me gather some information to help resolve your issue quickly.",
            "goodbye": "Thank you for contacting us! Have a great day!",
            "fallback": "I'm not sure I understood that correctly. Could you please rephrase or provide more details?"
        }
    
    def detect_intent(self, text: str) -> Tuple[str, float]:
        text_lower = text.lower()
        
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    confidence = 0.85
                    return intent, confidence
        
        if self.nlp:
            doc = self.nlp(text_lower)
            if any(token.pos_ == "VERB" and token.lemma_ in ["help", "need", "want"] for token in doc):
                return "technical_support", 0.65
        
        return "fallback", 0.3
    
    def generate_response(self, intent: str) -> str:
        return self.responses.get(intent, self.responses["fallback"])
