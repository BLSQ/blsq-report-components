
import { functions } from "./FunctionRegistry"

const evalCode = (code) => {

    const keys = Object.keys(functions)
    const values = Object.values(functions)

    const calculator = new Function(...keys, "return " + code)(
        ...values
    );
    return calculator
}


describe("FunctionRegistry", () => {

    describe("ACCESS/ARRAY", () => {
        it("should work", () => {
            expect(evalCode("ACCESS(ARRAY(1,2,3), 2)")).toEqual(3)
        })
        it("should work without array", () => {
            expect(evalCode("ACCESS(1,2,3, 1)")).toEqual(2)
        })
    })


    describe("STRLEN", () => {
        it("should work without array", () => {
            expect(evalCode("STRLEN('123456')")).toEqual(6)
        })
    })


    describe("CONCATENATE", () => {
        it("should keep empty string empty", () => {
            expect(evalCode("CONCATENATE('', '')")).toEqual('')
        })
        it("should concatenates", () => {
            expect(evalCode("CONCATENATE('A', 'B')")).toEqual('AB')
        })

        it("should keep empty string empty", () => {
            expect(evalCode("CONCATENATE('A','','B')")).toEqual('AB')
        })
    })

    describe("RANDBETWEEN", () => {
        const rand = functions["RANDBETWEEN"]

        it("handle single item array", () => {
            const val = rand(4, 5)
            expect(val).toBeGreaterThanOrEqual(4)
            expect(val).toBeLessThanOrEqual(5)
        })
    })


    describe("CEILING", () => {
        const floor = functions["CEILING"]

        it("handle already ceiled", () => {
            expect(floor(4)).toEqual(4)
        })
        it("handle already ceiled", () => {
            expect(floor(4.2)).toEqual(5)
        })
        it("handle already ceiled", () => {
            expect(floor(4.5)).toEqual(5)
        })
        it("handle already ceiled", () => {
            expect(floor(4.7)).toEqual(5)
        })

        it("evalCode", () => { expect(evalCode("CEILING(1.7)")).toEqual(2) })

    })



    describe("FLOOR", () => {
        const floor = functions["FLOOR"]

        it("handle already floored", () => {
            expect(floor(4)).toEqual(4)
        })
        it("handle already floored", () => {
            expect(floor(4.2)).toEqual(4)
        })
        it("handle already floored", () => {
            expect(floor(4.5)).toEqual(4)
        })
        it("handle already floored", () => {
            expect(floor(4.7)).toEqual(4)
        })

        it("evalCode", () => { expect(evalCode("FLOOR(1.7)")).toEqual(1) })

    })


    describe("MAX", () => {
        const max = functions["MAX"]

        it("handle single item array", () => {
            expect(max(4)).toEqual(4)
        })

        it("handle multiple item array", () => {
            expect(max(1, 2.5, 4)).toEqual(4)
        })

        it("handle negative item array", () => {
            expect(max(-1, -2, -4)).toEqual(-1)
        })

    })

    describe("MIN", () => {
        const min = functions["MIN"]

        it("handle single item array", () => {
            expect(min(4)).toEqual(4)
        })

        it("handle multiple item array", () => {
            expect(min(1, 1.8, 4)).toEqual(1)
        })

        it("handle negative item array", () => {
            expect(min(-1, -2, -4)).toEqual(-4)
        })

    })

    describe("AVG", () => {
        const avg = functions["AVG"]

        it("handle single item array", () => {
            expect(avg(4)).toEqual(4)
        })

        it("handle multiple item array", () => {
            expect(avg(1, 2.5, 7, 4)).toEqual(3.625)
        })

        it("handle negative item array", () => {
            expect(avg(-1, -2, -4)).toEqual(-2.3333333333333335)
        })

    })


    describe("SQRT", () => {
        const sqrt = functions["SQRT"]
        it("return square root value", () => {
            expect(sqrt(16)).toEqual(4)
        })
        it("return square root value of 0", () => {
            expect(sqrt(0)).toEqual(0)
        })
    })


    describe("SAFE_DIV", () => {
        const safeDiv = functions["SAFE_DIV"]
        it("handle division by zero by returning 0", () => {
            expect(safeDiv(0, 0)).toEqual(0)
        })

        it("divide a by b", () => {
            expect(safeDiv(8, 10)).toEqual(0.8)
        })
        it("divide NaN by b", () => {
            expect(safeDiv(NaN, 10)).toEqual(0)
        })
        it("divide a by NaN", () => {
            expect(safeDiv(10, NaN)).toEqual(0)
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