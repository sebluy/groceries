import * as React from 'react'
import * as ReactDOM from 'react-dom'
import AsyncSelect from 'react-select/async'

export class App extends React.Component<any, any> {

    VALID_UNITS: Array<string> = ['kg', 'g', 'lb']
    API_KEY: string = 'XJhL3a6dKg1b8xMzv5KA9GcuLLxmjeXFLfehyGbO'

    constructor(props) {
        super(props);
        this.state = {
            rows: [
                this.defaultRow(),
                this.defaultRow(),
                this.defaultRow(),
            ]
        }
    }

    defaultRow() {
        return {amount: '', cost: ''}
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
                        {this.state.rows.map(this.renderRow.bind(this))}
                    </tbody>
                </table>
                <button onClick={this.analyze.bind(this)}>Analyze</button>
                <table>
                    <tbody>
                        <tr>
                            <td>Total Calories</td>
                            <td>{this.state.analysis && this.state.analysis.calories}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }

    renderRow(row, i) {
        return (
            <tr key={i}>
                <td><AsyncSelect
                    loadOptions={this.searchFoods.bind(this)}
                    value={row.food}
                    onChange={(food) => {
                        this.state.rows[i].food = food
                        this.setState(this.state)
                    }}
                /></td>
                <td><input
                    type="text"
                    value={row.amount}
                    onChange={(e) => {
                        this.state.rows[i].amount = e.target.value
                        this.setState(this.state)
                    }}
                /></td>
                <td><input
                    type="number"
                    value={row.cost}
                    onChange={(e) => {
                        this.state.rows[i].cost = e.target.value
                        this.setState(this.state)
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
        // Extract data and clean from state
        // Fetch nutrition info (add cache later)
        // Sum up info
        let rows = this.state.rows
        rows = rows.map(row => {
            return {...row, amount: this.parseAmount(row.amount)}
        })
        rows = rows.filter(row => {
            return row.food !== undefined && row.amount !== undefined
        })
        let promises = rows.map(async (row) => {
            return await this.lookupNutrition(row.food.value, row.amount)
        })
        Promise.all(promises).then((nutrition) => {
            let totalCalories = nutrition.reduce((sum, v: any) => sum + v.calories, 0)
            this.setState({analysis: {calories: totalCalories}})
        })
    }

    lookupNutrition(foodId, amount) {
        let url = `https://api.nal.usda.gov/fdc/v1/food/${foodId}?api_key=${this.API_KEY}`
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                let energy = data.foodNutrients.find(nutrient => nutrient.nutrient.name === 'Energy')
                return {calories: this.scale(amount, energy.amount)}
            })
    }

    scale(amount, per100g) {
        let scaled = amount.number * per100g
        if (amount.unit === 'kg') {
            return scaled * 10
        } else if (amount.unit === 'lb') {
            return scaled * 4.5359
        } else {
            return scaled / 100.0
        }
    }

    parseAmount(amount: string) {
        let parts = amount.split(' ')
        if (parts.length !== 2) return undefined
        let number = parseFloat(parts[0])
        let unit = parts[1]
        if (this.VALID_UNITS.indexOf(unit) === -1) return undefined
        return {number, unit}
    }

}

ReactDOM.render(React.createElement(App), document.getElementById('react-root'))