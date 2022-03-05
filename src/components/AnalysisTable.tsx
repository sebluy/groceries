import * as React from 'react'
import {Food} from "../food";

export class AnalysisTable extends React.Component<any, any> {

    render() {
        return (
            <div>
                <h2>Nutrients</h2>
                {this.renderNutrientsTable()}
                <h2>Raw</h2>
                {this.renderTable(this.props.raw)}
                <h2>RDI</h2>
                {this.renderTable(this.props.rdi)}
                <h2>RDI/Day</h2>
                {this.renderTable(this.props.rdiPerDay)}
            </div>
        )
    }

    renderNutrientsTable() {
        let nutrients = this.props.nutrients
        let ff = f => f.toFixed(2)
        return (
            <table>
                <thead>
                <tr>
                    <th>Nutrient</th>
                    <th>Raw</th>
                    <th>RDI</th>
                    <th>RDI/Day</th>
                </tr>
                </thead>
                <tbody>
                    {Food.nutrientNames().map(nutrient => {
                        return (
                            <tr key={nutrient}>
                                <td>{nutrient}</td>
                                <td>{ff(nutrients.raw.nutrients.get(nutrient))}</td>
                                <td>{ff(nutrients.rdi.nutrients.get(nutrient))}</td>
                                <td>{ff(nutrients.rdiPerDay.nutrients.get(nutrient))}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        )
    }

    renderTable(foods: Array<Food>) {
        return (
            <table>
                <thead>
                    <tr>
                        <th>Food</th>
                        <th>Amount</th>
                        <th>Carbohydrate</th>
                        <th>Protein</th>
                        <th>Fat</th>
                        <th>Calories</th>
                    </tr>
                </thead>
                <tbody>
                    {foods.map(food => this.renderFood(food))}
                </tbody>
            </table>
        )
    }

    renderFood(food: Food) {
        let ff = f => f.toFixed(2)
        return (
            <tr key={food.description}>
                <td>{food.description}</td>
                <td>{food.amount.raw}</td>
                <td>{ff(food.nutrients.get(Food.CARBOHYDRATE))}</td>
                <td>{ff(food.nutrients.get(Food.PROTEIN))}</td>
                <td>{ff(food.nutrients.get(Food.FAT))}</td>
                <td>{ff(food.nutrients.get(Food.CALORIES))}</td>
            </tr>
        )
    }
}
