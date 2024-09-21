		
export default class Long {		
	constructor(isLong, quantity, openPrice) {
		this.quantity = quantity;
		this.openPrice = openPrice;
	}
	
	// gets live market data via web3 
	async getMarketData(web3, position) {
		// do nothing for now
		console.log("Long market data loaded. ");
	}

	// when one of the members are updated, others can be updated here
	update(subpos, currentPrice) {
		// calculate collateral, borrowed and bought based on quantity
		//this.collateralUNDER = this.quantity;
		//this.borrowedBASE = this.quantity * currentPrice;
		//this.boughtUNDER = this.quantity;
	}

	// gets current value in [BASE, UNDER]
	getCurrentValue(currentPrice) {
		return [this.quantity * currentPrice, this.quantity];
	}
}		
