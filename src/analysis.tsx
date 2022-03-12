import * as React from 'react'
import { Trip } from './trip'
import { Food } from './food'
import { GroceryDb } from './grocery-db'

interface Measure {
    foods: Map<string, Food>
    total: Food
}

export class Analysis {

    public foods: Map<string, Food>
    public measures: Map<string, Measure>

    private static API_KEY: string = 'XJhL3a6dKg1b8xMzv5KA9GcuLLxmjeXFLfehyGbO'
    private db: GroceryDb

    constructor(db) {
        this.db = db
    }

    static async analyzeTrips(db: GroceryDb, trips: Array<Trip>) {
        let analysis = new Analysis(db)
        await analysis.extractFoods(trips)
        return analysis.generateAnalysis()
    }

    mergeFoods(tripFoods: Array<Array<Food>>): Map<string, Food> {
        let foodMap = new Map<string, Food>()
        tripFoods.forEach(foods => {
            foods.forEach(food => {
                if (foodMap.has(food.description)) {
                    let existing = foodMap.get(food.description)
                    let merged = existing.add(food)
                    foodMap.set(food.description, merged)
                } else {
                    foodMap.set(food.description, food)
                }
            })
        })
        return foodMap
    }

    async extractFoods(trips: Array<Trip>): Promise<void> {
        let ps = trips.map(async (trip) => {
            let items = trip.items
            items = items.filter(item => item.valid())
            let promises = items.map(async (row) => {
                let food = await this.lookupFood(row.food.value)
                return food.scale(row.amount)
            })
            return await Promise.all(promises)
        })
        let tripFoods = await Promise.all(ps)
        this.foods = this.mergeFoods(tripFoods)
    }

    generateAnalysis() {
        let raw = new Map()
        let rdi = new Map()
        let rdiPerDay = new Map()
        let rawTotal = Food.empty('Total')
        let rdiTotal = Food.empty('Total')
        let dailyCalories = Food.RDI.get(Food.CALORIES)
        this.foods.forEach(food => {
            raw.set(food.description, food)
            rawTotal = rawTotal.add(food)

            let foodRDI = food.toRDI()
            rdi.set(food.description, foodRDI)
            rdiTotal = rdiTotal.add(foodRDI)

            let calories = food.nutrients.get(Food.CALORIES)
            let factor = calories === 0 ? 0 : dailyCalories / calories
            let foodRDIPerDay = foodRDI.scaleByFactor(factor)
            rdiPerDay.set(food.description, foodRDIPerDay)
        })

        let rdiPerDayTotal = rdiTotal.scaleByFactor(1 / rdiTotal.nutrients.get(Food.CALORIES))

        this.measures = new Map()
        this.measures.set(Food.MEASURES.RAW, {
            foods: raw,
            total: rawTotal,
        })
        this.measures.set(Food.MEASURES.RDI, {
            foods: rdi,
            total: rdiTotal,
        })
        this.measures.set(Food.MEASURES.RDI_PER_2000, {
            foods: rdiPerDay,
            total: rdiPerDayTotal
        })
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
        let url = `https://api.nal.usda.gov/fdc/v1/food/${id}?api_key=${Analysis.API_KEY}`
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
                        [Food.CALORIES,
                            nutrients.get('Energy') ||
                            nutrients.get('Energy (Atwater Specific Factors)') || 0],
                        [Food.CARBOHYDRATE, nutrients.get('Carbohydrate, by difference') || 0],
                        [Food.PROTEIN, nutrients.get('Protein') || 0],
                        [Food.FAT, nutrients.get('Total lipid (fat)') || 0],
                        [Food.ZINC, nutrients.get('Zinc, Zn') || 0],
                        [Food.IRON, nutrients.get('Iron, Fe') || 0],
                        [Food.OMEGA3, omega3],
                        [Food.CALCIUM, nutrients.get('Calcium, Ca') || 0],
                        [Food.SATURATED_FAT, nutrients.get('Fatty acids, total saturated') || 0],
                        [Food.CHOLESTEROL, nutrients.get('Cholesterol') || 0],
                        [Food.SODIUM, nutrients.get('Sodium, Na') || 0],
                        [Food.ADDED_SUGAR, nutrients.get('Added Sugar') || 0], // TODO
                        [Food.FIBER, nutrients.get('Fiber, total dietary') || 0],
                        [Food.VITAMIN_A, nutrients.get('Vitamin A, RAE') || 0],
                        [Food.VITAMIN_C, nutrients.get('Vitamin C, total ascorbic acid') || 0],
                        [Food.VITAMIN_D, nutrients.get('Vitamin D (D2 + D3)') || 0],
                        [Food.VITAMIN_E,
                            (nutrients.get('Vitamin E (alpha-tocopherol)') || 0) +
                            (nutrients.get('Vitamin E, added') || 0)
                        ],
                        [Food.VITAMIN_K, nutrients.get('Vitamin K (phylloquinone)') || 0],
                        [Food.THIAMIN, nutrients.get('Thiamin') || 0],
                        [Food.RIBOFLAVIN, nutrients.get('Riboflavin') || 0],
                        [Food.NIACIN, nutrients.get('Niacin') || 0],
                        [Food.PANTOTHENIC_ACID, nutrients.get('Pantothenic acid') || 0],
                        [Food.PYRIDOXINE, nutrients.get('Vitamin B-6') || 0],
                        [Food.BIOTINE, nutrients.get('Vitamin B-7') || 0],
                        [Food.FOLATE, nutrients.get('Folate, total') || 0],
                        [Food.VITAMIN_B12,
                            (nutrients.get('Vitamin B-12') || 0) +
                            (nutrients.get('Vitamin B-12, added') || 0)
                        ],
                        [Food.CHOLINE, nutrients.get('Choline, total') || 0],
                        [Food.COPPER, nutrients.get('Copper, Cu') || 0],
                        [Food.MAGNESIUM, nutrients.get('Magnesium, Mg') || 0],
                        [Food.MANGANESE, nutrients.get('Manganese, Mn') || 0],
                        [Food.PHOSPHORUS, nutrients.get('Phosphorus, P') || 0],
                        [Food.SELENIUM, nutrients.get('Selenium, Se') || 0],
                        [Food.POTASSIUM, nutrients.get('Potassium, K') || 0],
                        [Food.MOLYBDENUM, nutrients.get('Molybdenum') || 0], // TODO
                        [Food.IODINE, nutrients.get('Iodine') || 0], // TODO
                        [Food.CHROMIUM, nutrients.get('Chromium') || 0], // TODO
                        [Food.CHLORIDE, nutrients.get('Chloride') || 0], // TODO
                    ]),
                })
            })
    }

}
