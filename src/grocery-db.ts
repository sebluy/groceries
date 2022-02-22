import Dexie from 'dexie'

export class GroceryDb {

    db: any

    constructor() {
        this.db = new Dexie('GroceryDB')
        this.db.version(1).stores({
            trips: '++id',
        })
    }

    getTrip(id: number): Promise<any> {
        return this.db.trips.get(id)
    }

    putTrip(trip: any) {
        return this.db.trips.put(trip)
    }

}