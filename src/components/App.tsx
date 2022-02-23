import * as React from 'react'
import * as ReactDOM from 'react-dom'
import AsyncSelect from 'react-select/async'
import { Analysis } from './Analysis'
import { GroceryDb } from '../grocery-db'
import { Item } from '../item'
import { Trip } from '../trip'

export class App extends React.Component<any, any> {

    API_KEY: string = 'XJhL3a6dKg1b8xMzv5KA9GcuLLxmjeXFLfehyGbO'
    RDI = {
        calories: 2000,
        fat: 78,
        protein: 50,
        carbohydrate: 275,
    }

    db: GroceryDb

    constructor(props) {
        super(props);
        this.db = new GroceryDb()
        this.state = {
            trip: new Trip()
        }
    }

    async componentDidMount() {
        let trip = await this.db.getTrip(1)
        if (trip) {
            this.setState({trip: trip})
        }
    }

    updateTrip(trip: Trip) {
        if (trip.allValid()) {
            trip.items.push(new Item)
        }
        this.db.putTrip(trip).then(id => {
            trip.id = id
            this.setState({trip})
        })
    }

    render() {
        return (
            <div id="main">
                <h1>Groceries!</h1>
                <table>
                    <thead>
                        <tr>
                            <td>Food Name</td>
                            <td>Amount</td>
                            <td>Cost</td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.trip.items.map(this.renderItem.bind(this))}
                    </tbody>
                </table>
                <button onClick={this.analyze.bind(this)}>Analyze</button>
                {this.state.analysis ? <Analysis {...this.state.analysis}/> : ''}
            </div>
        )
    }

    renderItem(item: Item, i) {
        let trip = this.state.trip
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
        let items = this.state.trip.items
        items = items.filter(item => item.valid())
        let promises = items.map(async (row) => {
            return await this.lookupNutrition(row.food.value, row.amount)
        })
        Promise.all(promises).then((nutrition) => {
            let totalCalories = nutrition.reduce<number>((sum, v: any) => sum + v.calories, 0)
            let totalCarbohydrate = nutrition.reduce<number>((sum, v: any) => sum + v.carbohydrate, 0)
            let totalProtein = nutrition.reduce<number>((sum, v: any) => sum + v.protein, 0)
            let totalFat = nutrition.reduce<number>((sum, v: any) => sum + v.fat, 0)
            let daysOfFood = totalCalories / this.RDI.calories
            this.setState({analysis: {
                calories: totalCalories,
                daysOfFood:  daysOfFood,
                carbohydrate: totalCarbohydrate / daysOfFood / this.RDI.carbohydrate,
                protein: totalProtein / daysOfFood / this.RDI.protein,
                fat: totalFat / daysOfFood / this.RDI.fat,
            }})
        })
    }

    lookupNutrition(foodId, amount) {
        let url = `https://api.nal.usda.gov/fdc/v1/food/${foodId}?api_key=${this.API_KEY}`
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                let energy = data.foodNutrients.find(nutrient => nutrient.nutrient.name === 'Energy')
                let carbohydrate = data.foodNutrients.find(
                    nutrient => nutrient.nutrient.name === 'Carbohydrate, by difference'
                )
                let protein = data.foodNutrients.find(nutrient => nutrient.nutrient.name === 'Protein')
                let fat = data.foodNutrients.find(nutrient => nutrient.nutrient.name === 'Total lipid (fat)')
                return {
                    calories: this.scale(amount, energy.amount),
                    carbohydrate: this.scale(amount, carbohydrate.amount),
                    protein: this.scale(amount, protein.amount),
                    fat: this.scale(amount, fat.amount),
                }
            })
    }

    scale(amount, per100g) {
        let scaled = amount.number * per100g
        let unit = amount.unit
        if (unit === 'kg' || unit === 'l') {
            return scaled * 10
        } else if (unit === 'lb') {
            return scaled * 4.5359
        } else if (unit === 'g' || unit === 'ml') {
            return scaled / 100.0
        }
    }

}

ReactDOM.render(React.createElement(App), document.getElementById('react-root'))