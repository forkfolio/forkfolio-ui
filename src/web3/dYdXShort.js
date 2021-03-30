		
export default class dYdXShort {		
	constructor(daiCollateral, ethBorrowed, daiBought, openingPrice) {
		this.daiCollateral = daiCollateral;
		this.ethBorrowed = ethBorrowed;
		this.daiBought = daiBought;
		this.openingPrice = openingPrice;
	}

	// gets live market datavia web3 
	async getMarketData(web3, position) {
		// do nothing for now
		console.log("dYdXShort market data loaded. ");
	}

	// gets current value in [BASE, UNDER]
	getCurrentValue(currentPrice) {
		let positionDAI = this.daiCollateral + this.daiBought - this.ethBorrowed * currentPrice;
		return [Math.max(0, positionDAI), Math.max(0, positionDAI) / currentPrice];
	}

	// gets opening value in [BASE, UNDER]
	getOpeningValue() {
		return [this.daiCollateral, this.daiCollateral / this.openingPrice];
	}
}		
