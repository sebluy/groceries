
export class Food {

    public static RDI = {
        calories: 2000,
        fat: 78,
        protein: 50,
        carbohydrate: 275,
    }

    public id: number
    public amount: any
    public description: string
    public calories: number
    public carbohydrate: number
    public protein: number
    public fat: number

    constructor(o) {
        Object.assign(this, o)
    }

    static empty(description) {
        return new Food({
            description,
            amount: {raw: '0 kg', number: 0, unit: 'kg'},
            calories: 0,
            carbohydrate: 0,
            protein: 0,
            fat: 0,
        })
    }

    add(f2: Food) {
        let uFactor = this.unitFactor(this.amount.unit, f2.amount.unit)
        let amount: any = {
            unit: this.amount.unit,
            number: this.amount.number + uFactor * f2.amount.number
        }
        amount.raw = (Math.round(amount.number * 100000) / 100000) + ' ' + amount.unit
        return new Food({
            id: this.id,
            description: this.description,
            amount: amount,
            calories: this.calories + f2.calories,
            carbohydrate: this.carbohydrate + f2.carbohydrate,
            fat: this.fat + f2.fat,
            protein: this.protein + f2.protein,
        })
    }

    toRDI() {
        return new Food({
            id: this.id,
            description: this.description,
            amount: this.amount,
            calories: this.calories / Food.RDI.calories,
            fat: this.fat / Food.RDI.fat,
            carbohydrate: this.carbohydrate / Food.RDI.carbohydrate,
            protein: this.protein / Food.RDI.protein,
        })
    }

    scale(amount2) {
        let nFactor = amount2.number / this.amount.number
        let uFactor = this.unitFactor(this.amount.unit, amount2.unit)
        let factor = nFactor * uFactor
        return new Food({
            id: this.id,
            description: this.description,
            amount: {...amount2},
            calories: this.calories * factor,
            fat: this.fat * factor,
            carbohydrate: this.carbohydrate * factor,
            protein: this.protein * factor,
        })
    }

    scaleByFactor(factor: number) {
        return new Food({
            id: this.id,
            description: this.description,
            amount: this.amount,
            calories: this.calories * factor,
            fat: this.fat * factor,
            carbohydrate: this.carbohydrate * factor,
            protein: this.protein * factor,
        })
    }

    unitFactor(u1, u2) {
        if (u1 === 'ml') u1 = 'g'
        if (u2 === 'ml') u2 = 'g'
        if (u1 === 'l') u1 = 'kg'
        if (u2 === 'l') u2 = 'kg'
        if (u1 === u2) return 1.0
        if (u1 === 'g' && u2 === 'kg') return 1000.0
        if (u1 === 'kg' && u2 === 'g') return 0.001
    }

}
