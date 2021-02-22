
import { functions } from "./FunctionRegistry"

describe("FunctionRegistry", () => {

    describe("SAFE_DIV", () => {
        const safeDiv = functions["SAFE_DIV"]
        it("handle division by zero by returning 0", () => {
            expect(safeDiv(0, 0)).toEqual(0)
        })

        it("divide a by b", () => {
            expect(safeDiv(8, 10)).toEqual(0.8)
        })
    })

    describe("ABS", () => {
        const abs = functions["ABS"]
        it("return absolute value", () => {
            expect(abs(8)).toEqual(8)
        })
        it("return absolute value of negative value", () => {
            expect(abs(-8)).toEqual(8)
        })
    })


    describe("ROUND", () => {
        const round = functions["ROUND"]
        it("return rounded value", () => {
            expect(round(undefined)).toEqual(0)
        })
        it("return rounded value", () => {
            expect(round(8.2, 2)).toEqual(8.2)
        })
        it("return rounded for negative", () => {
            expect(round(-8.2, 0)).toEqual(-8)
        })
    })


    describe("IFF", () => {
        const IFF = functions["IFF"]
        it("return true value", () => {
            expect(IFF(true, 1, 2)).toEqual(1)
        })
        it("return false value", () => {
            expect(IFF(false, 1, 2)).toEqual(2)
        })
    })

    describe("SCORE_TABLE", () => {
        const scoreTable = functions["SCORE_TABLE"]

        it("return adequate score table", () => {
            expect(scoreTable(1,
                1, 2, 3,
                4, 5, 6,
                9)).toEqual(3)

            expect(scoreTable(4,
                1, 2, 3,
                4, 5, 6,
                9)).toEqual(6)

            expect(scoreTable(10,
                1, 2, 3,
                4, 5, 6,
                9)).toEqual(9)
        })
    })
})