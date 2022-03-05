
export class Food {

    public static CALORIES = 'Calories'
    public static CARBOHYDRATE = 'Carbohydrate'
    public static PROTEIN = 'Protein'
    public static FAT = 'Fat'
    public static IRON = 'Iron'
    public static ZINC = 'Zinc'
    public static CALCIUM = 'Calcium'
    public static OMEGA3 = 'Omega-3'

    public static RDI = new Map([
        [Food.CALORIES, 2000],
        [Food.CARBOHYDRATE, 275],
        [Food.PROTEIN, 50],
        [Food.FAT, 78],
        [Food.IRON, 18],
        [Food.ZINC, 11],
        [Food.CALCIUM, 1300],
        [Food.OMEGA3, 1.6],
    ])

    public id: number
    public amount: any
    public description: string
    public nutrients: Map<string, number>

    constructor(o) {
        Object.assign(this, o)
    }

    static nutrientNames() {
        return Array.from(Food.RDI.keys())
    }

    static empty(description) {
        return new Food({
            description,
            amount: {raw: '0 kg', number: 0, unit: 'kg'},
            nutrients: new Map(Food.nutrientNames().map(name => [name, 0])),
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
            nutrients: this.addNutrients(this.nutrients, f2.nutrients)
        })
    }

    addNutrients(n1: Map<string, number>, n2: Map<string, number>) {
        let n3 = new Map()
        n1.forEach((v, k) => {
            n3.set(k, v + n2.get(k))
        })
        return n3
    }

    divideNutrients(n1: Map<string, number>, n2: Map<string, number>) {
        let n3 = new Map()
        n1.forEach((v, k) => {
            n3.set(k, v / n2.get(k))
        })
        return n3
    }

    scaleNutrients(n1: Map<string, number>, f: number) {
        let n3 = new Map()
        n1.forEach((v, k) => {
            n3.set(k, v * f)
        })
        return n3
    }

    toRDI() {
        return new Food({
            id: this.id,
            description: this.description,
            amount: this.amount,
            nutrients: this.divideNutrients(this.nutrients, Food.RDI)
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
            nutrients: this.scaleNutrients(this.nutrients, factor)
        })
    }

    scaleByFactor(factor: number) {
        return new Food({
            id: this.id,
            description: this.description,
            amount: this.amount,
            nutrients: this.scaleNutrients(this.nutrients, factor)
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
