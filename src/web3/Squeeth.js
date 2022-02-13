		
export default class Squeeth {		
	constructor(quantity, isLong, apr, openingPrice) {
		this.quantity = quantity;
		this.isLong = isLong;
		this.apr = apr;
		this.openingPrice = openingPrice;
	}
	
	// gets live market data via web3 
	async getMarketData(web3, position) {
		// do nothing for now
		console.log("Squeeth market data loaded. ");
	}

	// when one of the members are updated, others can be updated here
	update(subpos, currentPrice) {
		let currentValue = this.getCurrentValue(currentPrice, 0)[0];
		if(this.isLong) {
			subpos.base.start = currentValue;
			subpos.under.start = 0;
		} else {
			if(this.isCall) {
				subpos.base.start = currentValue - this.quantity * currentPrice;
				subpos.under.start = this.quantity;
			} else {
				subpos.base.start = currentValue;
				subpos.under.start = 0;
			}
		}
	}

	// gets current value in [BASE, UNDER]
	getCurrentValue(currentPrice, passedDays) {
		let currentValueBASE = this.quantity * (currentPrice ** 2);
		return [currentValueBASE, currentValueBASE / currentPrice];
	}
}		
