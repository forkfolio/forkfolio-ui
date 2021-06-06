const dai = {
  address: "0x6b175474e89094c44da98b954eedeac495271d0f",
  symbol: "DAI"
}
const eth = {
  address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  symbol: "ETH"
}

export const uniswapdYdXTest = {
  name: "(T) Uniswap + DYDX LONG 1x",
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
      liq: {
        start: 30.67,
        extra: 0
      }
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
      borrowedBASE: 1800, 
      boughtUNDER: 1, 
      openingPrice: 1800
    }
  ]
}

export const dydxShortTest = {
  name: "(T) DYDX SHORT 1x",
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
      borrowedUNDER: 1,
      boughtBASE: 1800,
      openingPrice: 1800
    }
  ]
}

export const callOptionTest = {
  name: "(T) C3200 26 days",
  startDate: "2021-05-01T15:01:00.000Z",
  base: dai,
  under: eth,
  entryPrice: 2900,
  subpositions: [
    {
      type: "option",
      base: {
        start: 183,
        extra: 0
      },
      under: {
        start: 0,
        extra: 0
      },
      isBuy: true,
      isCall: true, 
      isLong: true, 
      quantity: 1, 
      strike: 3200,
      daysToExpiry: 26,
      iv: 86
    },
  ]
}

export const shortCallOptionTest = {
  name: "(T) SHORT-C2700 26 days",
  startDate: "2021-05-01T15:01:00.000Z",
  base: dai,
  under: eth,
  entryPrice: 2700,
  subpositions: [
    {
      type: "option",
      base: {
        start: -387,
        extra: 0
      },
      under: {
        start: 1,
        extra: 0
      },
      isCall: true, 
      isLong: false, 
      quantity: 1, 
      strike: 2700,
      daysToExpiry: 26,
      iv: 135
    },
  ]
}

export const shortPutOptionTest = {
  name: "(T) SHORT-P2700 26 days",
  startDate: "2021-05-01T15:01:00.000Z",
  base: dai,
  under: eth,
  entryPrice: 2700,
  subpositions: [
    {
      type: "option",
      base: {
        start: 2700 - 382,
        extra: 0
      },
      under: {
        start: 0,
        extra: 0
      },
      isCall: false, 
      isLong: false, 
      quantity: 1, 
      strike: 2700,
      daysToExpiry: 26,
      iv: 135
    },
  ]
}

export const putOptionTest = {
  name: "(T) P2000 Month away",
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
      isCall: false, 
      isLong: true, 
      quantity: 1, 
      strike: 2000,
      daysToExpiry: 30,
      iv: 90
    },
  ]
}

export const uniswapv3Test = {
  name: "(T) Uniswap V3 + Puts",
  startDate: "2021-05-03T15:01:00.000Z",
  base: dai,
  under: eth,
  entryPrice: 3900,
  subpositions: [
    {
      type: "uniswapv3",
      base: {
        start: 1000,
        extra: 0
      },
      under: {
        start: 0,
        extra: 0
      },
      minPrice: 3900 * 0.8, 
      maxPrice: 3900 * 1.2, 
      feeInPercent: 0.3
    },
    {
      type: "option",
      base: {
        start: 107,
        extra: 0
      },
      under: {
        start: 0,
        extra: 0
      },
      isCall: false, 
      isLong: true, 
      quantity: 0.27, 
      strike: 3900,
      daysToExpiry: 30,
      iv: 90,
      openingPrice: 3900,
    }
  ]
}