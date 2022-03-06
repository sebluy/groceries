import * as React from 'react'
import { Food } from '../food'
import Select, { MultiValue } from 'react-select'
import { Analysis } from '../analysis';

interface Props {
    analysis: Analysis
}

interface Option {
    label: string,
    value: string,
}

interface State {
    nutrients: MultiValue<Option>,
    foods: MultiValue<Option>,
    measure: Option,
}

export class AnalysisTable extends React.Component<Props, State> {

    constructor(props) {
        super(props)
        let foods = Array.from(this.props.analysis.foods.keys())
        let measures = this.createOptions(Object.values(Food.MEASURES))
        this.state = {
            nutrients: this.createOptions(Food.CORE_NUTRIENTS),
            foods: this.createOptions(foods),
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
                {this.renderTable()}
            </div>
        )
    }

    renderControls() {
        let foods = Array.from(this.props.analysis.foods.keys())
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
                options={this.createOptions(foods)}
                value={this.state.foods}
                onChange={foods => this.setState({foods})}
                isMulti
            />
            <Select
                options={measures}
                value={this.state.measure}
                onChange={measure => this.setState({measure})}
            />
            <button>Transpose</button>
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

    renderTable() {
        let measure = this.state.measure.value
        if (measure === undefined) return
        let measureO = this.props.analysis.measures.get(measure)
        let ff = f => f.toFixed(2)
        return (
            <table>
                <thead>
                    <tr>
                        <th>Food</th>
                        <th>Amount</th>
                        {this.state.nutrients.map(nutrient => {
                            return <th key={nutrient.value}>{nutrient.value}</th>
                        })}
                    </tr>
                </thead>
                <tbody>
                    {this.state.foods.map(food => {
                        let foodO = measureO.foods.get(food.value)
                        return (
                            <tr key={food.value}>
                                <td>{food.value}</td>
                                <td>{foodO.amount.raw}</td>
                                {this.state.nutrients.map(nutrient => {
                                    return <td key={nutrient.value}>
                                        {ff(foodO.nutrients.get(nutrient.value))}
                                    </td>
                                })}
                            </tr>
                        )
                    })}
                    <tr>
                        <td>Total</td>
                        <td>{measureO.total.amount.raw}</td>
                        {this.state.nutrients.map(nutrient => {
                            return <td key={nutrient.value}>
                                {ff(measureO.total.nutrients.get(nutrient.value))}
                            </td>
                        })}
                    </tr>
                </tbody>
            </table>
        )
    }

}
