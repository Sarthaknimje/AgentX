
const express = require("express");
const puppeteer = require("puppeteer");
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { SigningStargateClient } = require("@cosmjs/stargate");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const CHAIN_ID = "1328";
const RPC_ENDPOINT = "https://evm-rpc-testnet.sei-apis.com";
const SWAP_CONTRACT = "0x11DA6463D6Cb5a03411Dbf5ab6f6bc3997Ac7428"; // DragonSwap SwapRouter02

// Fetch contract address from DexScreener URL
async function getContractAddress(dexScreenerUrl) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(dexScreenerUrl);

    const contractAddress = await page.evaluate(() => {
        return document.querySelector(".contract-address-selector")?.innerText || null;
    });

    await browser.close();
    return contractAddress;
}

// Swap SEI for the given contract token
async function swapToken(walletMnemonic, recipientAddress, amountSei, tokenAddress) {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(walletMnemonic, { prefix: "sei" });
    const accounts = await wallet.getAccounts();
    const client = await SigningStargateClient.connectWithSigner(RPC_ENDPOINT, wallet);

    const msgSwap = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
            fromAddress: accounts[0].address,
            toAddress: SWAP_CONTRACT,
            amount: [{ denom: "usei", amount: (amountSei * 1_000_000).toString() }],
        },
    };

    const fee = {
        amount: [{ denom: "usei", amount: "5000" }],
        gas: "200000",
    };

    const result = await client.signAndBroadcast(accounts[0].address, [msgSwap], fee);
    return result.transactionHash;
}

app.post("/swap", async (req, res) => {
    try {
        const { dexScreenerUrl, amountSei } = req.body;
        const tokenAddress = await getContractAddress(dexScreenerUrl);

        if (!tokenAddress) {
            return res.status(400).json({ error: "Could not fetch contract address." });
        }

        const txHash = await swapToken(process.env.MNEMONIC, process.env.RECIPIENT_ADDRESS, amountSei, tokenAddress);
        res.json({ message: "Swap executed!", txHash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => console.log("Server running on port 3001"));
