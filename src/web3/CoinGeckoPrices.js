
		
class CoinGeckoPrices {		
    // gets usd prices from coingecko api
	getTokenPriceInUSD = async (address) => {	
		let url = "https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=" + address.toLowerCase() + "&vs_currencies=USD";
		const response = await fetch(url);
		const myJson = await response.json();
		if(myJson[address.toLowerCase()]) {
			return new Number(myJson[address.toLowerCase()].usd);
		}
			
		return 1;
	}
}		

export { CoinGeckoPrices };
