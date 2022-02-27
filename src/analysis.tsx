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
        let foods = tripFoods.reduce((f1, f2) => f1.concat(f2))
        return analysis.generateAnalysis(foods)
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
            let foodRDIPerDay = foodRDI.scaleByFactor(1 / rdiTotal.calories)
            this.rdiPerDay.push(foodRDIPerDay)
            rdiPerDayTotal = rdiPerDayTotal.add(foodRDIPerDay)
        })
        this.raw.push(rawTotal)
        this.rdi.push(rdiTotal)
        this.rdiPerDay.push(rdiPerDayTotal)

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
                let nutrients = {}
                data.foodNutrients.forEach(nutrient => {
                    if (nutrient.nutrient.name === 'Energy' && nutrient.nutrient.unitName === 'kJ') return
                    nutrients[nutrient.nutrient.name] = nutrient.amount
                })
                return new Food({
                    id,
                    description: data.description,
                    amount: {raw: '100 g', number: 100, unit: 'g'},
                    calories: nutrients['Energy'] || 0,
                    carbohydrate: nutrients['Carbohydrate, by difference'] || 0,
                    protein: nutrients['Protein'] || 0,
                    fat: nutrients['Total lipid (fat)'] || 0,
                })
            })
    }

}
