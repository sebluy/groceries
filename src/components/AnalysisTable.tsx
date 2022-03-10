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

        return <ReactTable data={measureO.foods} columns={columns}/>
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
        let ff = f => f.toFixed(2)
        let raw = this.props.analysis.measures.get(Food.MEASURES.RAW).total.nutrients
        let rdi = this.props.analysis.measures.get(Food.MEASURES.RDI).total.nutrients
        let rdiPerDay = this.props.analysis.measures.get(Food.MEASURES.RDI_PER_DAY).total.nutrients
        return (
            <table>
                <thead>
                <tr>
                    <th>Nutrient</th>
                    <th>{Food.MEASURES.RAW}</th>
                    <th>{Food.MEASURES.RDI}</th>
                    <th>{Food.MEASURES.RDI_PER_DAY}</th>
                </tr>
                </thead>
                <tbody>
                    {Food.nutrientNames().map(nutrient => {
                        return (
                            <tr key={nutrient}>
                                <td>{nutrient}</td>
                                <td>{ff(raw.get(nutrient))}</td>
                                <td>{ff(rdi.get(nutrient))}</td>
                                <td>{ff(rdiPerDay.get(nutrient))}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        )
    }

}
