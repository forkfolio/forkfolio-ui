import { CoinGeckoPrices } from './CoinGeckoPrices.js';
import { web3 }  from '../web3.min.js';
import * as uniswapABI from '../abis/uniswapABI.js';
import * as daiABI from '../abis/daiABI.js';
		
/*
	Idea was to create stackable components, for example combination of sushiswap with hegic. Each component would have inputs (what goes in) and outputs. 
	Also, it can have liq mining. Each function of a service would need to be implemented in js, for example like uniswap I have. Why would I do all that?
	I need it because I want to maximize my positions, and to automate data collection. 

	Maximize

	I want to plot return curves, so that I can find the best strategy. This is long term effort and will give huge results over long time.
	
	Automate

	1) Don't want to manually update positions
	2) Have a smart contract to automate investing
	3) if I am building 0x48 bot, I am going to need at least Uniswap, Sushiswap, and Balancer models.
*/

// token addresses
const daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
const cdaiAddress = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const cusdcAddress = "0x39aa39c021dfbae8fac545936693ac917d5e7563";
const batAddress = "0x0D8775F648430679A709E98d2b0Cb6250d2887EF";
const sethAddress = "0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb";
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";		
const compAddress = "0xc00e94cb662c3520282e6f5717214004a7f26888";
const sushiAddress = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2";
const alphaAddress = "0xa1faa113cbe53436df28ff0aee54275c13b40975";
const ibethAddress = "0x67B66C99D3Eb37Fa76Aa3Ed1ff33E8e39F0b9c7A";

const ustAddress = "0xa47c8bf37f92abed4a126bda807a7b7498661acd";
const mmsftAddress = "0x41bbedd7286daab5910a1f15d12cbda839852bd7";
const mgoogAddress = "0x59a921db27dd6d4d974745b7ffc5c33932653442";
const mtwtrAddress = "0xedb0414627e6f1e3f082de65cd4f9c693d78cca9";



// uniswap v2 exchange addresses
const uniswapV2DAIWETHAddress = "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11";
const uniswapV2USDCWETHAddress = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc";
const uniswapV2BATWETHAddress = "0xb6909b960dbbe7392d405429eb2b3649752b4838";
const uniswapV2DAIUSDCAddress = "0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5";
const uniswapV2ALPHAIBETHAddress = "0x411a9b902f364817a0f9c4261ce28b5566a42875";
const uniswapV2USTmMSFTAddress = "0xeAfAD3065de347b910bb88f09A5abE580a09D655";
const uniswapV2USTmGOOGAddress = "0x4b70ccD1Cf9905BE1FaEd025EADbD3Ab124efe9a";
const uniswapV2USTmTWTRAddress = "0x34856be886A2dBa5F7c38c4df7FD86869aB08040";

const sushiswapV2COMPETHAddress = "0x31503dcb60119a812fee820bb7042752019f2355";
const sushiswapV2SUSHIETHAddress = "0x795065dcc9f64b5614c407a6efdc400da6221fb0";

const inchV2DAIETHAddress = "0x7566126f2fd0f2dddae01bb8a6ea49b760383d5a";






let chart1, chart2;
let simETHPool, simDAIPool, simLPTPool, simETHDAIPrice, simLPTETHPrice, simLPTDAIPrice = 0;
let balancesETH = [], balancesTKN = [], uniswapTableSet = [], manualSet = [];	
let balancesAfter30DaysETH = [], balancesAfter30DaysTKN = [];
let optionMath = new OptionMath(); 
let daysPass = 30;

// functions
const delay = ms => new Promise(res => setTimeout(res, ms));

window.addEventListener('load', async () => {
	// Modern dapp browsers...
	if (window.ethereum) {
		window.web3 = new Web3(ethereum);
		try {
			await ethereum.enable();
			web3.eth.getAccounts(async (err, ret) => {

				for(let i = 0; i < ammPositions.length; i++) {
					await ammPositions[i].marketData.getMarketData(ammPositions[i])
					//await getMarketData(ammPositions[i]);
				}
				refreshUniswapPositions(ammPositions);

				let market = {};
				market.priceUNDERBASE = 120;
				refreshManualPositions(market)

				// show data
				showTableData();

				connectToSlider();
				createPresetButtons();
				console.log("done")
			});
		} catch (error) {
			console.err("There was an error: " + error);
		}
	}
	// Legacy dapp browsers...
	else if (window.web3) {
		window.web3 = new Web3(web3.currentProvider);
	}
	// Non-dapp browsers...
	else {
		console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
	}
});

