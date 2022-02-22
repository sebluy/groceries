import * as React from 'react'
import * as ReactDOM from 'react-dom'
import AsyncSelect from 'react-select/async'

export class App extends React.Component<any, any> {

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
            </div>
        )
    }

    renderRow(row, i) {
        return (
            <tr key={i}>
                <td><AsyncSelect
                    loadOptions={this.loadOptions.bind(this)}
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

    loadOptions(input: string) {
        // TODO: Do I need to rate limit this?
        // TODO: Move apiKey into some kind of config manager
        let apiKey = 'XJhL3a6dKg1b8xMzv5KA9GcuLLxmjeXFLfehyGbO'
        let url = `https://api.nal.usda.gov/fdc/v1/foods/list?api_key=${apiKey}`
        return this.post(url, {query: input, pageSize: 10})
            .then(response => response.json())
            .then(data => {
                console.log(data)
                return data.map(item => {
                    return {value: item.fdcId, label: item.description}
                })
            })
    }

}

ReactDOM.render(React.createElement(App), document.getElementById('react-root'))