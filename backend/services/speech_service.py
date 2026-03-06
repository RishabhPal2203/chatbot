import speech_recognition as sr
from gtts import gTTS
import os
import uuid

class SpeechService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        # Use /tmp for serverless environments (Vercel, AWS Lambda)
        self.audio_dir = "/tmp/audio_responses" if os.getenv("VERCEL") else "audio_responses"
        try:
            os.makedirs(self.audio_dir, exist_ok=True)
        except OSError:
            # Fallback if directory creation fails
            self.audio_dir = "/tmp"
    
    def speech_to_text(self, audio_file) -> str:
        with sr.AudioFile(audio_file) as source:
            audio = self.recognizer.record(source)
            text = self.recognizer.recognize_google(audio)
            return text
    
    def text_to_speech(self, text: str) -> str:
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join(self.audio_dir, filename)
        tts = gTTS(text=text, lang='en', slow=False, lang_check=False)
        tts.save(filepath)
        return filepath
