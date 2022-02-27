import * as React from 'react'
import AsyncSelect from 'react-select/async'
import { AnalysisTable} from './AnalysisTable'
import { Analysis } from '../analysis'
import { Item } from '../item'
import { Trip } from '../trip'

export class TripView extends React.Component<any, any> {

    API_KEY: string = 'XJhL3a6dKg1b8xMzv5KA9GcuLLxmjeXFLfehyGbO'

    constructor(props) {
        super(props)
        console.log(props)
        this.state = {}
    }

    updateTrip() {
        let trip: Trip = this.props.trip
        if (trip.allValid()) {
            trip.items.push(new Item)
        }
        this.forceUpdate()
        this.props.db.putTrip(trip).then(id => {
            trip.id = id
        })
    }

    render() {
        let errors = this.props.trip.getErrors()
        return (
            <div id="main">
                <button onClick={this.props.goBack}>Back</button>
                <h1>Groceries!</h1>
                <input
                    type="text"
                    placeholder="MM/DD/YYYY"
                    value={this.props.trip.date.raw}
                    className={errors.date ? 'error' : ''}
                    onChange={(e) => {
                        this.props.trip.setDate(e.target.value)
                        this.updateTrip()
                    }}
                />
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
                {this.state.analysis ? <AnalysisTable {...this.state.analysis}/> : ''}
            </div>
        )
    }

    renderItem(item: Item, i) {
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
                        this.updateTrip()
                    }}
                /></td>
                <td><input
                    type="text"
                    value={item.amount.raw}
                    className={errors.amount ? 'error' : ''}
                    onChange={(e) => {
                        item.setAmount(e.target.value)
                        this.updateTrip()
                    }}
                /></td>
                <td><input
                    type="number"
                    value={item.cost}
                    className={errors.cost ? 'error' : ''}
                    onChange={(e) => {
                        item.cost = e.target.value
                        this.updateTrip()
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

    async analyze() {
        let analysis = await Analysis.analyzeTrip(this.props.db, this.props.trip)
        this.setState({analysis})
    }

}
