import { OptionMath } from './common.js'
export default class GammaOptions {		
	constructor(isCall, isLong, quantity, strike, daysToExpiry, iv) {
		this.isCall = isCall;
		this.isLong = isLong;
		this.quantity = quantity;
		this.strike = strike;
		this.daysToExpiry = daysToExpiry;
		this.iv = iv;
		this.optionMath = new OptionMath(); 
	}

	// gets live market data via web3 
	async getMarketData(web3, position) {
		// do nothing for now
		console.log("GammaOptions market data loaded. ");
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
	// passedDays - days that passed since 
	getCurrentValue(currentPrice, passedDays) {
		let currentValueBASE = this.quantity * this.optionMath.blackScholes(this.isCall ? 'call' : 'put', currentPrice, this.strike, (this.daysToExpiry - passedDays) / 365, 0.02, this.iv / 100);
		// long
		if(this.isLong) {
			return [currentValueBASE, currentValueBASE / currentPrice];
		}

		// short call
		if(this.isCall) {
			return [this.quantity * currentPrice - currentValueBASE, (this.quantity * currentPrice - currentValueBASE) / currentPrice];
		}
		
		// short put
		return [this.quantity * this.strike - currentValueBASE, (this.quantity * this.strike - currentValueBASE) / currentPrice];
	}
}		
