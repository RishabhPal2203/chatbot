import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class TitleGenerationService:
    def __init__(self):
        self._client = None
    
    @property
    def client(self):
        """Get Groq client with current API key"""
        from routes.settings import get_groq_api_key
        api_key = get_groq_api_key()
        if not api_key:
            raise ValueError("Please configure your Groq API key in Settings")
        if self._client is None or self._client.api_key != api_key:
            self._client = Groq(api_key=api_key)
        return self._client
    
    def generate_title(self, first_message: str) -> str:
        """Generate a short conversation title from the first user message using minimal tokens"""
        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
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