/*async function getTokenPriceInUSD(address) {	
	let url = "https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=" + address.toLowerCase() + "&vs_currencies=USD";
	const response = await fetch(url);
	const myJson = await response.json();
	if(myJson[address.toLowerCase()]) {
		return new Number(myJson[address.toLowerCase()].usd);
	}
		
	return 1;
}*/

function getContractInstance(abi, address) {			
	let cnt =  web3.eth.contract(JSON.parse(abi));
	return cnt.at(address);
}

// gets pool sizes and prices from live market 
/*async function getMarketData(position) {
	let marketInstance = getContractInstance(uniswapABI, position.marketAddress);
	let baseInstance = getContractInstance(daiABI, position.addressBASE);
	let underInstance = getContractInstance(daiABI, position.addressUNDER);

	//var balance = await web3.eth.getBalance(position.marketAddress); //Will give value in.
	
	// get live data
	return new Promise((accept, reject) => {
		web3.eth.getBalance(position.marketAddress, (error, ethBalance) => {
			marketInstance.totalSupply((error, poolLPT) => {
				baseInstance.balanceOf(position.marketAddress, (error, poolBASE) => {
					underInstance.balanceOf(position.marketAddress, async (error, poolUNDER) => {

						let market = {};
						console.log(ethBalance / 10 ** 18)
						// if pool is using eth instead of weth
						if(poolUNDER / 10 ** 18 === 0 && ethBalance / 10 ** 18 > 0) {
							poolUNDER = ethBalance;
						}

						// save to position
						market.poolUNDER = poolUNDER / (position.addressUNDER !== usdcAddress ? 10 ** 18 : 10 ** 6);  
						market.poolLPT = poolLPT / 10 ** 18; 
						market.poolBASE = poolBASE / (position.addressBASE !== usdcAddress ? 10 ** 18 : 10 ** 6);
						
						market.priceLPTUNDER = market.poolUNDER / market.poolLPT;
						market.priceLPTBASE = market.poolBASE / market.poolLPT;
						market.priceUNDERBASE = market.poolBASE / market.poolUNDER;

						market.priceBASEUSD = await getTokenPriceInUSD(position.addressBASE);
						market.priceUNDERUSD = await getTokenPriceInUSD(position.addressUNDER);
						console.log("AMM market data loaded. " + position.symbolBASE + ": " + market.priceBASEUSD + " USD, " + position.symbolUNDER + ": " + market.priceUNDERUSD + " USD");

						position.marketData = market;

						// get LPT balances for all addresses
						// disable LPT for now
						/*for(let i = 0; i < positions.length; i++) {
							if(positions[i].currentLPT == undefined) {
								marketInstance.balanceOf(positions[i].address, (error, currentLPT) => {
									positions[i].currentLPT = currentLPT / 10 ** 18;
								});
							}
						}
						
						accept(1);
						return;
					});
				});
			});
		});
	});
}*/

