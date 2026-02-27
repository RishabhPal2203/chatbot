#!/usr/bin/env python3
"""
Requirements checker and installer for Cloud Contact Center AI Assistant
"""
import subprocess
import sys

REQUIRED_PACKAGES = {
    'fastapi': '0.104.1',
    'uvicorn': '0.24.0',
    'sqlalchemy': '2.0.23',
    'pydantic': '2.5.0',
    'pydantic-settings': '2.1.0',
    'python-multipart': '0.0.6',
    'spacy': '3.7.2',
    'SpeechRecognition': '3.10.0',
    'gTTS': '2.4.0',
    'python-dotenv': '1.0.0',
}

def check_package(package, version):
    """Check if package is installed with correct version"""
    try:
        result = subprocess.run(
            [sys.executable, '-m', 'pip', 'show', package],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            for line in result.stdout.split('\n'):
                if line.startswith('Version:'):
                    installed_version = line.split(':')[1].strip()
                    return installed_version == version
        return False
    except Exception:
        return False

def install_package(package, version):
    """Install package with specific version"""
    print(f"Installing {package}=={version}...")
    subprocess.run([sys.executable, '-m', 'pip', 'install', f'{package}=={version}'])

def download_spacy_model():
    """Download spaCy language model"""
    print("Downloading spaCy model...")
    subprocess.run([sys.executable, '-m', 'spacy', 'download', 'en_core_web_sm'])

def main():
    print("=" * 60)
    print("Cloud Contact Center AI - Requirements Checker")
    print("=" * 60)
    
    missing = []
    
    for package, version in REQUIRED_PACKAGES.items():
        if check_package(package, version):
            print(f"✅ {package}=={version}")
        else:
            print(f"❌ {package}=={version} - Missing or wrong version")
            missing.append((package, version))
    
    if missing:
        print(f"\n{len(missing)} package(s) need to be installed.")
        response = input("Install missing packages? (y/n): ")
        if response.lower() == 'y':
            for package, version in missing:
                install_package(package, version)
            print("\n✅ All packages installed!")
            
            if 'spacy' in [p for p, v in missing]:
                download_spacy_model()
    else:
        print("\n✅ All requirements satisfied!")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
