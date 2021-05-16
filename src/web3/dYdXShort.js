		
export default class dYdXShort {		
	constructor(collateralBASE, borrowedUNDER, boughtBASE, openingPrice) {
		this.collateralBASE = collateralBASE;
		this.borrowedUNDER = borrowedUNDER;
		this.boughtBASE = boughtBASE;
		this.openingPrice = openingPrice;
	}

	// gets live market data via web3 
	async getMarketData(web3, position) {
		// do nothing for now
		console.log("dYdXShort market data loaded. ");
	}

	// gets current value in [BASE, UNDER]
	getCurrentValue(currentPrice) {
		let positionBASE = this.collateralBASE + this.boughtBASE - this.borrowedUNDER * currentPrice;
		return [Math.max(0, positionBASE), Math.max(0, positionBASE) / currentPrice];
	}
}		
