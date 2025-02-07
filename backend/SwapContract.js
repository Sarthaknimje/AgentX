import express from 'express';
import SwapContract from '../contracts/SwapContract.js';
import NETWORKS from '../config/networks.js';

const router = express.Router();

router.post('/swap', async (req, res) => {
  try {
    const { network, tokenAddress, amount } = req.body;
    
    if (!NETWORKS[network]) {
      return res.status(400).json({ error: 'Unsupported network' });
    }

    const swapContract = new SwapContract(network);
    const wallet = swapContract.web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
    
    const tx = await swapContract.swapTokens(
      NETWORKS[network].wrappedNativeToken,
      tokenAddress,
      amount,
      wallet
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

export default router;