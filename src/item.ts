
export class Item {

    static VALID_UNITS: Array<string> = ['kg', 'g', 'lb', 'l', 'ml']

    public amount: any
    public food: any
    public cost: string

    constructor(food = null, amount = {raw: ''}, cost = '') {
        this.food = food
        this.amount = amount
        this.cost = cost
    }

    static fromObject(o) {
        return new Item(o.food, o.amount, o.cost)
    }

    valid() {
        return this.food !== null && this.amount.unit !== undefined
    }

    blank() {
        return this.food === null && this.amount.raw === '' && this.cost === ''
    }

    setAmount(raw: string) {
        this.amount = this.parseAmount(raw)
    }

    parseAmount(raw: string) {
        let parts = raw.split(' ')
        if (parts.length !== 2) return {raw}
        let number = parseFloat(parts[0])
        let unit = parts[1]
        if (Item.VALID_UNITS.indexOf(unit) === -1) return {raw}
        return {raw, number, unit}
    }

    getErrors() {
        let errors: any = {}
        if (this.food === null) errors.food = 'Food Name is required'
        if (this.amount.unit === undefined) errors.amount = 'Invalid Amount'
        return errors
    }

    clone() {
        return new Item({...this.food}, {...this.amount}, this.cost)
    }

}
