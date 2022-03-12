import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Trip } from '../trip'
import { TripIndex } from './TripIndex'
import { TripView } from './TripView'
import { GroceryDb } from '../grocery-db'
import { NewTripView } from './NewTripView'

/*
 TODO: Add a %DRI/ 2000 Calorie for individual foods option
 TODO: Add a %DRI/$
 TODO: Add more nutrients.
 TODO: Add units to analysis table.
 TODO: Add more classes (for example, amount: number & unit)
 TODO: Allow custom selection of trips for selection.
 TODO: Import/export database button
 TODO: Use react-router for page navigation
 TODO: Add more types
 TODO: Improve styling
 TODO: Extract class for USDA API
 TODO: Add other nutrients. All? Vegan concerns? B12, Vitamin D, Omega3/6
 */

export class App extends React.Component<any, any> {

    static TRIP_INDEX_PAGE = 'trip-index'
    static TRIP_PAGE = 'trip'
    static NEW_TRIP_PAGE = 'new-trip'

    constructor(props) {
        super(props)
        this.state = {
            page: App.TRIP_INDEX_PAGE,
            db: new GroceryDb(),
        }
    }

    render() {
        if (this.state.page === App.TRIP_INDEX_PAGE) {
            return <TripIndex
                db={this.state.db}
                viewTrip={this.viewTrip.bind(this)}
                viewNewTrip={this.viewNewTrip.bind(this)}
            />
        } else if (this.state.page === App.TRIP_PAGE) {
            return <TripView
                db={this.state.db}
                trip={this.state.trip}
                goBack={this.viewIndex.bind(this)}
            />
        } else if (this.state.page === App.NEW_TRIP_PAGE) {
            return <NewTripView
                db={this.state.db}
                viewTrip={this.viewTrip.bind(this)}
                goBack={this.viewIndex.bind(this)}
            />
        }
    }

    viewIndex() {
        this.setState({
            page: App.TRIP_INDEX_PAGE
        })
    }

    viewNewTrip() {
        this.setState({
            page: App.NEW_TRIP_PAGE,
        })
    }

    viewTrip(trip: Trip) {
        this.setState({
            trip: trip,
            page: App.TRIP_PAGE,
        })
    }
}

ReactDOM.render(React.createElement(App), document.getElementById('react-root'))