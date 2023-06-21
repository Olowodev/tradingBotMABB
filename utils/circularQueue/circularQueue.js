class CircularQueue {
    constructor(capacity){
        this.items = new Array(capacity)
        this.capacity = capacity
        this.currentLength = 0
        this.rear = -1
        this.front = -1
    }

    isFull(){
        return this.currentLength === this.capacity
    }

    isEmpty(){
        return this.currentLength === 0
    }

    enqueue(element){
        if(!this.isFull()){
            this.rear = (this.rear + 1) % this.capacity
            this.items[this.rear] = element
            this.currentLength += 1
            if (this.front === -1) {
                this.front = this.rear
            }
        }
    }

    dequeue(){
        if(!this.isEmpty()) {
            const item = this.items[this.front]
            this.items[this.front] = null
            this.front = (this.front + 1) % this.capacity
            this.currentLength -= 1
            if(this.isEmpty()){
                this.front = -1
                this.rear = -1
            }
            return item
        }
        return null
    }

    peek(){
        if(!this.isEmpty()){
            return this.items[this.front]
        }
        return null
    }

    changeValue(index, value){
        if (index >= this.capacity ){
            return "does not exist"
        } else {
            if (this.items[index]) {
                this.items[index] = value
                return value
            } else {
                return "does not exist"
            }
        }
    }

    test(){
        console.log(this.items)
    }

    print(){
        // if(this.isEmpty()){
        //     console.log('Queue is empty')
        // } else {
        //     let i
        //     let str = ''
        //     for (i = this.front; i !== this.rear; i = (i + 1) % this.capacity) {
        //         str += this.items[i] + " "
        //     }
        //     str += this.items[i]
        //     console.log(str)
        // }

        if(this.isEmpty()){
            return []
        } else {
            let i
            let res = []
            for (i =this.front; i !== this.rear; i = (i + 1) % this.capacity) {
                res.push(this.items[i])
            }
            res.push(this.items[i])
            // console.log(res)
            return res
        }
    }
}

module.exports = CircularQueue