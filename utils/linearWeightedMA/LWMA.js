const LWMA = function (period, values) {
    const result = []
    const weights = Array.from({ length: period }, (_, i) => i + 1)
    const sumWeights = weights.reduce((sum, weight) => sum + weight, 0)
    if (period > 0){
        for (let i = period - 1; i < values.length; i++) {
            let sum = 0
            for (let j = 0; j < period; j++){
                const weight = weights[j]
                sum += values[i - period + 1 + j] * weight
            }
            const lwma = sum / sumWeights
            result.push(lwma)
        }
    }
    
    return result
}

module.exports = LWMA