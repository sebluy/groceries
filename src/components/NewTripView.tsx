import * as React from 'react'
import { Item } from '../item'
import { Trip } from '../trip'
import { ChangeEvent } from 'react'

export class NewTripView extends React.Component<any, any> {

    constructor(props) {
        super(props)
        console.log(props)
        this.state = {
            items: [],
            selected: [],
        }
    }

    async componentDidMount() {
        let trips = await this.props.db.getTrips()
        this.setState({items: Trip.allItems(trips)})
    }

    render() {
        return (
            <div id="main">
                <button onClick={this.props.goBack}>Back</button>
                <h1>New Trip</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Food Name</th>
                            <th>Amount</th>
                            <th>Cost</th>
                            <th>Include</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.items.map(this.renderItem.bind(this))}
                    </tbody>
                </table>
                <button onClick={this.create.bind(this)}>Create</button>
            </div>
        )
    }

    renderItem(item: Item, i) {
        return (
            <tr key={i}>
                <td>{item.food.label}</td>
                <td>{item.amount.raw}</td>
                <td>{item.cost}</td>
                <td>
                    <input
                        type="checkbox"
                        onChange={(e) => this.selectItem(i, e)}
                        checked={this.state.selected[i] === true}
                    />
                </td>
            </tr>
        )
    }

    selectItem(i: number, e: ChangeEvent) {
        this.state.selected[i] = (e.target as HTMLInputElement).checked
        this.forceUpdate()
    }

    create() {
        let trip = new Trip()
        trip.items = (this.state.items as Array<Item>)
            .filter((item, i) => this.state.selected[i])
            .map(item => item.clone())
        this.props.db.putTrip(trip)
        this.props.viewTrip(trip)
    }

}
