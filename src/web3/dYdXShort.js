		
export default class dYdXShort {		
	constructor(collateralBASE, quantity, borrowedUNDER, boughtBASE, openingPrice) {
		this.collateralBASE = collateralBASE;
		this.quantity = quantity;
		this.borrowedUNDER = borrowedUNDER;
		this.boughtBASE = boughtBASE;
		this.openingPrice = openingPrice;
	}

	// gets live market data via web3 
	async getMarketData(web3, position) {
		// do nothing for now
		console.log("dYdXShort market data loaded. ");
	}

	// when one of the members are updated, others can be updated here
	update(subpos, currentPrice) {
		// calculate collateral, borrowed and bought based on quantity
		this.collateralBASE = this.quantity * currentPrice;
		this.borrowedUNDER = this.quantity;
		this.boughtBASE = this.quantity * currentPrice;

		// todo: remove json, move everything to service, use it, don't duplicate
		subpos.base.start = this.quantity * currentPrice;
		subpos.borrowedUNDER = this.quantity;
		subpos.boughtBASE = this.quantity * currentPrice;
	}

	// gets current value in [BASE, UNDER]
	getCurrentValue(currentPrice) {
		let positionBASE = this.collateralBASE + this.boughtBASE - this.borrowedUNDER * currentPrice;
		return [Math.max(0, positionBASE), Math.max(0, positionBASE) / currentPrice];
	}
}		
