import Dexie from 'dexie'
import { Trip } from './trip'
import { Item } from './item'
import { Food } from './food'

export class GroceryDb {

    db: any

    constructor() {
        this.db = new Dexie('GroceryDB')
        this.db.version(2).stores({
            trips: '++id',
            foods: 'id',
        })
        this.db.trips.mapToClass(Trip)
        this.db.foods.mapToClass(Food)
    }

    getTrip(id: number): Promise<Trip> {
        return this.db.trips.get(id).then(trip => {
            trip.items = trip.items.map(item => Item.fromObject(item))
            return trip
        })
    }

    getFood(id: number): Promise<Food> {
        return this.db.foods.get(id)
    }

    putFood(food: Food): Promise<number> {
        return this.db.foods.put(food)
    }

    putTrip(trip: Trip): Promise<number> {
        return this.db.trips.put(trip)
    }

}