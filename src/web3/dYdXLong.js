		
export default class dYdXLong {		
	constructor(ethCollateral, daiBorrowed, ethBought, openingPrice) {
		this.ethCollateral = ethCollateral;
		this.daiBorrowed = daiBorrowed;
		this.ethBought = ethBought;
		this.openingPrice = openingPrice;
	}

	// gets live market datavia web3 
	async getMarketData(web3, position) {
		// do nothing for now
		console.log("dYdXLong market data loaded. ");
	}

	// gets current value in [BASE, UNDER]
	getCurrentValue(currentPrice) {
		let positionDAI = (this.ethCollateral + this.ethBought) * currentPrice - this.daiBorrowed;
		return [Math.max(0, positionDAI), Math.max(0, positionDAI) / currentPrice];
	}

	// gets opening value in [BASE, UNDER]
	getOpeningValue() {
		return [this.ethCollateral * this.openingPrice, this.ethCollateral];
	}
}		
