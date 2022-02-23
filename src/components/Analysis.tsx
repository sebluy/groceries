import * as React from 'react'

export class Analysis extends React.Component<any, any> {

    render() {
        let fp = p => (p * 100).toFixed(2) + '%'
        let ff = f => f.toFixed(2)
        return (
            <table>
                <tbody>
                    {this.renderRow('Total Calories', this.props.calories)}
                    {this.renderRow('Days of Food', ff(this.props.daysOfFood))}
                    {this.renderRow('Carbohydrate', fp(this.props.carbohydrate))}
                    {this.renderRow('Protein', fp(this.props.protein))}
                    {this.renderRow('Fat', fp(this.props.fat))}
                </tbody>
            </table>
        )
    }

    renderRow(label, value) {
        return <tr><td>{label}</td><td>{value}</td></tr>
    }
}
