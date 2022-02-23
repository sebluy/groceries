import { Item } from './item'

export class Trip {

    public id: number
    public date: Date
    public items: Array<Item>

    constructor() {
        this.items = [new Item()]
    }

    allValid() {
        let invalid = this.items.find((item: Item) => !item.valid())
        return invalid === undefined
    }

}