function refreshUniswapPositions(positions) {
	for(let i = 0; i < positions.length; i++) {
		let market = positions[i].marketData;
		// time 
		let daysSinceStart = (new Date() - positions[i].startDate) / (1000 * 60 * 60 * 24);

		// calculate Ins
		let dydxInETH = positions[i].longPos[0] / positions[i].longPos[1];
		let totalInETH = positions[i].startUNDER + dydxInETH;
		let totalInTKN = positions[i].startBASE;
		
		// calculate Outs
		let uniswapOutETH = positions[i].currentLPT * market.priceLPTUNDER;
		let uniswapOutTKN = positions[i].currentLPT * market.priceLPTBASE;

		let dydxOutETH = getDyDxLongBalanceInETH(positions[i].longPos[0], positions[i].longPos[1], positions[i].longPos[2], market.priceUNDERBASE);

		let totalOutETH = uniswapOutETH + dydxOutETH + positions[i].extraUNDER;	
		let totalOutTKN = uniswapOutTKN + positions[i].extraBASE;
		let balanceTodayToken = totalOutETH * market.priceUNDERBASE + totalOutTKN;	
		
		// today
		let profitTodayToken = (totalOutETH - totalInETH) * market.priceUNDERBASE + (totalOutTKN - totalInTKN);				
		let profitPerMonthTodayToken = profitTodayToken * 30.4167 / daysSinceStart;						
		let aprToday = profitTodayToken / balanceTodayToken / daysSinceStart * 365 * 100;	

		// target token
		let maximumsToken = findPriceAndProfitForMaxToken(JSON.parse(JSON.stringify(market)), positions[i]);
		let targetPriceToken = maximumsToken[0];
		let profitTargetToken = maximumsToken[1];
		let balanceToken = totalInTKN + totalInETH * targetPriceToken;
		let profitPerMonthTargetToken = profitTargetToken * 30.4167 / daysSinceStart;	
		let aprTargetToken = profitTargetToken / balanceToken / daysSinceStart * 365 * 100;
		
		// target ETH
		let maximumsETH = findPriceAndProfitForMaxETH(JSON.parse(JSON.stringify(market)), positions[i]);
		let targetPriceETH = maximumsETH[0];
		let profitTargetETH = maximumsETH[1];
		let balanceETH = totalInETH + totalInTKN / targetPriceETH;
		let profitPerMonthTargetETH = profitTargetETH * 30.4167 / daysSinceStart;	
		let aprTargetETH = profitTargetETH / balanceETH / daysSinceStart * 365 * 100;

		// profits in (USD)
		let profitTargetETHUSD = profitTargetETH * targetPriceETH * market.priceBASEUSD;
		let profitTargetTokenUSD = positions[i].symbolBASE == "DAI" || positions[i].symbolBASE == "USDC" ? profitTargetToken * market.priceBASEUSD : profitTargetToken / targetPriceToken * market.priceUNDERUSD;
		let profitPerMonthTargetETHUSD = profitPerMonthTargetETH * targetPriceETH * market.priceBASEUSD;
		let profitPerMonthTargetTokenUSD = positions[i].symbolBASE == "DAI" || positions[i].symbolBASE == "USDC" ? profitPerMonthTargetToken * market.priceBASEUSD : profitPerMonthTargetToken / targetPriceToken * market.priceUNDERUSD;

		positions[i].maxProfitTargetUSD = Math.max(profitTargetETHUSD, profitTargetTokenUSD);
		positions[i].maxProfitPerMonthTargetUSD = Math.max(profitPerMonthTargetTokenUSD, profitPerMonthTargetETHUSD);

		// prepare dataset for table
		uniswapTableSet.push([
			positions[i].name, 
			positions[i].description, 
			(balanceTodayToken * market.priceBASEUSD).toFixed(0) + " USD",
			daysSinceStart.toFixed(0) + " days",
			market.priceUNDERBASE.toFixed(3) + " " + positions[i].symbolBASE, 
			(market.priceBASEUSD * profitTodayToken).toFixed(2) + " USD", 
			(market.priceBASEUSD * profitPerMonthTodayToken).toFixed(2) + " USD", 
			aprToday.toFixed(2) + "%", 
			targetPriceETH.toFixed(3) + " " + positions[i].symbolBASE + " <br>" + targetPriceToken.toFixed(3) + " " + positions[i].symbolBASE, 
			profitTargetETH.toFixed(2) + " " + positions[i].symbolUNDER + " (" + (profitTargetETHUSD).toFixed(0) + " USD), <br>" + profitTargetToken.toFixed(2) + " " + positions[i].symbolBASE + " (" + (profitTargetTokenUSD).toFixed(0) + " USD)", 
			profitPerMonthTargetETH.toFixed(2) + " " + positions[i].symbolUNDER + " (" + (profitPerMonthTargetETHUSD).toFixed(0) + " USD), <br> " + profitPerMonthTargetToken.toFixed(2) + " " + positions[i].symbolBASE+ " (" + (profitPerMonthTargetTokenUSD).toFixed(0) + " USD)", 
			aprTargetETH.toFixed(2) + "%"
		]);
		
		// update time and price
		if(positions[i].marketAddress === uniswapV2DAIWETHAddress) {
			document.getElementById("priceAndTime").innerHTML = "Price: " + market.priceUNDERBASE.toFixed(2) + " DAI - " + new Date().toLocaleString();  	
		}
	}
	console.log("Uniswap positions refreshed");
}

function refreshManualPositions(market) {
	let totalProfitTodayDAI = 0;
	for(let i = 0; i < manualPositions.length; i++) {
		// today price					
		let profitTodayDAI = (manualPositions[i].todayUNDER - manualPositions[i].startUNDER) * market.priceUNDERBASE + (manualPositions[i].todayBASE - manualPositions[i].startBASE);
		totalProfitTodayDAI += profitTodayDAI;
		
		let balanceTodayDAI = manualPositions[i].todayUNDER * market.priceUNDERBASE + manualPositions[i].todayBASE;
		let daysSinceStart = (new Date() - manualPositions[i].startDate) / (1000 * 60 * 60 * 24);					
		let aprToday = profitTodayDAI / balanceTodayDAI / daysSinceStart * 365 * 100;					
		let profitPerMonthTodayDAI = profitTodayDAI * 30 / daysSinceStart;
		
		
		manualSet[i] = [manualPositions[i].name, profitTodayDAI.toFixed(2), profitPerMonthTodayDAI.toFixed(2), aprToday.toFixed(2) + "%", manualPositions[i].expectedAPR, manualPositions[i].condition, manualPositions[i].description];
	}
	console.log("Manual positions refreshed");			
}

