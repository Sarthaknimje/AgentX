# AgentX AI - Voice-Enabled AI Agent for DEX Trading

## Overview
AgentX AI is a voice-activated AI-powered trading assistant that enables users to **analyze, track, and trade tokens** on decentralized exchanges (DEXs) using natural language commands. By integrating **Cookie DataSwarm API**, **DexScreener**, and **DragonSwap**, TradeX AI brings real-time market insights and seamless trading to users.

## Features
- **Voice-Enabled AI Agent**: Activate TradeX AI from any screen by saying **"Hey AgentX"**.
- **Real-Time Token Analysis**: Fetches live **market trends**, **social engagement**, and **on-chain metrics** from Cookie DataSwarm API.
- **Seamless Trading**: Execute trades on **DragonSwap** using voice commands.
- **Automated Market Insights**: Provides real-time analysis, AI-powered sentiment detection, and price alerts.
- **Twitter and DexScreener Integration**: Fetches token-related insights directly from Twitter and DexScreener.
- **Graphical Representation**: Displays **interactive charts** based on token data for better visualization.

## Voice Commands Guide
| Command | Action |
|---------|--------|
| "cookie check this agent" | Fetches agent data from Twitter or DexScreener |
| "cookie compare with @username" | Compares an agent with another Twitter user |
| "cookie show trends" | Displays trend analysis and charts |
| "cookie set price alert for X" | Sets a price alert for a specified value |
| "cookie export data" | Exports agent data to a file |
| "cookie show top agents" | Lists top-ranking agents |
| "cookie search tweets for X" | Searches tweets based on query |
| "cookie show AI analysis" | Displays AI-powered analysis of token |
| "cookie swap this token" | Executes token swap on DragonSwap |
| "cookie should I buy this?" | Provides an AI-based recommendation |

## How TradeX AI Utilizes Cookie DataSwarm API
- **Token Analysis**: Fetches **price, volume, liquidity, market cap**, and **social engagement metrics**.
- **AI-Powered Insights**: Generates sentiment analysis and market trends using **real-time social data**.
- **Twitter & DexScreener Integration**: Directly fetches **token insights, influencers, and smart money movements**.
- **Automated Alerts**: Monitors token activity and sends **real-time alerts** on market changes.

## Web3 x AI Intersection
TradeX AI bridges **Web3 and AI** by creating a **smart trading assistant** that understands voice commands and interacts with decentralized data sources. This innovation transforms **DEX trading into an intuitive, hands-free experience**.

## Technical Documentation
- **Frontend**: React.js, WebSockets for real-time updates.
- **Backend**: Node.js, Express.js, integration with Cookie DataSwarm API.
- **Blockchain Integration**: Utilizes **DragonSwap contracts** to execute trades.
- **AI & NLP**: Uses **speech-to-text** and **natural language processing (NLP)** for command recognition.

## Future Plans
AgentX AI was built within a limited timeframe, but the vision is to **expand it across multiple blockchains**, improve **AI-powered risk assessment**, and introduce **more automated trading features**. The goal is to revolutionize **voice-enabled trading** in DeFi, making it more **accessible, efficient, and user-friendly**.

---
### Setup Instructions
1. Clone the repository:
   ```sh
   git clone https://github.com/sarthaknimje/agentx.git
   cd tradex-ai
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables (`.env` file):
   ```sh
   API_KEY=cb20ee63-6ad4-4cd0-a668-f6ef71789ad1
   ```
4. Run the project:
   ```sh
   npm start
   mode index.js
   node server.js
   give chrome access to debug : open -a 'Google Chrome' --args --remote-debugging-port=9222
   activate virtual env , run main.py
   
