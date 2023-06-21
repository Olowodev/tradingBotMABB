const express = require('express')
const DerivAPIBasic = require('@deriv/deriv-api')
const WebSocket = require('ws')
const router = express.Router()

const connection = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${process.env.DERIVAPPID}`) 
const api = new DerivAPIBasic({ connection })
const tickStream = () => api.subscribe({ ticks: 'BOOM1000' })

const tickResponse = async (res) => {
    const data = JSON.parse(res.data)
    if(data.error !== undefined) {
        console.log('Error : ', data.error.message)
        connection.removeEventListener('message', tickResponse, false)
        await api.disconnect()
    }
    if (data.msg_type === 'tick') {
        console.log(data.tick)
    }
}

const subscribeTicks = async () => {
    await tickStream()
    connection.addEventListener('message', tickResponse)
}

const unsubscribeTicks = () => {
    connection.removeEventListener('message', tickResponse, false)
    tickStream().unsubscribe()
}


module.exports =  router