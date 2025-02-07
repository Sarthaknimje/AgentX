import Web3 from 'web3';
import NETWORKS from '../config/networks.js';

const ROUTER_ABI = [
  // Standard Uniswap V2 Router ABI
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

class SwapContract {
  constructor(network) {
    this.network = NETWORKS[network];
    this.web3 = new Web3(new Web3.providers.HttpProvider(this.network.rpcUrl));
    this.router = new this.web3.eth.Contract(ROUTER_ABI, this.network.routerAddress);
  }

  async swapTokens(tokenIn, tokenOut, amount, wallet) {
    const path = [tokenIn, tokenOut];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
    
    const tx = await this.router.methods.swapExactTokensForTokens(
      this.web3.utils.toWei(amount.toString()),
      0, // Accept any amount of tokens
      path,
      wallet.address,
      deadline
    ).send({
      from: wallet.address,
      gas: 250000,
      gasPrice: await this.web3.eth.getGasPrice()
    });
    
    return tx;
  }
}

export default SwapContract;