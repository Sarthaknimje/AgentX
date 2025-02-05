import speech_recognition as sr
import subprocess
import requests
import webbrowser
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv
import os
import re
import time

load_dotenv()

class VoiceAssistant:
    def __init__(self):
        print("Initializing voice assistant...")
        
        # Initialize speech recognition with optimized settings
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 4000
        self.recognizer.dynamic_energy_threshold = False
        self.recognizer.pause_threshold = 0.5
        
        # Initialize Chrome with debugging options
        print("Connecting to Chrome...")
        chrome_options = Options()
        chrome_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
        chrome_options.add_argument("--remote-debugging-port=9222")
        try:
            print("Attempting to connect to Chrome (timeout: 10s)...")
            self.driver = webdriver.Chrome(options=chrome_options)
            WebDriverWait(self.driver, 10).until(lambda driver: driver.current_url)
            print(f"Successfully connected to Chrome. Current URL: {self.driver.current_url}")
        except Exception as e:
            print("\nError: Could not connect to Chrome")
            print("Please make sure Chrome is running with remote debugging enabled")
            print("Run: open -a 'Google Chrome' --args --remote-debugging-port=9222")
            raise e
        
        # API configuration
        self.api_url = os.getenv('API_URL', 'http://localhost:5002/api')
        self.frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5003')
        print("Initialization complete!")

    def speak(self, text):
        print(f"\nAssistant: {text}")
        subprocess.run(['say', text])

    def get_current_twitter_username(self):
        try:
            # Get all Chrome windows/tabs
            windows = self.driver.window_handles
            current_url = None
            
            # Look for a Twitter/X tab
            for window in windows:
                self.driver.switch_to.window(window)
                current_url = self.driver.current_url
                print(f"\nChecking URL: {current_url}")
                
                if 'twitter.com' in current_url or 'x.com' in current_url:
                    match = re.search(r'(?:twitter|x)\.com/([^/?]+)', current_url)
                    if match:
                        username = match.group(1)
                        print(f"Found username: {username}")
                        return username
            
            if not any('twitter.com' in url or 'x.com' in url for url in [self.driver.current_url for _ in windows]):
                print("No Twitter/X tabs found. Please open Twitter and try again.")
            return None
        except Exception as e:
            print(f"Error getting username: {e}")
            return None

    def fetch_agent_data(self, username):
        try:
            print(f"\nFetching data for {username} from {self.api_url}/agents/{username}")
            response = requests.get(
                f"{self.api_url}/agents/{username}",
                headers={'x-api-key': os.getenv('COOKIE_API_KEY')},
                timeout=5  # Add timeout
            )
            print(f"API Response status: {response.status_code}")
            return response.json()
        except requests.exceptions.ConnectionError:
            print(f"\nError: Could not connect to API at {self.api_url}")
            print("Please make sure the API server is running")
            return None
        except Exception as e:
            print(f"\nError fetching data: {e}")
            return None

    def process_command(self, command):
        if 'check this agent' in command.lower():
            username = self.get_current_twitter_username()
            
            if not username:
                self.speak("Please open Twitter and navigate to a profile, then try again.")
                return
            
            self.speak(f"Looking up agent {username}")
            
            # Check API connection first
            try:
                requests.get(self.api_url, timeout=2)
            except requests.exceptions.ConnectionError:
                self.speak("Sorry, I cannot connect to the API server. Please make sure it's running.")
                return
            
            # Open main page with search query
            webbrowser.open(f"{self.frontend_url}?search={username}")
            self.speak(f"Searching for {username}")

    def listen(self):
        with sr.Microphone(device_index=0) as source:  # Explicitly use MacBook Air Microphone
            print("\nListening... (say 'check this agent' when on a Twitter profile)")
            self.recognizer.adjust_for_ambient_noise(source, duration=2)
            
            try:
                audio = self.recognizer.listen(source, timeout=10, phrase_time_limit=5)
                print("Got it! Now recognizing...")
                try:
                    command = self.recognizer.recognize_google(audio)
                    print(f"You said: {command}")
                    return command
                except sr.UnknownValueError:
                    print("Could not understand audio")
                    return None
                except sr.RequestError as e:
                    print(f"Could not request results; {e}")
                    return None
            except sr.WaitTimeoutError:
                print("No speech detected within timeout")
                return None

    def run(self):
        self.speak("Voice assistant is ready. Say 'check this agent' when on a Twitter profile.")
        
        while True:
            command = self.listen()
            if command:
                self.process_command(command)

    def __del__(self):
        # Clean up browser driver
        if hasattr(self, 'driver'):
            self.driver.quit()

if __name__ == "__main__":
    print("\nStarting voice assistant...")
    assistant = VoiceAssistant()
    try:
        assistant.run()
    except KeyboardInterrupt:
        print("\nShutting down voice assistant...")
    finally:
        assistant.driver.quit()