
export class Food {

    public static CALORIES = 'Calories'
    public static CARBOHYDRATE = 'Carbohydrate'
    public static PROTEIN = 'Protein'
    public static FAT = 'Fat'
    public static IRON = 'Iron'
    public static ZINC = 'Zinc'
    public static CALCIUM = 'Calcium'
    public static OMEGA3 = 'Omega-3'
    public static SATURATED_FAT = 'Saturated Fat'
    public static CHOLESTEROL = 'Cholesterol'
    public static SODIUM = 'Sodium'
    public static ADDED_SUGAR = 'Added Sugar'
    public static FIBER = 'Fiber'
    public static VITAMIN_A = 'Vitamin A'
    public static VITAMIN_C = 'Vitamin C'
    public static VITAMIN_D = 'Vitamin D'
    public static VITAMIN_E = 'Vitamin E'
    public static VITAMIN_K = 'Vitamin K'
    public static THIAMIN = 'Thiamin'
    public static RIBOFLAVIN = 'Riboflavin'
    public static NIACIN = 'Niacin'
    public static PANTOTHENIC_ACID = 'Pantothenic Acid'
    public static PYRIDOXINE = 'Pyridoxine'
    public static BIOTINE = 'Biotine'
    public static FOLATE = 'Folate'
    public static VITAMIN_B12 = 'Vitamin B12'
    public static CHOLINE = 'Choline'
    public static CHROMIUM = 'Chromium'
    public static COPPER = 'Copper'
    public static IODINE = 'Iodine'
    public static MAGNESIUM = 'Magnesium'
    public static MANGANESE = 'Manganese'
    public static MOLYBDENUM = 'Molybdenum'
    public static PHOSPHORUS = 'Phosphorus'
    public static SELENIUM = 'Selenium'
    public static POTASSIUM = 'Potassium'
    public static CHLORIDE = 'Chloride'

    // Source: https://en.wikipedia.org/wiki/Reference_Daily_Intake
    public static RDI = new Map([
        // Macro
        [Food.CALORIES, 2000],
        [Food.FAT, 78],
        [Food.SATURATED_FAT, 20],
        [Food.CHOLESTEROL, 300],
        [Food.CARBOHYDRATE, 275],
        // [Food.ADDED_SUGAR, 50],
        [Food.FIBER, 28],
        [Food.PROTEIN, 50],
        // Vitamins
        [Food.VITAMIN_A, 900],
        [Food.VITAMIN_C, 90],
        [Food.VITAMIN_D, 20],
        [Food.VITAMIN_E, 15],
        [Food.VITAMIN_K, 120],
        [Food.THIAMIN, 1.2],
        [Food.RIBOFLAVIN, 1.3],
        [Food.NIACIN, 16],
        [Food.PANTOTHENIC_ACID, 5],
        [Food.PYRIDOXINE, 1.7],
        // [Food.BIOTINE, 30],
        [Food.FOLATE, 400],
        [Food.VITAMIN_B12, 2.4],
        [Food.CHOLINE, 550],
        // Minerals
        [Food.CALCIUM, 1300],
        // [Food.CHROMIUM, 35],
        [Food.COPPER, 0.9],
        // [Food.IODINE, 150],
        [Food.IRON, 18],
        [Food.MAGNESIUM, 420],
        [Food.MANGANESE, 2.3],
        // [Food.MOLYBDENUM, 45],
        [Food.PHOSPHORUS, 1250],
        [Food.SELENIUM, 55],
        [Food.ZINC, 11],
        [Food.POTASSIUM, 4700],
        [Food.SODIUM, 2300],
        // [Food.CHLORIDE, 2.3],
        // Other
        [Food.OMEGA3, 1.6],
    ])

    public static CORE_NUTRIENTS = [Food.CALORIES, Food.CARBOHYDRATE, Food.PROTEIN, Food.FAT]
    public static MEASURES = {RAW: 'Raw', RDI: 'RDI', RDI_PER_DAY: 'RDI/Day'}

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
