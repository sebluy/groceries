import * as React from 'react'
import {Food} from "../food";

export class Analysis extends React.Component<any, any> {

    render() {
        return (
            <div>
                <h2>Raw</h2>
                {this.renderTable(this.props.raw)}
                <h2>RDI</h2>
                {this.renderTable(this.props.rdi)}
                <h2>RDI/Day</h2>
                {this.renderTable(this.props.rdiPerDay)}
            </div>
        )
    }

    renderTable(foods: Array<Food>) {
        return (
            <table>
                <thead>
                    <tr>
                        <th>Food</th>
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
                <td>{ff(food.carbohydrate)}</td>
                <td>{ff(food.protein)}</td>
                <td>{ff(food.fat)}</td>
                <td>{ff(food.calories)}</td>
            </tr>
        )
    }
}