/*
*	Finds the price and profit at which uniswap + long position 
*	yield maximum token returns. 
*/
function findPriceAndProfitForMaxToken(market, position) {
	let startPrice = 0.1;
	let endPrice = 3000;	
	let maxProfitPrice = startPrice;			
	let maxBalanceDAI = -100000000000;
	let maxDebalanced;
	let totalInETH = position.startUNDER + position.longPos[0] / position.longPos[1];
	for(let i = startPrice; i < endPrice; i += 0.01) {
		setMarketPrice(market, i);

		// get uniswap balance
		let uniBalances = checkBalances(market, position.currentLPT);
		//console.log("optimum @" + i.toFixed(3) + ": " + uniBalances[0].toFixed(4) + " ETH + " + uniBalances[1].toFixed(4) + " COMP");

		// get dydx balance
		let longBalETH = getDyDxLongBalanceInETH(position.longPos[0], position.longPos[1], position.longPos[2], i);

		// debalance for max dai
		let debalanced = debalanceDAI(market, totalInETH, uniBalances[0] + longBalETH + position.extraUNDER, uniBalances[1] + position.extraBASE);
		//console.log("debalanced @" + i.toFixed(3) + ": " + debalanced[0].toFixed(4) + " ETH + " + debalanced[1].toFixed(4) + " COMP");
		if(maxBalanceDAI < debalanced[1]) {
			maxBalanceDAI = debalanced[1];
			maxProfitPrice = i;
			maxDebalanced = debalanced;
		}
	}			
	//console.log(position.name + ": max balance: " + maxBalanceDAI + " DAI: @" + maxProfitPrice);
	console.log(position.name + " for max TKN: " + maxDebalanced + " " + new Date());
	
	return [maxProfitPrice, maxBalanceDAI - position.startBASE];
}

/*
*	Finds the price and profit at which uniswap + long position 
*	yield maximum ETH returns. 
*/
function findPriceAndProfitForMaxETH(market, position) {
	let startPrice = 0.1;
	let endPrice = 3000;		
	let maxProfitPrice = startPrice;		
	let maxBalanceETH = -100000000000;
	let maxDebalanced;
	let totalInETH = position.startUNDER + position.longPos[0] / position.longPos[1];
	for(let i = startPrice; i < endPrice; i += 0.01) {
		setMarketPrice(market, i);

		// get uniswap balance
		let uniBalances = checkBalances(market, position.currentLPT);
		//console.log("ETH optimum @" + i + ": " + uniBalances[0].toFixed(4) + " ETH + " + uniBalances[1].toFixed(2) + " DAI");

		// get dydx balance
		let longBalETH = getDyDxLongBalanceInETH(position.longPos[0], position.longPos[1], position.longPos[2], i);

		// debalance for max dai
		let debalanced = debalanceETH(market, position.startBASE, uniBalances[0] + longBalETH + position.extraUNDER, uniBalances[1] + position.extraBASE);
		//console.log("Profit in DAI @" + i + ": " + ((debalanced[0] - position.startUNDER)  * i).toFixed(3) + " DAI = " + (debalanced[0] - position.startUNDER).toFixed(5) + " ETH")
		if(maxBalanceETH < debalanced[0]) {
			maxBalanceETH = debalanced[0];
			maxProfitPrice = i;
			maxDebalanced = debalanced;
		}
	}			
	//console.log(position.name + ": max balance: " + maxBalanceETH + " ETH: @" + maxProfitPrice);
	console.log(position.name + " for max ETH: " + maxDebalanced);
	
	return [maxProfitPrice, maxBalanceETH - totalInETH]; 
}

/*function getInputPrice(inputAmount, inputPool, outputPool) {
	return (inputAmount * outputPool) / (inputPool + inputAmount);
}

function setMarketPrice(market, newPrice) {
	//let inputPool = market.poolBASE;
	//let outputPool = market.poolUNDER;
	let k = market.poolBASE * market.poolUNDER;

	market.poolUNDER = Math.sqrt(k / newPrice);
	market.poolBASE = Math.sqrt(k * newPrice);
}*/

