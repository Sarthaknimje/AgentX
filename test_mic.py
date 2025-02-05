import speech_recognition as sr
import os
import sys

def check_mic_permissions():
    print("Checking microphone permissions...")
    try:
        with sr.Microphone() as source:
            print("✅ Microphone permissions granted!")
            return True
    except OSError as e:
        print("❌ Microphone permission denied or not set up!")
        print("Please grant microphone permissions to Terminal in System Settings")
        print("Error details:", str(e))
        return False

def test_microphone():
    if not check_mic_permissions():
        return

    recognizer = sr.Recognizer()
    
    # Set higher energy threshold for better detection
    recognizer.energy_threshold = 4000  # Increased from default 300
    recognizer.dynamic_energy_threshold = False  # Disable dynamic adjustment
    recognizer.pause_threshold = 0.5  # Make it more responsive
    
    print("\nTesting microphone...")
    print("Available microphones:")
    for index, name in enumerate(sr.Microphone.list_microphone_names()):
        print(f"Microphone {index}: {name}")
    
    print("\nTesting MacBook Air Microphone...")
    with sr.Microphone(device_index=0) as source:  # Use MacBook Air Microphone
        print("Adjusting for ambient noise... Please be quiet.")
        recognizer.adjust_for_ambient_noise(source, duration=3)
        print(f"Energy threshold set to {recognizer.energy_threshold}")
        print("\nOK - Now say something! (You have 10 seconds)")
        
        try:
            print("Listening...")
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=5)
            print("Got it! Now recognizing...")
            try:
                text = recognizer.recognize_google(audio)
                print(f"You said: {text}")
            except sr.UnknownValueError:
                print("Could not understand the audio")
            except sr.RequestError as e:
                print(f"Could not request results; {e}")
        except sr.WaitTimeoutError:
            print("No speech detected within timeout")

if __name__ == "__main__":
    try:
        test_microphone()
    except KeyboardInterrupt:
        print("\nTest stopped by user")
    except Exception as e:
        print(f"\nError: {str(e)}")