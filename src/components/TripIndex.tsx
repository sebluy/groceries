import * as React from 'react'
import { Trip } from '../trip'

export class TripIndex extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            trips: [],
        }
    }

    async componentDidMount() {
        let trips = await this.props.db.getTrips()
        this.setState({trips: trips})
    }

    render() {
        return (
            <div id="main">
                <h1>Trips</h1>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.trips.map((trip: Trip) => (
                            <tr key={trip.id}>
                                <td>{trip.id}</td>
                                <td>{trip.date.value && trip.date.value.toDateString()}</td>
                                <td>
                                    <button onClick={() => this.props.viewTrip(trip)}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    className="new-trip"
                    onClick={() => this.props.viewTrip(new Trip())}>
                    New Trip
                </button>
            </div>
        )
    }

}