/*function addLiquidity(market, amountETH, amountToken) {
	let currentPrice = market.poolBASE / market.poolUNDER;
	//console.log("Add liquidity @" + currentPrice + ":" + amountETH + " ETH + " + amountToken + " Token");
	let amountLPT = amountETH * (market.poolLPT / market.poolUNDER);
	//console.log("LPT tokens created: " + amountLPT + " LPT");
	//console.log("Pool before: " + market.poolUNDER + " ETH + " + market.poolBASE + " Token");
	market.poolUNDER += amountETH;
	market.poolBASE += amountToken;
	market.poolLPT += amountLPT;
	//console.log("Pool after: " + market.poolUNDER + " ETH + " + market.poolBASE + " Token");
	return amountLPT;
}

function removeLiquidity(lptTokens) {
	//console.log("Someone remove liquidity with " + lptTokens + " LPT tokens");
	let priceLPTUNDER = simETHPool / simLPTPool;
	let priceLPTDAI = simDAIPool / simLPTPool;
	let ethTokens = lptTokens * priceLPTUNDER;
	let daiTokens = lptTokens * priceLPTDAI;
	//console.log("Pool before: " + simETHPool + " ETH + " + simDAIPool + " DAI");
	simETHPool -= ethTokens;
	simDAIPool -= daiTokens;
	simLPTPool -= lptTokens;
	//console.log("Pool after: " + simETHPool + " ETH + " + simDAIPool + " DAI");
	return [ethTokens, daiTokens];
}*/

function checkBalances(market, balanceLPT) {
	let balanceETH = balanceLPT * market.poolUNDER / market.poolLPT;
	let balanceToken = balanceLPT * market.poolBASE / market.poolLPT;
	return [balanceETH, balanceToken];
}

function getDyDxLongBalanceInETH(size, leverage, openPrice, currentPrice) {
	let depositETH = size / leverage;
	let marketBuyETH = size - depositETH;
	let debtDAI = marketBuyETH * openPrice;
	let currentDAI = size * currentPrice - debtDAI;
	let currentETH = currentDAI / currentPrice;

	return Math.max(0, currentETH);
}

function getDyDxShortBalanceInDAI(size, leverage, openPrice, currentPrice) {
	let depositDAI = size * openPrice / leverage;
	let marketBuyDAI = size * openPrice - depositDAI;
	let debtETH = marketBuyDAI / openPrice;
	let currentDAI = size * openPrice - debtETH * currentPrice;

	return Math.max(0, currentDAI);
}

function debalanceETH(market, startBASE, ethTokens, daiTokens) {
	let currentPrice = (market.poolBASE / market.poolUNDER);
	let diffDai = startBASE - daiTokens;
	let newETH = ethTokens - diffDai / currentPrice;
	
	return [newETH, startBASE];
}

function debalanceDAI(market, startUNDER, ethTokens, daiTokens) {
	let currentPrice = (market.poolBASE / market.poolUNDER);
	let diffETH = startUNDER - ethTokens;
	let newDAI = daiTokens - diffETH * currentPrice;
	
	return [startUNDER, newDAI];
}

function debalance(ratio, ethTokens, daiTokens) {
	let currentPrice = (simDAIPool / simETHPool);
	
	let totalInDAI = ethTokens * currentPrice + daiTokens;
	let newDAI = (ratio / (1 + ratio)) * totalInDAI;
	
	let newETH = (totalInDAI - newDAI) / currentPrice;
	
	return [newETH, newDAI];
}

function prepareChartData() {
	let uniswapProfitPercentage = new Number(document.getElementById("add_profit").value);

	console.log(">>>> Sim for 0% APR")
	prepareDataset(0, balancesETH, balancesTKN);
	console.log(">>>> Sim for " + uniswapProfitPercentage + "% APR")
	prepareDataset(uniswapProfitPercentage * daysPass / 365, balancesAfter30DaysETH, balancesAfter30DaysTKN);
}

