import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Trip } from '../trip'
import { TripIndex } from './TripIndex'
import { TripView } from './TripView'
import { GroceryDb } from '../grocery-db'

/*
 TODO: Add a analysis button on trip index to analyze a set of trips
 TODO: Add a foods page to select previous foods to initialize new trips
 TODO: Use react-router for page navigation
 TODO: Add more types
 TODO: Improve styling
 TODO: Extract class for USDA API
 TODO: Add other nutrients. All? Vegan concerns? B12, Vitamin D, Omega3/6
 */

export class App extends React.Component<any, any> {

    static TRIP_INDEX_PAGE = 'trip-index'
    static TRIP_PAGE = 'trip'

    constructor(props) {
        super(props)
        this.state = {
            page: App.TRIP_INDEX_PAGE,
            db: new GroceryDb(),
        }
    }

    render() {
        if (this.state.page === App.TRIP_INDEX_PAGE) {
            return <TripIndex db={this.state.db} viewTrip={this.viewTrip.bind(this)}/>
        } else if (this.state.page === App.TRIP_PAGE) {
            return <TripView
                db={this.state.db}
                trip={this.state.trip}
                goBack={this.showIndex.bind(this)}
            />
        }
    }

    showIndex() {
        this.setState({
            page: App.TRIP_INDEX_PAGE
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