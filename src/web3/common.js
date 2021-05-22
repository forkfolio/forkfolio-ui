
		


// token addresses
export const daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
export const cdaiAddress = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
export const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const cusdcAddress = "0x39aa39c021dfbae8fac545936693ac917d5e7563";
export const batAddress = "0x0D8775F648430679A709E98d2b0Cb6250d2887EF";
export const sethAddress = "0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb";
export const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";		
export const compAddress = "0xc00e94cb662c3520282e6f5717214004a7f26888";
export const sushiAddress = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2";
export const alphaAddress = "0xa1faa113cbe53436df28ff0aee54275c13b40975";
export const ibethAddress = "0x67B66C99D3Eb37Fa76Aa3Ed1ff33E8e39F0b9c7A";
export const bacAddress = "0x3449FC1Cd036255BA1EB19d65fF4BA2b8903A69a";
export const wbtcAddress = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";

export const ustAddress = "0xa47c8bf37f92abed4a126bda807a7b7498661acd";
export const mmsftAddress = "0x41bbedd7286daab5910a1f15d12cbda839852bd7";
export const mgoogAddress = "0x59a921db27dd6d4d974745b7ffc5c33932653442";
export const mtwtrAddress = "0xedb0414627e6f1e3f082de65cd4f9c693d78cca9";



// uniswap v2 exchange addresses
export const uniswapV2DAIWETHAddress = "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11";
export const uniswapV2USDCWETHAddress = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc";
export const uniswapV2BATWETHAddress = "0xb6909b960dbbe7392d405429eb2b3649752b4838";
export const uniswapV2DAIUSDCAddress = "0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5";
export const uniswapV2ALPHAIBETHAddress = "0x411a9b902f364817a0f9c4261ce28b5566a42875";
export const uniswapV2USTmMSFTAddress = "0xeAfAD3065de347b910bb88f09A5abE580a09D655";
export const uniswapV2USTmGOOGAddress = "0x4b70ccD1Cf9905BE1FaEd025EADbD3Ab124efe9a";
export const uniswapV2USTmTWTRAddress = "0x34856be886A2dBa5F7c38c4df7FD86869aB08040";
export const uniswapV2DAIBACAddress = "0xd4405f0704621dbe9d4dea60e128e0c3b26bddbd";

export const sushiswapV2COMPETHAddress = "0x31503dcb60119a812fee820bb7042752019f2355";
export const sushiswapV2SUSHIETHAddress = "0x795065dcc9f64b5614c407a6efdc400da6221fb0";

export const inchV2DAIETHAddress = "0x7566126f2fd0f2dddae01bb8a6ea49b760383d5a";

export function getContractInstance(web3, abi, address) {			
	//console.log("Loading contract instance for address: " + address)
	return new web3.eth.Contract(abi, address);
}

/*export function checkBalances(market, balanceLPT) {
    let balanceETH = balanceLPT * market.poolUNDER / market.poolLIQ;
    let balanceToken = balanceLPT * market.poolBASE / market.poolLIQ;
    return [balanceETH, balanceToken];
}*/
  
export function debalanceETH(currentPrice, startBASE, ethTokens, daiTokens) {
    let diffDai = startBASE - daiTokens;
    let newETH = ethTokens - diffDai / currentPrice;
    
    return [newETH, startBASE];
  }
  
export function debalanceDAI(currentPrice, startUNDER, ethTokens, daiTokens) {
    let diffETH = startUNDER - ethTokens;
    let newDAI = daiTokens - diffETH * currentPrice;
    
    return [startUNDER, newDAI];
}

/**
 * @function
 * @description Deep clone a class instance.
 * @param {object} instance The class instance you want to clone.
 * @returns {object} A new cloned instance.
 */
export function clone(original) {
  var copied = Object.assign(
    Object.create(
      Object.getPrototypeOf(original)
    ),
    original
  );
  return copied;
}

//----------------- BLACK-SCHOLES -----------------------
/*
  PutCallFlag: Either "put" or "call"
  S: Stock Price
  X: Strike Price
  T: Time to expiration (in years)
  r: Risk-free rate
  v: Volatility
  This is the same one found in http://www.espenhaug.com/black_scholes.html
  but written with proper indentation and a === instead of == because it's
  faster, and it doesn't declare 5 useless variables (although if you really
  want to do it to have more elegant code I left a commented CND function in
  the end)
*/
export class OptionMath {
	blackScholes(PutCallFlag, S, X, T, r, v) {
	  let d1 = (Math.log(S / X) + (r + v * v / 2) * T) / (v * Math.sqrt(T));
	  let d2 = d1 - v * Math.sqrt(T);
	  if (PutCallFlag === "call") {
		return ( S * this.CND(d1)-X * Math.exp(-r * T) * this.CND(d2) );
	  } else {
		return ( X * Math.exp(-r * T) * this.CND(-d2) - S * this.CND(-d1) );
	  }
	}

	/* The cummulative Normal distribution function: */
	CND(x){
	  if(x < 0) {
		return ( 1-this.CND(-x) );
	  } else {
		let k = 1 / (1 + .2316419 * x);
		return ( 1 - Math.exp(-x * x / 2)/ Math.sqrt(2*Math.PI) * k * (.31938153 + k * (-.356563782 + k * (1.781477937 + k * (-1.821255978 + k * 1.330274429)))) );
	  }
	}
}