function prepareDataset(apyPercentage, balanceArrayETH, balanceArrayTKN) {
	let market;
	for(let i = 0; i < ammPositions.length; i++) {
		if(ammPositions[i].marketAddress === uniswapV2USDCWETHAddress) {
			market = JSON.parse(JSON.stringify(ammPositions[i].marketData));
		}
	}
	let openPrice = (market.poolBASE / market.poolUNDER);
	
	// inputs for profit taking currency
	let e = document.getElementById("profit_taking_currency");
	let isTokenProfitTakingCurrency = e.options[e.selectedIndex].value == "token";

	// inputs for uniswap
	let uniswapInTKN = new Number(document.getElementById("uniswap_tkn").value);
	let uniswapInETH = new Number(document.getElementById("uniswap_eth").value);

	// inputs for dydx
	let dydxLongSize = new Number(document.getElementById("dydx_long_size").value);
	let dydxLongLeverage = new Number(document.getElementById("dydx_long_leverage").value);
	let dydxLongInETH = dydxLongSize / dydxLongLeverage;

	let dydxShortSize = new Number(document.getElementById("dydx_short_size").value);
	let dydxShortLeverage = new Number(document.getElementById("dydx_short_leverage").value);
	let dydxShortInTKN = dydxShortSize * openPrice / dydxShortLeverage;

	// inputs for options
	let option1Quantity = new Number(document.getElementById("option1_quantity").value);
	let e1 = document.getElementById("option1_call_put");
	let isOption1Call = e1.options[e1.selectedIndex].value;
	let option1Strike = new Number(document.getElementById("option1_strike").value);
	let option1DaysToExpiry = new Number(document.getElementById("option1_days_to_expiry").value);
	let option1Volatility = new Number(document.getElementById("option1_volatility").value);
	let option1InTKN = option1Quantity * optionMath.blackScholes(isOption1Call, openPrice, option1Strike, option1DaysToExpiry / 365, 0.02, option1Volatility / 100);
	console.log("Option1InTKN: " + option1InTKN)

	let option2Quantity = new Number(document.getElementById("option2_quantity").value);
	let e2 = document.getElementById("option2_call_put");
	let isOption2Call = e2.options[e2.selectedIndex].value;
	let option2Strike = new Number(document.getElementById("option2_strike").value);
	let option2DaysToExpiry = new Number(document.getElementById("option2_days_to_expiry").value);
	let option2Volatility = new Number(document.getElementById("option2_volatility").value);
	let option2InTKN = option2Quantity * optionMath.blackScholes(isOption2Call, openPrice, option2Strike, option2DaysToExpiry / 365, 0.02, option2Volatility / 100);
	console.log("option2InTKN: " + option2InTKN)

	let optionInETH = 0;

	// calculate totals In
	let totalInETH = uniswapInETH + dydxLongInETH + optionInETH;
	let totalInTKN = uniswapInTKN + dydxShortInTKN + option1InTKN + option2InTKN;

	console.log("Total in: " + totalInETH + " ETH + " + totalInTKN + " TKN + ");


	// rebalance before adding liquidity on uniswap
	let rebalancedTKN = (uniswapInTKN + uniswapInETH * openPrice) / 2;
	let rebalancedETH = rebalancedTKN / openPrice;
	console.log("Rebalanced: " + rebalancedETH + " ETH + " + rebalancedTKN + " TKN");
	let lptTokens = addLiquidity(market, rebalancedETH, rebalancedTKN);

	// apply uniswap profit
	market.poolBASE += market.poolBASE * apyPercentage / 100;
	market.poolUNDER += market.poolUNDER * apyPercentage / 100;

	balanceArrayETH.splice(0, balanceArrayETH.length);
	balanceArrayTKN.splice(0, balanceArrayTKN.length);
	let startPrice = 10, endPrice = 3000;
	let priceForMaxTKN = 0, priceForMaxETH = 0;	
	let maxBalanceETH = -1000000, maxBalanceTKN = -1000000;
	for(let i = startPrice; i < endPrice; i += 10) {
		setMarketPrice(market, i);

		// get uniswap
		let uniswapOuts = checkBalances(market, lptTokens);
		//console.log("Optimum @" + i + ": " + uniswapOuts[0].toFixed(4) + " ETH + " + uniswapOuts[1].toFixed(2) + " DAI");

		// get dydx
		let dydxOutETH = getDyDxLongBalanceInETH(dydxLongSize, dydxLongLeverage, openPrice, i);
		let dydxOutTKN = getDyDxShortBalanceInDAI(dydxShortSize, dydxShortLeverage, openPrice, i);

		// get options
		let optionOutETH = 0;
		let option1OutTKN = option1Quantity * optionMath.blackScholes(isOption1Call, i, option1Strike, (option1DaysToExpiry - daysPass) / 365, 0.02, option1Volatility / 100);
		//console.log("Option1 value @ " + i + ": " + option1OutTKN);
		let option2OutTKN = option2Quantity * optionMath.blackScholes(isOption2Call, i, option2Strike, (option2DaysToExpiry - daysPass) / 365, 0.02, option2Volatility / 100);
		//console.log("Option2 value @ " + i + ": " + option2OutTKN);

		// get totals Out
		let totalOutETH = uniswapOuts[0] + dydxOutETH + optionOutETH;
		let totalOutTKN = uniswapOuts[1] + dydxOutTKN + option1OutTKN + option2OutTKN;


		let debalanced;
		if (isTokenProfitTakingCurrency) {
			debalanced = debalanceDAI(market, totalInETH, totalOutETH, totalOutTKN);
		} else {
			debalanced = debalanceETH(market, totalInTKN, totalOutETH, totalOutTKN);
		}
			
		//console.log("Debalanced @" + i + ": " + debalanced[0].toFixed(4) + " ETH + " + debalanced[1].toFixed(2) + " DAI");
	
		balanceArrayETH.push({x: i, y: (debalanced[0] / totalInETH * 100).toFixed(2)});
		balanceArrayTKN.push({x: i, y: (debalanced[1] / totalInTKN * 100).toFixed(2)});

		// find maximums
		if(maxBalanceETH < debalanced[0]) {
			maxBalanceETH = debalanced[0];
			priceForMaxETH = i;
		}
		if(maxBalanceTKN < debalanced[1]) {
			maxBalanceTKN = debalanced[1];
			priceForMaxTKN = i;
		}
	}
	console.log("Max profit in ETH: " + maxBalanceETH + " @" + priceForMaxETH + " TKN");
	console.log("Max profit in TKN: " + maxBalanceTKN + " @" + priceForMaxTKN + " TKN");
}

