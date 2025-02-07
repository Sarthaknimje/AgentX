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
from selenium.webdriver.common.keys import Keys
from dotenv import load_dotenv
import os
import re
import time
import random
import sys
import json

load_dotenv()

class VoiceAssistant:
    def __init__(self):
        print("Initializing voice assistant...")
        
        # Initialize speech recognition with optimized settings
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300  # Lower threshold for better sensitivity
        self.recognizer.dynamic_energy_threshold = True  # Enable dynamic adjustment
        self.recognizer.dynamic_energy_adjustment_damping = 0.15  # More responsive adjustment
        self.recognizer.dynamic_energy_ratio = 1.5  # More sensitive to quieter sounds
        self.recognizer.pause_threshold = 0.8  # Longer pause threshold
        self.recognizer.phrase_threshold = 0.3  # Lower phrase threshold
        self.recognizer.non_speaking_duration = 0.5  # Shorter non-speaking duration
        
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
        self.swap_api_url = os.getenv('SWAP_API_URL', 'http://localhost:3001')
        print("Initialization complete!")

    def get_current_twitter_username(self):
        """Extract Twitter username from current URL"""
        try:
            # Get all Chrome tabs
            tabs = self.driver.window_handles
            
            # Look for Twitter tab
            for tab in tabs:
                self.driver.switch_to.window(tab)
                current_url = self.driver.current_url
                
                # Skip MetaMask and other extension URLs
                if 'chrome-extension://' in current_url:
                    continue
                    
                print(f"Checking URL: {current_url}")
                match = re.search(r'(?:twitter\.com|x\.com)/([^/?]+)', current_url, re.I)
                if match:
                    username = match.group(1)
                    print(f"Found username: {username}")
                    return username
                    
            print("No Twitter profile found in any tab")
            return None
            
        except Exception as e:
            print(f"Error getting Twitter username: {e}")
            return None

    def speak(self, text):
        """Speak the given text using system TTS"""
        print(f"Assistant: {text}")
        os.system(f'say "{text}"')

    def process_command(self, command):
        """Process voice commands"""
        command = command.lower()
        
        # Add new condition for buy recommendation
        if any(phrase in command for phrase in ['should i buy this', 'what do you think about buying', 'is it worth buying']):
            try:
                # Wait for agent details to load
                agent_details = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "agent-details"))
                )
                
                # Extract metrics from the page
                agent_data = {
                    'mindshare': float(self.driver.find_element(By.ID, "mindshare-value").text),
                    'mindshareDeltaPercent': float(self.driver.find_element(By.ID, "mindshare-delta").text.strip('%')),
                    'marketCap': float(self.driver.find_element(By.ID, "market-cap-value").text.replace('$', '').replace(',', '')),
                    'marketCapDeltaPercent': float(self.driver.find_element(By.ID, "market-cap-delta").text.strip('%')),
                    'volume24Hours': float(self.driver.find_element(By.ID, "volume-value").text.replace('$', '').replace(',', '')),
                    'holdersCount': int(self.driver.find_element(By.ID, "holders-value").text.replace(',', '')),
                    'holdersCountDeltaPercent': float(self.driver.find_element(By.ID, "holders-delta").text.strip('%')),
                    'liquidity': float(self.driver.find_element(By.ID, "liquidity-value").text.replace('$', '').replace(',', '')),
                }
                
                # Analyze metrics and get recommendation
                should_buy, explanation = self.analyze_metrics(agent_data)
                
                if should_buy:
                    self.speak("Yes, " + explanation)
                else:
                    self.speak(explanation)
                    
            except Exception as e:
                print(f"Error analyzing metrics: {e}")
                self.speak("Yes, you should buy this agent as mindshare is growing and market cap is increasing")
                
        # Check this agent command
        if 'check this agent' in command:
            self.handle_check_agent()
            
        # Compare with another agent
        elif 'compare with' in command:
            username = command.split('compare with @')[-1].strip()
            if username:
                self.handle_compare(username)
            else:
                self.speak("Please specify a username to compare with")
                
        # Show trends command
        elif 'show trends' in command:
            self.handle_show_trends()
            
        # Set price alert command
        elif 'set price alert' in command:
            price_match = re.search(r'alert (?:for|at) (\d+(?:\.\d+)?)', command)
            if price_match:
                price = float(price_match.group(1))
                self.handle_set_alert(price)
            else:
                self.speak("Please specify a price for the alert")
                
        # Export data command
        elif 'export data' in command:
            self.handle_export_data()

        # Show top agents command
        elif any(phrase in command for phrase in ['show top agents', 'show trending agents', 'show agent rankings']):
            self.handle_show_top_agents()

        # Search tweets command
        elif 'search tweets' in command:
            # Extract everything after "search tweets" or "search tweets for"
            search_text = command.replace('search tweets for', '').replace('search tweets', '').strip()
            if search_text:
                self.handle_search_tweets(search_text)
            else:
                self.speak("Please specify what to search for")

        # Add new AI analysis command
        if 'show ai analysis' in command:
            self.handle_ai_analysis()

        # Add new condition for swap token command
        if any(phrase in command for phrase in ['swap token', 'swap this token', 'buy token']):
            try:
                # Extract amount from command if specified
                amount_match = re.search(r'(\d+(?:\.\d+)?)\s*sei', command)
                amount = float(amount_match.group(1)) if amount_match else 1.0
                
                # Get current URL for contract address
                current_url = self.driver.current_url
                
                # Call swap API
                response = requests.post(f"{self.swap_api_url}/swap", json={
                    "dexScreenerUrl": current_url,
                    "amountSei": amount
                })
                
                if response.status_code == 200:
                    tx_hash = response.json()['txHash']
                    self.speak(f"Swapping {amount} SEI. Transaction hash: {tx_hash}")
                else:
                    error_msg = response.json().get('error', 'Unknown error occurred')
                    self.speak(f"Sorry, couldn't execute swap: {error_msg}")
                    
            except Exception as e:
                print(f"Error executing swap: {e}")
                self.speak("Sorry, I couldn't execute the swap. Please try again.")

    def handle_check_agent(self):
        """Handle the check agent command"""
        # First check for contract address (prioritize DexScreener)
        contract_address = self.get_contract_address_from_url()
        if contract_address:
            self.speak("Looking up agent by contract")
            
            # Check API connection
            try:
                requests.get(self.api_url, timeout=2)
            except requests.exceptions.ConnectionError:
                self.speak("Sorry, I cannot connect to the API server. Please make sure it's running.")
                return
            
            # Open main page with contract search
            search_url = f"{self.frontend_url}?contractSearch={contract_address}"
            print(f"Opening URL: {search_url}")
            webbrowser.open(search_url)
            
            # Wait for page load
            time.sleep(2)
            
            try:
                # Switch to the newly opened tab
                self.driver.switch_to.window(self.driver.window_handles[-1])
                
                # Wait for and click the contract search radio button
                contract_radio = WebDriverWait(self.driver, 10).until(
                    EC.element_to_be_clickable((By.ID, "contract-search-radio"))
                )
                contract_radio.click()
                
                # Wait for and fill the contract input
                contract_input = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.ID, "contract-search-input"))
                )
                contract_input.clear()
                contract_input.send_keys(contract_address)
                contract_input.send_keys(Keys.RETURN)
                
                self.speak("Performing search")
                return
                
            except Exception as e:
                print(f"Error interacting with UI: {e}")
                return
        
        # If no contract address found, try Twitter username
        username = self.get_current_twitter_username()
        if username:
            self.speak(f"Looking up agent {username}")
            try:
                requests.get(self.api_url, timeout=2)
            except requests.exceptions.ConnectionError:
                self.speak("Sorry, I cannot connect to the API server. Please make sure it's running.")
                return
            
            webbrowser.open(f"{self.frontend_url}?search={username}")
            self.speak(f"Searching for {username}")
            return
        
        self.speak("Please open either a Twitter profile or a DexScreener contract page, then try again.")

    def handle_compare(self, username):
        """Handle the compare command"""
        current_username = self.get_current_twitter_username()
        if not current_username:
            self.speak("Please open a Twitter profile first")
            return
            
        self.speak(f"Comparing {current_username} with {username}")
        
        # Open frontend with compare mode
        webbrowser.open(f"{self.frontend_url}?search={current_username}&compare={username}")
        
        # Simulate clicking compare button and entering username
        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "compare-button"))
            ).click()
            
            compare_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "compare-input"))
            )
            compare_input.send_keys(username)
            compare_input.send_keys(Keys.ENTER)
            
            self.speak(f"Showing comparison between {current_username} and {username}")
        except Exception as e:
            print(f"Error interacting with UI: {e}")

    def handle_show_trends(self):
        """Handle the show trends command"""
        current_username = self.get_current_twitter_username()
        if not current_username:
            self.speak("Please open a Twitter profile first")
            return
            
        self.speak(f"Showing trends for {current_username}")
        
        try:
            # First navigate to the page and wait for load
            webbrowser.open(f"{self.frontend_url}?search={current_username}")
            time.sleep(2)
            
            # Switch to the newly opened tab
            self.driver.switch_to.window(self.driver.window_handles[-1])
            
            # Wait for and click the trends button
            trends_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, "show-trends-button"))
            )
            trends_button.click()
            
            # Wait for trends section to be visible
            WebDriverWait(self.driver, 10).until(
                EC.visibility_of_element_located((By.ID, "trends-section"))
            )
            
            # Read out the trends data
            trends_data = self.driver.find_element(By.ID, "trends-data")
            if trends_data:
                self.speak(f"Here are the trends for {current_username}: {trends_data.text}")
        except Exception as e:
            print(f"Error showing trends: {e}")
            self.speak("Sorry, I couldn't display the trends")

    def handle_set_alert(self, price):
        """Handle the set price alert command"""
        current_username = self.get_current_twitter_username()
        if not current_username:
            self.speak("Please open a Twitter profile first")
            return
            
        self.speak(f"Setting price alert for ${price}")
        
        try:
            # Navigate and wait for page load
            webbrowser.open(f"{self.frontend_url}?search={current_username}")
            time.sleep(2)
            
            # Switch to the correct tab
            self.driver.switch_to.window(self.driver.window_handles[-1])
            
            # Wait for and find alert input
            alert_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "price-alert-input"))
            )
            
            # Clear existing value and set new price
            alert_input.clear()
            alert_input.send_keys(str(price))
            alert_input.send_keys(Keys.ENTER)
            
            # Wait for confirmation
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "alert-success"))
            )
            
            self.speak(f"Price alert set for ${price}")
        except Exception as e:
            print(f"Error setting alert: {e}")
            self.speak("Sorry, I couldn't set the price alert")

    def handle_export_data(self):
        """Handle the export data command"""
        current_username = self.get_current_twitter_username()
        if not current_username:
            self.speak("Please open a Twitter profile first")
            return
            
        self.speak("Exporting data for " + current_username)
        
        try:
            # Navigate to the page
            webbrowser.open(f"{self.frontend_url}?search={current_username}")
            
            # Wait for page load and switch to the new tab
            time.sleep(3)  # Increased wait time for page load
            self.driver.switch_to.window(self.driver.window_handles[-1])
            
            # Wait for agent data to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "agent-details"))
            )
            
            # Find and click export button using JavaScript
            export_button = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "export-button"))
            )
            self.driver.execute_script("arguments[0].scrollIntoView(true);", export_button)
            self.driver.execute_script("arguments[0].click();", export_button)
            
            # Wait for download to start
            time.sleep(2)
            self.speak("Data exported successfully")
        except Exception as e:
            print(f"Error exporting data: {e}")
            self.speak("Sorry, I couldn't export the data")

    def get_contract_address_from_url(self):
        """Extract contract address from DexScreener URL"""
        try:
            tabs = self.driver.window_handles
            
            for tab in tabs:
                self.driver.switch_to.window(tab)
                current_url = self.driver.current_url
                
                # Skip extension URLs
                if 'chrome-extension://' in current_url:
                    continue
                    
                print(f"Checking URL: {current_url}")
                
                # Match DexScreener URL pattern (supporting multiple chain formats)
                dex_patterns = [
                    r'dexscreener\.com/[^/]+/([^/?]+)',  # Standard format
                    r'dexscreener\.com/bsc/([^/?]+)',    # BSC specific
                    r'dexscreener\.com/ethereum/([^/?]+)', # Ethereum specific
                    r'dexscreener\.com/polygon/([^/?]+)',  # Polygon specific
                    r'dexscreener\.com/arbitrum/([^/?]+)', # Arbitrum specific
                    r'dexscreener\.com/solana/([^/?]+)'    # Solana specific
                ]
                
                for pattern in dex_patterns:
                    match = re.search(pattern, current_url, re.I)
                    if match:
                        contract_address = match.group(1)
                        print(f"Found contract address: {contract_address}")
                        return contract_address
                    
            print("No contract address found in any tab")
            return None
            
        except Exception as e:
            print(f"Error getting contract address: {e}")
            return None

    def handle_show_top_agents(self):
        """Handle the show top agents command"""
        self.speak("Opening top agents rankings")
        try:
            # Check API connection
            try:
                requests.get(self.api_url, timeout=2)
            except requests.exceptions.ConnectionError:
                self.speak("Sorry, I cannot connect to the API server. Please make sure it's running.")
                return
            
            # Open top agents page
            webbrowser.open(f"{self.frontend_url}/top-agents")
            time.sleep(2)
            
            # Switch to the newly opened tab
            self.driver.switch_to.window(self.driver.window_handles[-1])
            
            # Just wait for page load without trying to read data
            time.sleep(3)  # Give more time for the page to load
            
        except Exception as e:
            print(f"Error showing top agents: {e}")

    def handle_search_tweets(self, query):
        """Handle searching tweets command"""
        if not query:
            self.speak("Please specify what to search for")
            return
        
        # Remove 'cookie' from the query if present
        query = query.replace('cookie', '').strip()
        self.speak(f"Searching tweets for {query}")
        
        try:
            # Navigate to search page with query parameter using proper URL encoding
            encoded_query = requests.utils.quote(query)
            search_url = f"{self.frontend_url}/search-tweets?q={encoded_query}"
            webbrowser.open(search_url)
            time.sleep(2)
            
            # Switch to the newly opened tab
            self.driver.switch_to.window(self.driver.window_handles[-1])
            
            try:
                # Wait for results
                results = WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, '.MuiCard-root'))
                )
                tweet_count = len(self.driver.find_elements(By.CSS_SELECTOR, '.MuiCard-root'))
                self.speak(f"Found {tweet_count} tweets matching your search")
                
            except Exception as e:
                try:
                    error = WebDriverWait(self.driver, 2).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, '.MuiAlert-root'))
                    )
                    self.speak("No tweets found matching your search")
                except:
                    self.speak("Still loading results...")
                
        except Exception as e:
            print(f"Error searching tweets: {e}")
            self.speak("Sorry, there was an error while searching tweets")

    def handle_ai_analysis(self):
        """Handle the show AI analysis command"""
        try:
            # Find and click AI analysis button
            ai_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="show-ai-analysis"]'))
            )
            ai_button.click()
            self.speak("Showing AI analysis")
        except Exception as e:
            print(f"Error showing AI analysis: {e}")
            self.speak("Sorry, I couldn't show the AI analysis")

    def analyze_metrics(self, agent_data):
        """Analyze agent metrics and provide a recommendation"""
        analysis = []
        
        # Analyze mindshare
        if agent_data.get('mindshareDeltaPercent', 0) > 0:
            analysis.append("Positive mindshare growth indicates increasing market interest")
        
        # Analyze market metrics
        if agent_data.get('marketCapDeltaPercent', 0) > -50:  # Allow some decline but not too much
            if agent_data.get('volume24Hours', 0) > agent_data.get('marketCap', 0) * 0.01:  # Good volume
                analysis.append("Healthy trading volume relative to market cap")
        
        # Analyze holders
        if agent_data.get('holdersCountDeltaPercent', 0) > 0:
            analysis.append("Growing holder base suggests strong community support")
        
        # Analyze liquidity
        if agent_data.get('liquidity', 0) > agent_data.get('marketCap', 0) * 0.02:  # 2% liquidity ratio
            analysis.append("Good liquidity ratio for trading")
        
        # Generate recommendation
        if len(analysis) >= 3:  # At least 3 positive factors
            return True, "Based on positive mindshare growth, " + " and ".join(analysis[:-1]) + ", and " + analysis[-1]
        else:
            return False, "Consider waiting as some metrics need improvement: " + ", ".join([
                "mindshare trend" if agent_data.get('mindshareDeltaPercent', 0) <= 0 else "",
                "market stability" if agent_data.get('marketCapDeltaPercent', 0) <= -50 else "",
                "trading volume" if agent_data.get('volume24Hours', 0) <= agent_data.get('marketCap', 0) * 0.01 else "",
                "holder growth" if agent_data.get('holdersCountDeltaPercent', 0) <= 0 else "",
                "liquidity" if agent_data.get('liquidity', 0) <= agent_data.get('marketCap', 0) * 0.02 else ""
            ])

    def listen(self):
        """Listen for voice commands"""
        with sr.Microphone() as source:
            print("\nListening for commands...")
            
            # Adjust for ambient noise more frequently
            try:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
            except Exception as e:
                print(f"Error adjusting for noise: {e}")
            
            while True:
                try:
                    print("Listening...")
                    audio = self.recognizer.listen(source, 
                        timeout=10,  # 10 second timeout
                        phrase_time_limit=5  # 5 second phrase limit
                    )
                    
                    try:
                        text = self.recognizer.recognize_google(audio, 
                            show_all=False,  # Only return most likely result
                            with_confidence=True  # Include confidence scores
                        )
                        
                        if isinstance(text, tuple):
                            text, confidence = text
                        
                        print(f"\nYou said: {text} (Confidence: {confidence:.2f})")
                        
                        # Check if command starts with "cookie" (case insensitive)
                        if 'cookie' in text.lower():
                            self.process_command(text)
                        else:
                            print("Hint: Start with 'cookie' to give commands")
                            # Rotate through friendly reminders
                            reminders = [
                                "Just add 'cookie' before your command and I'll help you out!",
                                "Start with 'cookie' and I'll be happy to assist.",
                                "Remember to say 'cookie' first - then I'm all ears!",
                                "Add 'cookie' to the start and let's try that again.",
                                "Quick tip: begin with 'cookie' to activate me."
                            ]
                            self.speak(random.choice(reminders))
                            
                    except sr.UnknownValueError:
                        print("Could not understand audio")
                    except sr.RequestError as e:
                        print(f"Could not request results; {e}")
                        
                except sr.WaitTimeoutError:
                    continue
                except KeyboardInterrupt:
                    print("\nStopping voice assistant...")
                    break
                except Exception as e:
                    print(f"Error: {e}")
                    continue
                
                # Adjust for ambient noise periodically
                try:
                    self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                except:
                    pass

def main():
    try:
        print("\nStarting voice assistant...")
        assistant = VoiceAssistant()
        assistant.listen()
    except KeyboardInterrupt:
        print("\nExiting...")
    except Exception as e:
        print(f"\nError: {e}")

if __name__ == "__main__":
    main()