const dai = {
  address: "0x6b175474e89094c44da98b954eedeac495271d0f",
  symbol: "DAI"
}
const eth = {
  address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  symbol: "ETH"
}

export const uniswapdYdXTest = {
  name: "Uniswap + DYDX LONG 1x",
  startDate: "2021-02-14T15:01:00.000Z",
  base: dai,
  under: eth,
  entryPrice: 1800,
  subpositions: [
    {
      type: "uniswap",
      marketAddress: "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11",
      base: {
        start: 1800,
        extra: 0
      },
      under: {
        start: 1,
        extra: 0
      },
      startLIQ: 30.67
    },
    {
      type: "dydx-long",
      base: {
        start: 0,
        extra: 0
      },
      under: {
        start: 1,
        extra: 0
      },
      collateralUNDER: 1, 
      borrowedBASE: 1800, 
      boughtUNDER: 1, 
      openingPrice: 1800
    }
  ],
  description: {
    text: "some text",
    links: []
  }
}

export const dydxShortTest = {
  name: "DYDX SHORT 1x",
  startDate: "2021-02-14T15:01:00.000Z",
  base: dai,
  under: eth,
  entryPrice: 1800,
  subpositions: [
    {
      type: "dydx-short",
      base: {
        start: 1800,
        extra: 0
      },
      under: {
        start: 0,
        extra: 0
      },
      collateralBASE: 1800,
      borrowedUNDER: 1,
      boughtBASE: 1800,
      openingPrice: 1800
    }
  ], 
  description: {
    text: "some text",
    links: []
  }
}

export const callOptionTest = {
  name: "C2000 Month away",
  startDate: "2021-05-01T15:01:00.000Z",
  base: dai,
  under: eth,
  entryPrice: 2800,
  subpositions: [
    {
      type: "option",
      base: {
        start: 1000,
        extra: 0
      },
      under: {
        start: 0,
        extra: 0
      },
      isCall: true, 
      isLong: true, 
      quantity: 1, 
      strike: 2000,
      daysToExpiry: 1,
      iv: 90,
      openingPrice: 2800,
    },
  ],
  /*description: {
    text: "some text",
    links: []
  }*/
}

export const putOptionTest = {
  name: "C2000 Month away",
  startDate: "2021-05-01T15:01:00.000Z",
  base: dai,
  under: eth,
  entryPrice: 2800,
  subpositions: [
    {
      type: "option",
      base: {
        start: 1000,
        extra: 0
      },
      under: {
        start: 0,
        extra: 0
      },
      isCall: true, 
      isLong: true, 
      quantity: 1, 
      strike: 2000,
      daysToExpiry: 1,
      iv: 90,
      openingPrice: 2800,
    },
  ],
  description: {
    text: "some text",
    links: []
  }
}