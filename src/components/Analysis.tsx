import * as React from 'react'
import {Food} from "../food";

export class Analysis extends React.Component<any, any> {

    render() {
        return (
            <div>
                {this.renderTable(this.props.raw)}
                {this.renderTable(this.props.rdi)}
                {this.renderTable(this.props.rdiPerDay)}
            </div>
        )
    }

    renderTable(foods: Array<Food>) {
        return (
            <table>
                <thead>
                    <tr>
                        <td>Food</td>
                        <td>Carbohydrate</td>
                        <td>Protein</td>
                        <td>Fat</td>
                        <td>Calories</td>
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
