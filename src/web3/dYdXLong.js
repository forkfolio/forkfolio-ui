		
export default class dYdXLong {		
	constructor(collateralUNDER, quantity, borrowedBASE, boughtUNDER, openingPrice) {
		this.collateralUNDER = collateralUNDER;
		this.quantity = quantity;
		this.borrowedBASE = borrowedBASE;
		this.boughtUNDER = boughtUNDER;
		this.openingPrice = openingPrice;
	}
	
	// gets live market data via web3 
	async getMarketData(web3, position) {
		// do nothing for now
		console.log("dYdXLong market data loaded. ");
	}

	// when one of the members are updated, others can be updated here
	update(subpos, currentPrice) {
		// calculate collateral, borrowed and bought based on quantity
		this.collateralUNDER = this.quantity;
		this.borrowedBASE = this.quantity * currentPrice;
		this.boughtUNDER = this.quantity;

		// todo: remove json, move everything to service, use it, don't duplicate
		subpos.under.start = this.quantity;
		subpos.borrowedBASE = this.quantity * currentPrice;
		subpos.boughtUNDER = this.quantity; 
	}

	// gets current value in [BASE, UNDER]
	getCurrentValue(currentPrice) {
		let positionBASE = (this.collateralUNDER + this.boughtUNDER) * currentPrice - this.borrowedBASE;
		return [Math.max(0, positionBASE), Math.max(0, positionBASE) / currentPrice];
	}
}		