function runSimulation() {
	console.log(" >>>>>> Start simulation..");
	prepareChartData();
	if(chart2 != null) {
		chart2.destroy();
		chart2 = null;
	}
				
	chart2 = plotChart2(); 
	console.log(" >>>>>> End simulation.");
}

function plotChart2() {
	var ctx2 = document.getElementById("myChart2");

	var myChart2 = new Chart(ctx2, {
		type: 'scatter',
		data: {
			datasets: [{
				label: "Balance ETH",
				borderColor: "rgba(53, 25, 25, 1)",
				backgroundColor: "rgba(53, 25, 25, 1)",
				data: balancesETH,
				fill: false
			}, {
				label: "Balance ETH (after selected days)",
				pointRadius: "2",
				borderColor: "rgba(53, 25, 25, 1)",
				backgroundColor: "rgba(53, 25, 25, 1)",
				data: balancesAfter30DaysETH,
				fill: false
			}, {
				label: "Balance DAI",
				borderColor: "rgba(249, 185, 76, 1)",
				backgroundColor: "rgba(249, 185, 76, 1)",
				data: balancesTKN,
				fill: false
			}, {
				label: "Balance DAI (after selected days)",
				pointRadius: "2",
				borderColor: "rgba(249, 185, 76, 1)",
				backgroundColor: "rgba(249, 185, 76, 1)",
				data: balancesAfter30DaysTKN,
				fill: false
			}]
		},
		options: {
			scales: {
				yAxes: [{ticks: {beginAtZero:false, max: 200, min: 0}}],
				xAxes: [{ticks: {beginAtZero:false, max: 3000}}]
			},
			options: {
				responsive: false,
				maintainAspectRatio: false,
			}
		}
	});
	
	return myChart2;
}

function createDataTable(id, dataSet) {
	let dataTable = $(id).DataTable( {
		data: dataSet,
		columns: [
			{ title: "Position" },
			{ title: "Share/Liquidation" },
			{ title: "Size" },
			{ title: "Active" },
			{ title: "@Current" },
			{ title: "Total Profit @Current" },
			{ title: "Monthly Profit @Current" },						
			{ title: "APR @Current" },
			{ title: "@Target" },
			{ title: "Total Profit @Target" },
			{ title: "Monthly Profit @Target" },					
			{ title: "APR @Target" }
		],
		columnDefs: [
			{
				targets: [2, 3, 4, 5, 6, 7, 8, 9, 10,11],
				className: 'dt-body-right'
			}
		],
		footerCallback: function ( row, data, start, end, display ) {
			var api = this.api(), data;
				
			// Total over all pages
			let total2 = api.column(3).data().reduce((a, b) => {
				return Number(a) + Number(b);
			}, 0);
			let total3 = api.column(4).data().reduce((a, b) => {
				return Number(a) + Number(b);
			}, 0);

			function sumColumn(column) {
				let sumA = 0;
				for(let i = 0; i < api.column(column).data().length; i++) {
					let splitted = api.column(column).data()[i].split(' ');
					sumA += parseFloat(splitted[0].trim());
				}
				
				return sumA.toFixed(2);
			};

			function sumColumn9() {
				let sumA = 0;
				for(let i = 0; i < ammPositions.length; i++) {
					sumA += ammPositions[i].maxProfitTargetUSD;
				}
				
				return sumA.toFixed(2);
			};

			function sumColumn10() {
				let sumA = 0;
				for(let i = 0; i < ammPositions.length; i++) {
					sumA += ammPositions[i].maxProfitPerMonthTargetUSD;
				}
				
				return sumA.toFixed(2);
			};
			
			function sumAll(column) {
				let sumA = 0, sumB = 0;
				for(let i = 0; i < api.column(column).data().length; i++) {
					let splitted = api.column(column).data()[i].split(',');
					sumA += parseFloat(splitted[0].trim());
					sumB += parseFloat(splitted[1].trim());
				}
				
				return sumA.toFixed(2) + ", " + sumB.toFixed(2);
			};
	
			// Update footer
			$(api.column(2).footer()).html(sumColumn(2) + " USD");
			$(api.column(5).footer()).html(sumColumn(5) + " USD");
			$(api.column(6).footer()).html(sumColumn(6) + " USD");
			$(api.column(9).footer()).html("max: " + sumColumn9() + " USD");
			$(api.column(10).footer()).html("max: " + sumColumn10() + " USD");
		}
	});
	
	return dataTable;
}

