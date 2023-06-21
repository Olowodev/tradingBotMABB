const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')
const boomRoute = require('./routes/boom1.js')
const DerivAPIBasic = require('@deriv/deriv-api/dist/DerivAPIBasic.js')
const WebSocket = require('ws')
const technicalIndicators = require('technicalindicators')
const LWMA = require('./utils/linearWeightedMA/LWMA.js')
const CircularQueue = require('./utils/circularQueue/circularQueue.js')
// const MetaApi = require('metaapi.cloud-sdk')
const axios = require('axios')



// const userRoute = require('./routes/user')
dotenv.config()

const url = "https://mt-client-api-v1.london.agiliumtrade.ai"

// metaApi.metatraderAccountApi.

const accountInfo = async () => {
    try {
        const res = await axios.get(`${url}/users/current/accounts/4edd3a3a-8ed1-4335-925a-bb6196f9308a/account-information`, {headers: {'auth-token': `${process.env.METAAPITOKEN}`}})
        console.log(res.data)
    } catch (err) {
        console.log(err)
    }
}

const getSymbols = async () => {
    try {
        const res = await axios.get(`${url}/users/current/accounts/4edd3a3a-8ed1-4335-925a-bb6196f9308a/symbols`, {headers: {'auth-token': `${process.env.METAAPITOKEN}`}})
        console.log(res.data)
    } catch (err) {
        console.log(err)
    }
}

const trade = async (profit, loss) => {
    try {
        const res = await axios.post(`${url}/users/current/accounts/4edd3a3a-8ed1-4335-925a-bb6196f9308a/trade`, {actionType: "ORDER_TYPE_SELL",  symbol: "Boom 1000 Index", volume: 1, takeProfit: profit, stopLoss: loss}, {headers: {'auth-token': `${process.env.METAAPITOKEN}`}})
        console.log(res.data)
        return res.data.positionId
    } catch (err) {
        console.log(err)
    }
}


const WMACQ = new CircularQueue(10)
const BB = technicalIndicators.BollingerBands
const WMA = technicalIndicators.WMA
let WMAvalues = [];
let LWMAvalues = []
const connection = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${process.env.DERIVAPPID}`) 
const api = new DerivAPIBasic({ connection })
const tickStream = async () => {api.ticksHistory({ ticks_history: 'BOOM1000', adjust_start_time: 1, style: 'candles', subscribe: 1, end: "latest" })}

const tickResponse = async (res) => {
    const data = JSON.parse(res.data)

    if(data.error !== undefined) {
        console.log('Error : ', data.error.message)
        connection.removeEventListener('message', tickResponse, false)
        await api.disconnect()
    }
    if(data.msg_type === 'ohlc') {
        // console.log(data.ohlc)
        // console.log(data.ohlc.epoch)
        const date = new Date(data.ohlc.epoch * 1000)
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const seconds = date.getSeconds()
        // console.log(`${hours}:${minutes}:${seconds}`)
        // console.log(date)
        if (seconds % 59 === 0) {
            // console.log('test')
            const open = data.ohlc.open
            const close = data.ohlc.close
            // console.log(data.ohlc)
            // console.log({open, close})
            if (close > open) {
                console.log(data.ohlc)
                console.log('spike')
                const res = await trade(parseFloat(close) - 2, parseFloat(close) + 2)
                console.log('trade placed')
            }//11:00
        }
    }
}
// const tickResponse = async (res) => {
//     // console.log('connection')
//     let quote;
//     let open;
//     let close;
//     let high;
//     let low;
//     let weightedClose;
//     const data = JSON.parse(res.data)

//     const calculate = () => {
//         WMAvalues = WMACQ.print()
//             console.log(WMAvalues)
//             console.log({high, open, low, close})
//             console.log({"LWMA": LWMA(10, WMAvalues), "time": data.ohlc})
//     }
//     // console.log(data)
//     if(data.error !== undefined) {
//         console.log('Error : ', data.error.message)
//         connection.removeEventListener('message', tickResponse, false)
//         await api.disconnect()
//     }
//     if (data.msg_type === 'ohlc') {
//         // console.log(data.ohlc)
//         if (WMACQ.currentLength >= 9) {
//             open = data.ohlc.open
//             close = data.ohlc.close
//             high = data.ohlc.high
//             low = data.ohlc.low
//             weightedClose = (parseFloat(high) + parseFloat(low) + (2 * parseFloat(close)))/4 
//             if(WMACQ > 9) {
//             WMACQ.changeValue(9, weightedClose)
//             } else {
//                 WMACQ.enqueue(weightedClose)
//             }
//             calculate()
//         } else {
//         if (data.ohlc.epoch % 60 === 0 ) {
//         open = data.ohlc.open
//         close = data.ohlc.close
//         high = data.ohlc.high
//         low = data.ohlc.low
//         // console.log(close)
//         // console.log(parseFloat(close))
//         weightedClose = (parseFloat(high) + parseFloat(low) + (2 * parseFloat(close)))/4 
//         if(WMACQ.isFull()){
//             WMACQ.dequeue()
//             WMACQ.enqueue(weightedClose)
//         } else {
//             WMACQ.enqueue(weightedClose)
//         }
        
//     }
// }
//         // console.log(WMA.calculate({period: 10, values: WMAvalues}))
//     }
//     // console.log(weightedClose)
    
//     // console.log(WMAvalues)
//     // console.log((BB.calculate({period: 5, stdDev: 0.5, values})))
//     // console.log(data.tick)
// }

const subscribeTicks = async () => {
    // console.log('subscribed')
    await tickStream()
    connection.addEventListener('message', tickResponse)
}

const unsubscribeTicks = () => {
    connection.removeEventListener('message', tickResponse, false)
    tickStream().unsubscribe()
}

subscribeTicks()

// const values = CQ.print()

// mongoose
//     .connect(process.env.MONGO_URL, {
//         useUnifiedTopology: true,
//         useNewUrlParser: true
//     })
//     .then(() => console.log('DB Connection successful'))
//     .catch((err) => {
//         console.log(err)
//     })

    app.use(express.json())
    app.use(cors())
    // app.use('/api/user', userRoute)
    app.use('/boom1000', boomRoute)


    // const metaApi = new MetaApi(process.env.METAAPITOKEN)
    // console.log(metaApi.metatraderAccountApi.getAccounts())

    app.listen(process.env.PORT || 5000, () => {
        console.log(`backend server is running on ${process.env.PORT}`)
    })