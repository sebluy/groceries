import * as React from 'react'
import AsyncSelect from 'react-select/async'
import { Analysis } from './Analysis'
import { Item } from '../item'
import { Trip } from '../trip'
import { Food } from '../food'

export class TripView extends React.Component<any, any> {

    API_KEY: string = 'XJhL3a6dKg1b8xMzv5KA9GcuLLxmjeXFLfehyGbO'

    constructor(props) {
        super(props)
        console.log(props)
        this.state = {}
    }

    updateTrip(trip: Trip) {
        if (trip.allValid()) {
            trip.items.push(new Item)
        }
        this.props.db.putTrip(trip).then(id => {
            trip.id = id
            this.forceUpdate()
        })
    }

    render() {
        return (
            <div id="main">
                <h1>Groceries!</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Food Name</th>
                            <th>Amount</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.trip.items.map(this.renderItem.bind(this))}
                    </tbody>
                </table>
                <button onClick={this.analyze.bind(this)}>Analyze</button>
                {this.state.analysis ? <Analysis {...this.state.analysis}/> : ''}
            </div>
        )
    }

    renderItem(item: Item, i) {
        let trip = this.props.trip
        let errors =  !item.blank() && !item.valid() ? item.getErrors() : {}
        return (
            <tr key={i}>
                <td><AsyncSelect
                    isClearable={true}
                    loadOptions={this.searchFoods.bind(this)}
                    value={item.food}
                    className={errors.food ? 'error' : ''}
                    classNamePrefix="react-select"
                    onChange={(food) => {
                        item.food = food
                        this.updateTrip(trip)
                    }}
                /></td>
                <td><input
                    type="text"
                    value={item.amount.raw}
                    className={errors.amount ? 'error' : ''}
                    onChange={(e) => {
                        item.setAmount(e.target.value)
                        this.updateTrip(trip)
                    }}
                /></td>
                <td><input
                    type="number"
                    value={item.cost}
                    className={errors.cost ? 'error' : ''}
                    onChange={(e) => {
                        item.cost = e.target.value
                        this.updateTrip(trip)
                    }}
                /></td>
            </tr>
        )
    }

    post(url, data) {
        return fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
    }

    searchFoods(input: string) {
        // TODO: Do I need to rate limit this?
        // TODO: Move apiKey into some kind of config manager
        let url = `https://api.nal.usda.gov/fdc/v1/foods/list?api_key=${this.API_KEY}`
        return this.post(url, {query: input, pageSize: 10})
            .then(response => response.json())
            .then(data => {
                console.log(data)
                return data.map(item => {
                    return {value: item.fdcId, label: item.description}
                })
            })
    }

    analyze() {
        let items = this.props.trip.items
        items = items.filter(item => item.valid())
        let promises = items.map(async (row) => {
            let food = await this.lookupFood(row.food.value)
            return food.scale(row.amount)
        })
        Promise.all(promises).then(foods => {
            this.setState({analysis: this.generateAnalysis(foods as Array<Food>)})
        })
    }

    generateAnalysis(foods: Array<Food>) {
        let raw = []
        let rdi = []
        let rdiPerDay = []
        let rawTotal = Food.empty('Total')
        let rdiTotal = Food.empty('Total')
        let rdiPerDayTotal = Food.empty('Total')
        foods.forEach(food => {
            raw.push(food)
            rawTotal = rawTotal.add(food)

            let foodRDI = food.toRDI()
            rdi.push(foodRDI)
            rdiTotal = rdiTotal.add(foodRDI)
        })

        foods.forEach(food => {
            let foodRDI = food.toRDI()
            let foodRDIPerDay = foodRDI.scaleByFactor(1 / rdiTotal.calories)
            rdiPerDay.push(foodRDIPerDay)
            rdiPerDayTotal = rdiPerDayTotal.add(foodRDIPerDay)
        })
        raw.push(rawTotal)
        rdi.push(rdiTotal)
        rdiPerDay.push(rdiPerDayTotal)

        return {raw, rdi, rdiPerDay}
    }

    async lookupFood(id, useCache = true): Promise<Food> {
        let food
        if (useCache) {
            food = await this.props.db.getFood(id)
            if (food) return food
        }
        food = await this.fetchFood(id)
        await this.props.db.putFood(food)
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
