import os
from groq import Groq
from fastapi import Request
from dotenv import load_dotenv

load_dotenv()

class TitleGenerationService:
    def __init__(self):
        pass
    
    def get_client(self, request: Request):
        """Get Groq client with current session's API key"""
        from routes.settings import get_groq_api_key
        api_key = get_groq_api_key(request)
        if not api_key:
            raise ValueError("Please configure your Groq API key in Settings")
        return Groq(api_key=api_key)
    
    def generate_title(self, first_message: str, request: Request) -> str:
        """Generate a short conversation title from the first user message using minimal tokens"""
        try:
            client = self.get_client(request)
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",  # Faster model
                messages=[
                    {
                        "role": "system",
                        "content": "Generate a short 2-5 word title for this conversation. Only return the title, nothing else."
                    },
                    {
                        "role": "user",
                        "content": first_message
                    }
                ],
                max_tokens=15,
                temperature=0.3
            )
            
            title = response.choices[0].message.content.strip()
            # Remove quotes if present
            title = title.strip('"').strip("'")
            return title[:50]  # Limit to 50 chars
            
        except Exception as e:
            print(f"Title generation error: {e}")
            # Fallback: use first few words of message
            words = first_message.split()[:4]
            return ' '.join(words) + ('...' if len(first_message.split()) > 4 else '')
