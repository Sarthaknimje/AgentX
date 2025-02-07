require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const Web3 = require("web3");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DRAGONSWAP_ROUTER = "0x11DA6463D6Cb5a03411Dbf5ab6f6bc3997Ac7428"; // SwapRouter02 contract
const SEI_RPC_URL = "https://evm-rpc-testnet.sei-apis.com"; 
const web3 = new Web3(new Web3.providers.HttpProvider(SEI_RPC_URL));
const wallet = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(wallet);

// 🎯 Fetch contract address from DexScreener
async function fetchContractAddress(tokenUrl) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(tokenUrl);
  await page.waitForSelector("selector-for-contract-address"); // Update this based on DexScreener structure
  const contractAddress = await page.evaluate(() =>
    document.querySelector("selector-for-contract-address").textContent
  );
  await browser.close();
  return contractAddress.trim();
}

// 🎯 Swap function
async function swapTokens(tokenAddress, amount) {
  const contract = new web3.eth.Contract(
    [
      {
        inputs: [
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMin", type: "uint256" },
          { name: "path", type: "address[]" },
          { name: "to", type: "address" },
          { name: "deadline", type: "uint256" },
        ],
        name: "swapExactTokensForTokens",
        outputs: [{ name: "amounts", type: "uint256[]" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    DRAGONSWAP_ROUTER
  );

  const swapTx = contract.methods
    .swapExactTokensForTokens(
      web3.utils.toWei(amount, "ether"),
      0,
      [tokenAddress, "0xsei-wrapped-address"],
      wallet.address,
      Math.floor(Date.now() / 1000) + 60 * 10
    )
    .send({ from: wallet.address });

  return swapTx;
}

// 🎯 Voice-activated swap endpoint
app.post("/swap", async (req, res) => {
  try {
    const { tokenUrl, amount } = req.body;
    console.log(`Fetching contract from: ${tokenUrl}`);
    const tokenAddress = await fetchContractAddress(tokenUrl);
    console.log(`Contract found: ${tokenAddress}`);
    const tx = await swapTokens(tokenAddress, amount);
    res.json({ success: true, tx });
  } catch (error) {
    console.error("Error swapping:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
