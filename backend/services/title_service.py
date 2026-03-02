import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class TitleGenerationService:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        self.client = Groq(api_key=api_key)
    
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
