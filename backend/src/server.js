const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const NETWORKS = require('../../src/networks/config').default;

const app = express();
app.use(cors());
app.use(express.json());

app.post('/swap', async (req, res) => {
  try {
    const { network, tokenIn, tokenOut, amount, slippage } = req.body;
    
    if (!NETWORKS[network]) {
      return res.status(400).json({ error: 'Unsupported network' });
    }

    const wallet = new ethers.Wallet(
      process.env[`${network.toUpperCase()}_PRIVATE_KEY`],
      new ethers.providers.JsonRpcProvider(NETWORKS[network].rpcUrl)
    );

    const swapService = new SwapService(network);
    const tx = await swapService.swapExactTokensForTokens(
      tokenIn,
      tokenOut,
      amount,
      wallet,
      slippage || NETWORKS[network].defaultSlippage
    );

    res.json({
      success: true,
      txHash: tx.transactionHash,
      explorer: `${NETWORKS[network].explorer}/tx/${tx.transactionHash}`
    });
  } catch (error) {
    console.error('Swap error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
