//import { CoinGeckoPrices } from './CoinGeckoPrices.js';
//import uniswapABI from "../abis/uniswapABI.json";
//import daiABI from "../abis/daiABI.json";
import { usdcAddress, getContractInstance } from './common.js'
import {
	abi as NFT_MANAGER_ABI,
	bytecode as NFT_MANAGER_BYTECODE,
  } from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
		
export default class UniswapV3 {		
	constructor(myBASE, myUNDER, openingPrice, minPrice, maxPrice, feeInPercent, poolID, ignoreImpermanentLoss) {
		this.myBASE = myBASE;             // user invested in BASE
		this.myUNDER = myUNDER;           // user invested in UNDER
		this.openingPrice = openingPrice; // price when liq position is opened
		this.minPrice = minPrice;
		this.maxPrice = maxPrice;
		this.feeInPercent = feeInPercent;
		this.poolID = poolID;
		this.ignoreImpermanentLoss = ignoreImpermanentLoss; 

		this.collectedFeesBASE = 0;
		this.collectedFeesUNDER = 0;
	}

	// gets pool sizes and prices from live market 
	async getMarketData(web3, position) {
		if(this.poolID > 0) {
			let managerInstance = getContractInstance(web3, NFT_MANAGER_ABI, "0xC36442b4a4522E871399CD717aBDD847Ab11FE88");
			let collectResult = await managerInstance.methods.collect(
				{
					tokenId: this.poolID,
					recipient: position.address,
					amount0Max: this.tokens(web3, 1000000000).toString(),
					amount1Max: this.tokens(web3, 1000000000).toString()
				}
			).call({ from: position.address });
			console.log(collectResult);
			//console.log(collectResult.amount0)
	
			// set collect fees
			this.collectedFeesBASE = collectResult.amount0 / 10 ** (collectResult.amount0.length >= 15 ? 18 : 6);
			this.collectedFeesUNDER = collectResult.amount1 / 10 ** (collectResult.amount1.length >= 15 ? 18 : 6);
	
			//let myposition = await managerInstance.methods.positions(47121).call();
			//console.log("Position on Uni3:")
			//console.log(myposition)
	
			console.log("UniswapV3 market data loaded");
		}
	}

	// when one of the members are updated, others can be updated here
	update(subpos, currentPrice) {
		// do nothing
	}

	// gets user balance in [BASE, UNDER] for given price 
	getCurrentValue(newPrice) {
		if(this.ignoreImpermanentLoss) {
			let newTotalBASE = this.myBASE + this.myUNDER * newPrice;
			let collectedFeesTotalBASE = this.collectedFeesBASE + this.collectedFeesUNDER * newPrice;
			return [newTotalBASE + collectedFeesTotalBASE, (newTotalBASE + collectedFeesTotalBASE) / newPrice]
		}

		// total in BASE amd total in UNDER
		this.openingTotalBASE = this.myBASE + this.myUNDER * this.openingPrice;

		this.token1V2 = this.openingTotalBASE / 2;
		this.token2V2 = this.token1V2 / this.openingPrice;
		this.L = Math.sqrt(this.token1V2 * this.token2V2);
		this.L2 = this.token1V2 * this.token2V2;
		this.T = this.L * Math.sqrt(this.minPrice);
		this.H = this.L / Math.sqrt(this.maxPrice);
		this.maxToken2 = this.L2 / this.H - this.T;
		this.maxToken1 = this.L2 / this.T - this.H;
		this.LP_a = this.openingPrice > this.maxPrice ? 0 : (this.L / Math.sqrt(this.openingPrice) - this.H) * this.openingPrice;
		this.LP_b = this.openingPrice > this.maxPrice ? this.maxToken2 : this.L * Math.sqrt(this.openingPrice) - this.T;
		this.LP = this.LP_a + this.LP_b;
		this.multiplier = this.openingPrice > this.minPrice ? this.openingTotalBASE / this.LP : this.openingTotalBASE / (this.openingPrice * this.maxToken1);

				
		let x, y, value; // x is BASE. y is UNDER
		if (newPrice < this.minPrice) {
			x = this.maxToken1 * this.multiplier;
			y = 0;
			value = x * newPrice;
		} else if (newPrice >= this.minPrice && newPrice <= this.maxPrice) {
			x = (this.L / Math.sqrt(newPrice) - this.H) * this.multiplier;
			y = (this.L * Math.sqrt(newPrice) - this.T) * this.multiplier;
			value = x * newPrice + y;
		} else if (newPrice > this.maxPrice) {
			x = 0;
			y = this.maxToken2 * this.multiplier;
			value = y;
		}

		return [value, value / newPrice];
	}

	tokens(web3, n) {
		return new web3.utils.BN(web3.utils.toWei(n.toString()));
	};
}		
