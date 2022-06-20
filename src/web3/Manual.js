		
export default class Manual {		
	constructor(startBASE, extraBASE, startUNDER, extraUNDER) {
		this.startBASE = startBASE;
		this.extraBASE = extraBASE;
		this.startUNDER = startUNDER;
		this.extraUNDER = extraUNDER;
	}

	// gets live market data via web3 
	async getMarketData(web3, position) {
		// do nothing for now
		console.log("Manual market data not needed to be loaded, skip. ");
	}

	// when one of the members are updated, others can be updated here
	update(subpos, currentPrice) {
		// do nothing
	}

	// gets current value in [BASE, UNDER]
	getCurrentValue(currentPrice) {
		let positionBASE = this.startBASE + this.startUNDER * currentPrice;
		return [positionBASE, positionBASE / currentPrice];
	}
}		
