import Dexie from 'dexie'
import { Trip } from './trip'
import { Item } from './item'

export class GroceryDb {

    db: any

    constructor() {
        this.db = new Dexie('GroceryDB')
        this.db.version(1).stores({
            trips: '++id',
        })
        this.db.trips.mapToClass(Trip)
    }

    getTrip(id: number): Promise<Trip> {
        return this.db.trips.get(id).then(trip => {
            trip.items = trip.items.map(item => Item.fromObject(item))
            return trip
        })
    }

    putTrip(trip: Trip): Promise<number> {
        return this.db.trips.put(trip)
    }

}