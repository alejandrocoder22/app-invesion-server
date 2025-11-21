import pool from '../database/database.js'
import fetch from 'node-fetch'
import query from './query.js'
import YahooFinance from 'yahoo-finance2'

const yahooFinance = new YahooFinance()

const allNonUsaStocks = [
  { ticker: 'ENGH', symbol: 'ENGH.TO' },
  { ticker: 'CNR', symbol: 'CNR.TO' },
  { ticker: 'NEM', symbol: 'NEM.F' },
  { ticker: 'RMS', symbol: 'RMS.PA' },
  { ticker: 'MC', symbol: 'MC.PA' },
  { ticker: 'GAW', symbol: 'GAW.L' },
  { ticker: 'CWK', symbol: 'CWK.L' },
  { ticker: 'AOF', symbol: 'AOF.F' },
  { ticker: 'MELE', symbol: 'MELE.BR' },
  { ticker: 'ASML', symbol: 'ASML.AS', yahoo: true },
  { ticker: 'SL', symbol: 'SL.MI', yahoo: true },
  { ticker: 'AHT', symbol: 'AHT.L', yahoo: true },
  { ticker: 'HLMA', symbol: 'HLMA.L', yahoo: true },
  { ticker: 'ALFPC', symbol: 'ALFPC.PA', yahoo: true },
  { ticker: 'IMCD', symbol: 'IMCD.VI', yahoo: true },
  { ticker: 'RAA', symbol: 'RAA.SG', yahoo: true },
  { ticker: 'TRI', symbol: '0NX0.IL', yahoo: true },
  { ticker: 'MONC', symbol: 'MONC.MI', yahoo: true },
  { ticker: 'RACE', symbol: 'RACE.MI', yahoo: true },
  { ticker: 'KRX', symbol: 'KRX.IR', yahoo: true },
  { ticker: 'ASSA', symbol: 'ASSA-B.ST', yahoo: true },
  { ticker: 'EPI', symbol: 'EPI-A.ST', yahoo: true },
  { ticker: 'LIFCO', symbol: 'LIFCO-B.ST', yahoo: true },
  { ticker: 'ADDT', symbol: 'ADDT-B.ST', yahoo: true },
  { ticker: 'PGHN', symbol: 'PGHNZ.XC', yahoo: true },
  { ticker: 'RBT', symbol: '0R7.F', yahoo: true },
  { ticker: 'VID', symbol: 'VID.MC', yahoo: true },
  { ticker: 'OLVAS', symbol: 'OLVAS.HE', yahoo: true },
  { ticker: 'CSU', symbol: 'CNSWF', yahoo: true }
]
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const fetchIndividualPrice = async () => {
  try {
    for (const stock of allNonUsaStocks) {
      if (!stock.yahoo) {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=${process.env.ALPHA_VANTAGE_API}`
        let apiResponse = null

        try {
          const response = await fetch(url)

          if (!response.ok) {
            throw new Error(`Error en la solicitud para ${stock.ticker}: ${response.status}`)
          }

          const data = await response.json()
          apiResponse = data

          if (!data['Global Quote'] || !data['Global Quote']['05. price']) {
            await pool.query(
              'INSERT INTO api_error_logs (ticker, error_message, api_response) VALUES ($1, $2, $3)',
              [stock.ticker, 'No se encontró precio válido', JSON.stringify(data)]
            )
            console.log(`No se encontró precio válido para ${stock.ticker}. Respuesta de la API:`, data)
            continue
          }

          const price = Number(data['Global Quote']['05. price'])

          if (!price) {
            await pool.query(
              'INSERT INTO api_error_logs (ticker, error_message, api_response) VALUES ($1, $2, $3)',
              [stock.ticker, 'No se encontró precio', JSON.stringify(data)]
            )
            console.log(`No se encontró precio para ${stock.ticker}`)
            continue
          }
          if (stock.ticker === 'GAW') {
            await pool.query('UPDATE company_info SET price = $1 WHERE ticker = $2', [price / 100, stock.ticker])
          } else if (stock.ticker === 'CWK') {
            await pool.query('UPDATE company_info SET price = $1 WHERE ticker = $2', [price / 100, stock.ticker])
          } else {
            await pool.query('UPDATE company_info SET price = $1 WHERE ticker = $2', [price, stock.ticker])
          }

          console.log(`Precio actualizado para ${stock.ticker}: ${price}`)
          await delay(12000)
        } catch (innerError) {
          await pool.query(
            'INSERT INTO api_error_logs (ticker, error_message, api_response) VALUES ($1, $2, $3)',
            [stock.ticker, innerError.message, apiResponse ? JSON.stringify(apiResponse) : null]
          )
          console.log(`Error procesando ${stock.ticker}: ${innerError.message}`)
          continue // Continúa con el siguiente stock
        }
      }
    }
  } catch (outerError) {
    // Registrar errores generales fuera del bucle
    await pool.query(
      'INSERT INTO api_error_logs (ticker, error_message) VALUES ($1, $2)',
      [null, outerError.message] // Sin ticker si el error es general
    )
    console.log(`Error general: ${outerError.message}`)
    return outerError
  }
}

export const getForexPrices = async () => {
  const symbols = ['GBPUSD', 'USDCAD', 'EURUSD']

  for (const s of symbols) {
    const URI = `https://financialmodelingprep.com/stable/quote?symbol=${s}&apikey=${process.env.FINANCIAL_API}`
    const response = await fetch(URI)
    const data = await response.json()
    try {
      await query('UPDATE forex SET price = $1 WHERE symbol = $2', [data[0].price, data[0].symbol])
    } catch (error) {
      console.log(error)
    }
  }
}

export const getAllPrices = async () => {
  try {
    await getForexPrices() // Agrega await si es asíncrono

    const response = await fetch('https://api.invesion.com/stocks/tickers')
    const { data } = await response.json()

    const allTickers = data.map(item => item.ticker)
    const nonApiTickers = new Set(allNonUsaStocks.map(stock => stock.ticker))
    const filteredTickers = allTickers.filter(ticker => !nonApiTickers.has(ticker))

    for (const ticker of filteredTickers) {
      const URI = `https://financialmodelingprep.com/stable/profile?symbol=${ticker}&apikey=07ef9cce0d4f53fe3483e3673bcce82f`
      try {
        const response = await fetch(URI)
        const data = await response.json()

        if (data && data[0] && data[0].price) {
          await pool.query('UPDATE company_info SET price = $1 WHERE ticker = $2',
            [data[0].price, ticker])
        } else {
          console.warn(`No price data for ticker ${ticker}`)
        }

        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        await pool.query(
          'INSERT INTO api_error_logs (ticker, error_message) VALUES ($1, $2)',
          [ticker, error.message]
        )
        console.error(`Error processing ticker ${ticker}:`, error)
      }
    }

    console.log('All prices updated successfully')
  } catch (error) {
    console.error('Error in getAllPrices:', error)
    throw error
  }
}

function getRandomArbitrary (min, max) {
  return Math.random() * (max - min) + min
}

export const getYahooPrice = async () => {
  const yahooStocks = allNonUsaStocks.filter(s => s.yahoo)

  for (const s of yahooStocks) {
    try {
      const quote = await yahooFinance.quote(s.symbol)

      if (!quote.regularMarketPrice) {
        throw new Error('No price found for ticker')
      }

      let finalPrice = quote.regularMarketPrice

      // Aplicar conversión GBP si es necesario
      if (s.ticker === 'AHT' || s.ticker === 'HLMA') {
        const forexResponse = await fetch('https://api.invesion.com/stocks/forex')
        if (!forexResponse.ok) {
          throw new Error(`Forex API error: ${forexResponse.status}`)
        }
        const { data: forexData } = await forexResponse.json()
        const GBPUSD = forexData.find(item => item.symbol === 'GBPUSD')

        if (!GBPUSD) {
          throw new Error('GBPUSD rate not found')
        }

        finalPrice = (quote.regularMarketPrice / 100) * Number(GBPUSD.price)
      }

      await pool.query(
        'UPDATE company_info SET price = $1 WHERE ticker = $2',
        [finalPrice, s.ticker]
      )

      console.log(`${s.ticker}: Price: ${finalPrice} ${quote.currency}`)
    } catch (error) {
      await pool.query(
        'INSERT INTO api_error_logs (ticker, error_message) VALUES ($1, $2)',
        [s.ticker, error.message]
      )
      console.error(`Error fetching ${s.ticker}:`, error.message)
    }

    const dynamicDelay = getRandomArbitrary(12000, 30000)
    await delay(dynamicDelay)
  }
}

export const getYahooCurrencies = async () => {
  const currencies = [
    { ticker: 'CHFUSD', symbol: 'CHFUSD=X' }
  ]

  for (const s of currencies) {
    try {
      const quote = await yahooFinance.quote(s.symbol)

      if (!quote.regularMarketPrice) {
        throw new Error('No price found for ticker')
      }

      console.log(`${s.ticker}: Price: ${quote.regularMarketPrice} ${quote.currency}`)

      await pool.query(
        'UPDATE forex SET price = $1 WHERE symbol = $2',
        [quote.regularMarketPrice, s.ticker]
      )
    } catch (error) {
      await pool.query(
        'INSERT INTO api_error_logs (ticker, error_message) VALUES ($1, $2)',
        [s.ticker, error.message]
      )
      console.error(`Error fetching ${s.ticker}:`, error.message)
    }

    await delay(12000)
  }
}
