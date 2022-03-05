import * as React from 'react'
import { Trip } from './trip'
import { Food } from './food'
import { GroceryDb } from './grocery-db'

export class Analysis {

    API_KEY: string = 'XJhL3a6dKg1b8xMzv5KA9GcuLLxmjeXFLfehyGbO'
    db: GroceryDb
    raw: Array<Food>
    rdi: Array<Food>
    rdiPerDay: Array<Food>
    nutrients: any

    constructor(db) {
        this.db = db
    }

    static async analyzeTrip(db: GroceryDb, trip: Trip) {
        let analysis = new Analysis(db)
        return analysis.generateAnalysis(await analysis.extractFoods(trip))
    }

    static async analyzeTrips(db: GroceryDb, trips: Array<Trip>) {
        let analysis = new Analysis(db)
        let ps = trips.map(trip => analysis.extractFoods(trip))
        let tripFoods = await Promise.all(ps)
        let foods = analysis.mergeFoods(tripFoods)
        return analysis.generateAnalysis(foods)
    }

    mergeFoods(tripFoods: Array<Array<Food>>): Array<Food> {
        let foodMap = new Map<number, Food>()
        tripFoods.forEach(foods => {
            foods.forEach(food => {
                if (foodMap.has(food.id)) {
                    let existing = foodMap.get(food.id)
                    let merged = existing.add(food)
                    foodMap.set(food.id, merged)
                } else {
                    foodMap.set(food.id, food)
                }
            })
        })
        return Array.from(foodMap.values())
    }

    async extractFoods(trip: Trip): Promise<Array<Food>> {
        let items = trip.items
        items = items.filter(item => item.valid())
        let promises = items.map(async (row) => {
            let food = await this.lookupFood(row.food.value)
            return food.scale(row.amount)
        })
        return await Promise.all(promises)
    }

    generateAnalysis(foods: Array<Food>) {
        this.raw = []
        this.rdi = []
        this.rdiPerDay = []
        let rawTotal = Food.empty('Total')
        let rdiTotal = Food.empty('Total')
        let rdiPerDayTotal = Food.empty('Total')
        foods.forEach(food => {
            this.raw.push(food)
            rawTotal = rawTotal.add(food)

            let foodRDI = food.toRDI()
            this.rdi.push(foodRDI)
            rdiTotal = rdiTotal.add(foodRDI)
        })

        foods.forEach(food => {
            let foodRDI = food.toRDI()
            let foodRDIPerDay = foodRDI.scaleByFactor(1 / rdiTotal.nutrients.get(Food.CALORIES))
            this.rdiPerDay.push(foodRDIPerDay)
            rdiPerDayTotal = rdiPerDayTotal.add(foodRDIPerDay)
        })
        this.raw.push(rawTotal)
        this.rdi.push(rdiTotal)
        this.rdiPerDay.push(rdiPerDayTotal)
        this.nutrients = {
            raw: rawTotal,
            rdi: rdiTotal,
            rdiPerDay: rdiPerDayTotal
        }
        return this
    }

    async lookupFood(id, useCache = true): Promise<Food> {
        let food
        if (useCache) {
            food = await this.db.getFood(id)
            if (food) return food
        }
        food = await this.fetchFood(id)
        await this.db.putFood(food)
        return food
    }

    fetchFood(id): Promise<Food> {
        let url = `https://api.nal.usda.gov/fdc/v1/food/${id}?api_key=${this.API_KEY}`
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                let nutrients = new Map()
                data.foodNutrients.forEach(nutrient => {
                    if (nutrient.nutrient.name === 'Energy' && nutrient.nutrient.unitName === 'kJ') return
                    nutrients.set(nutrient.nutrient.name, nutrient.amount)
                })
                console.log(nutrients)
                let omega3 =
                    (nutrients.get('PUFA 2:5 n-3 (EPA)') || 0) +
                    (nutrients.get('PUFA 18:3') || 0) +
                    (nutrients.get('PUFA 22:6 n-3 (DHA)') || 0)
                return new Food({
                    id,
                    description: data.description,
                    amount: {raw: '100 g', number: 100, unit: 'g'},
                    nutrients: new Map([
                        [Food.CALORIES, nutrients.get('Energy') || 0],
                        [Food.CARBOHYDRATE, nutrients.get('Carbohydrate, by difference') || 0],
                        [Food.PROTEIN, nutrients.get('Protein') || 0],
                        [Food.FAT, nutrients.get('Total lipid (fat)') || 0],
                        [Food.ZINC, nutrients.get('Zinc, Zn') || 0],
                        [Food.IRON, nutrients.get('Iron, Fe') || 0],
                        [Food.OMEGA3, omega3],
                        [Food.CALCIUM, nutrients.get('Calcium, Ca') || 0],
                    ]),
                })
            })
    }

}
