		
export default class dYdXLong {		
	constructor(collateralUNDER, borrowedBASE, boughtUNDER, openingPrice) {
		this.collateralUNDER = collateralUNDER;
		this.borrowedBASE = borrowedBASE;
		this.boughtUNDER = boughtUNDER;
		this.openingPrice = openingPrice;
	}

	// gets live market data via web3 
	async getMarketData(web3, position) {
		// do nothing for now
		console.log("dYdXLong market data loaded. ");
	}

	// gets current value in [BASE, UNDER]
	getCurrentValue(currentPrice) {
		let positionBASE = (this.collateralUNDER + this.boughtUNDER) * currentPrice - this.borrowedBASE;
		return [Math.max(0, positionBASE), Math.max(0, positionBASE) / currentPrice];
	}

	// gets opening value in [BASE, UNDER]
	getOpeningValue() {
		return [this.collateralUNDER * this.openingPrice, this.collateralUNDER];
	}
}		
