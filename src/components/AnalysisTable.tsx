import * as React from 'react'
import { Food } from '../food'
import Select, { MultiValue } from 'react-select'
import { ReactTable } from './ReactTable'
import { Analysis } from '../analysis'


interface Props {
    analysis: Analysis
}

interface Option {
    label: string,
    value: string,
}

interface State {
    nutrients: MultiValue<Option>,
    measure: Option,
}

export class AnalysisTable extends React.Component<Props, State> {

    constructor(props) {
        super(props)
        let measures = this.createOptions(Object.values(Food.MEASURES))
        this.state = {
            nutrients: this.createOptions(Food.CORE_NUTRIENTS),
            measure: measures[2],
        }
    }

    createOptions(strs: Array<string>) {
        return strs.map(str => {
            return {label: str, value: str}
        })
    }

    render() {
        return (
            <div>
                <h2>Summary</h2>
                {this.renderSummaryTable()}
                <h2>Analysis</h2>
                {this.renderControls()}
                {this.renderMainTable()}
            </div>
        )
    }

    renderMainTable() {
        let measure = this.state.measure.value
        if (measure === undefined) return
        let measureO = this.props.analysis.measures.get(measure)

        let columns: any = [{
            Header: 'Food',
            id: 'Food',
            accessor: food => food.description,
            Footer: 'Total',
        }, {
            Header: 'Amount',
            id: 'Amount',
            accessor: food => food.amount.raw,
            Footer: measureO.total.amount.raw
        }]
        this.state.nutrients.forEach(option => {
            let nutrient = option.value
            columns.push({
                Header: nutrient,
                accessor: food => food.nutrients.get(nutrient),
                id: nutrient,
                Cell: props => props.value.toLocaleString(),
                sortType: 'number',
                Footer: measureO.total.nutrients.get(nutrient).toLocaleString()
            })
        })

        return <ReactTable data={measureO.foods} columns={columns} hasFooter={true}/>
    }

    renderControls() {
        let measures = this.createOptions(Object.values(Food.MEASURES))
        return (
            <React.Fragment>
            <Select
                options={this.createOptions(Food.nutrientNames())}
                value={this.state.nutrients}
                onChange={nutrients => this.setState({nutrients})}
                isMulti
            />
            <Select
                options={measures}
                value={this.state.measure}
                onChange={measure => this.setState({measure})}
            />
            </React.Fragment>
        )
    }

    renderSummaryTable() {
        let measures = this.props.analysis.measures
        let columns: any = [{
            Header: 'Nutrient',
            id: 'Nutrient',
            accessor: nutrient => nutrient,
        }]
        Object.values(Food.MEASURES).forEach(measure => {
            let nutrients = measures.get(measure).total.nutrients
            columns.push({
                Header: measure,
                id: measure,
                accessor: nutrient => nutrients.get(nutrient),
                Cell: props => props.value.toLocaleString(),
                sortType: 'number',
            })
        })
        return <ReactTable data={Food.nutrientNames()} columns={columns}/>
    }

}
