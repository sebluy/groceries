import { Item } from './item'

export class Trip {

    public id: number
    public date: any
    public items: Array<Item>

    constructor() {
        this.items = [new Item()]
        this.date = {raw: ''}
    }

    allValid() {
        let invalid = this.items.find((item: Item) => !item.valid())
        return invalid === undefined
    }

    mapItemsToClass() {
        this.items = this.items.map(item => Item.fromObject(item))
    }

    setDate(raw: string) {
        this.date = {raw}
        let value = new Date(raw)
        let valid = value instanceof Date && !isNaN(value.getTime())
        this.date.value = valid ? value : undefined
    }

    getErrors() {
        let errors: any = {}
        let validDate = this.date.raw !== undefined && this.date.value === undefined
        if (validDate) errors.date = 'Invalid Date'
        return errors
    }

    static allItems(trips: Array<Trip>): Array<Item> {
        let itemMap = new Map<string, Item>()
        trips.forEach(trip => {
            trip.items.forEach(item => {
                if (!item.valid()) return
                itemMap.set(item.food.label, item)
            })
        })
        return [...itemMap.values()]
            .sort((i1, i2) => i1.food.label.localeCompare(i2.food.label))
    }

}