function showTableData() {		 						 
	$(document).ready(function() {
		let uniswapDAITable = createDataTable("#uniswap-table", uniswapTableSet);			
		
		let manualTable = $('#manual-table').DataTable( {
			data: manualSet,
			columns: [
				{ title: "Name" },
				{ title: "Total Profit Today [DAI]" },
				{ title: "Monthly Profit Today [DAI]" },		
				{ title: "Actual APR Today" },							
				{ title: "Expected APR" },						
				{ title: "Condition" },							
				{ title: "Size/Share/Liquidation" }
			],
			columnDefs: [
				{
					targets: [1, 2, 3],
					className: 'dt-body-right'
				}
			],
			footerCallback: function ( row, data, start, end, display ) {
				var api = this.api(), data;
					
				// Total over all pages
				let total1 = api.column(1).data().reduce((a, b) => {
					return Number(a) + Number(b);
				}, 0);
				let total2 = api.column(2).data().reduce((a, b) => {
					return Number(a) + Number(b);
				}, 0);
		
				// Update footer
				$(api.column(1).footer()).html(total1.toFixed(2));
				$(api.column(2).footer()).html(total2.toFixed(2));
			}
		});
	});
}

function showHidePlan(id) {
	var x = document.getElementById(id);
	if (x.style.display === "none") {
	x.style.display = "block";
	} else {
	x.style.display = "none";
	}
}

function calculateTarget() {
	var tokenSize = document.getElementById("token-size").value;
	var initialTarget = document.getElementById("initial-target").value;
	let ethSize = tokenSize / initialTarget;
	document.getElementById("targetToolResult").innerHTML = "RESULT: " + ethSize.toFixed(2) + " ETH needed to open position with target @" + initialTarget;
}

function connectToSlider() {
	var slider = document.getElementById("myRange");
	var output = document.getElementById("days_pass");
	output.innerHTML = slider.value;
	daysPass = slider.value;

	slider.oninput = function() {
		output.innerHTML = this.value;
		daysPass = this.value;
		runSimulation();
	}
}

function presetPositionToUIFill(index) {
	let position = positionPresets[index];
	document.getElementById("uniswap_eth").value = position.uniswap[0];
	document.getElementById("uniswap_tkn").value = position.uniswap[1];

	document.getElementById("dydx_long_size").value = position.long[0];
	document.getElementById("dydx_long_leverage").value = position.long[1];
	document.getElementById("dydx_short_size").value = position.short[0];
	document.getElementById("dydx_short_leverage").value = position.short[1];

	document.getElementById("option1_buy_sell").value = position.option1[0] ? "buy" : "sell";
	document.getElementById("option1_quantity").value = position.option1[1];
	document.getElementById("option1_call_put").value = position.option1[2] ? "call" : "put";
	document.getElementById("option1_strike").value = position.option1[3];
	document.getElementById("option1_days_to_expiry").value = position.option1[4];
	document.getElementById("option1_volatility").value = position.option1[5];

	document.getElementById("option2_buy_sell").value = position.option2[0] ? "buy" : "sell";
	document.getElementById("option2_quantity").value = position.option2[1];
	document.getElementById("option2_call_put").value = position.option2[2] ? "call" : "put";
	document.getElementById("option2_strike").value = position.option2[3];
	document.getElementById("option2_days_to_expiry").value = position.option2[4];
	document.getElementById("option2_volatility").value = position.option2[5];
}

function createPresetButtons() {
	let output = document.getElementById("preset_buttons_container");
	for(let i = 0; i < positionPresets.length; i++) {
		let btn1 = document.createElement("button");
		btn1.innerHTML = positionPresets[i].name;
		var att = document.createAttribute("onclick");
		att.value = "presetPositionToUIFill(" + i + ")"; 
		btn1.setAttributeNode(att); 
		output.appendChild(btn1);
	}
}
