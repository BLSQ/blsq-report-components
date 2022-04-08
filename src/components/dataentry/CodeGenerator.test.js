import { tokenize, valuesDependencies, fixIfStatement } from "./CodeGenerator"


describe("Tokenizing process", () => {

    it("tokenize IF", () => {
        expect(tokenize("IF( hello_world == empty, 45, 12)")).toEqual([
            "",
            "IF",
            "( ",
            "hello_world",
            " == ",
            "empty",
            ", ",
            "45",
            ", ",
            "12",
            ")",
        ])
    })

    it("tokenize", () => {
        expect(tokenize("ROUND( sum(%{subsides_values}) , 2)")).toEqual([
            "",
            "ROUND",
            "( ",
            "sum",
            "(%{",
            "subsides_values",
            "}) , ",
            "2",
            ")",

        ])
    })


    it("tokenize", () => {
        expect(valuesDependencies("ROUND( sum(%{subsides_values}) , 2)")).toEqual([
            "%{subsides_values}"
        ])
    })

    it("fixes if statement", () => {
        expect(fixIfStatement("if (0 >1 , 1 ,2)")).toEqual("IF(0 >1 , 1 ,2)")
    })

    it("fixes if statement", () => {
        expect(fixIfStatement("if(0 >1 , 1 ,2)")).toEqual("IF(0 >1 , 1 ,2)")
    })
})