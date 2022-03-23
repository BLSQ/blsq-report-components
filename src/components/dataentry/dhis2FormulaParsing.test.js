
import {parseDependencies} from "./dhis2FormulaParsing"

describe("dhis2FormulaParsing", () => {

    const indicators = [{
        "name": "QOC-DRSP-5-Service des informations sanitaires et de la planification-%",
        "id": "AEdxpWFc7ve",
        "numerator": "(#{LxK9hKVj7rS} + #{QsMMNjhcNSZ} + #{HVnJxKqhQUP} + #{Re6ly2Nd3fB} + #{rSer93ugjM9} + #{HORkDqOFdTM})/#{M4OlzTWXKqw}*100",
      },
      {
        "name": "QOC-DRSP-3-Brigade de contrôle des activités des soins-Total",
        "id": "seBtUa4oVXO",
        "numerator": "#{gBqelfhzskh} + #{uUM5ET78Hde} + #{ykEeeSSv525} + #{ow1bliSgliM} + #{S4QifEO46zy} + #{I3MBniW5mgQ} + #{HFU6JvCxmY7} + #{jgo8aYWMMWA} + #{M9ix51caL8I} + #{Ov5mtrNc6y7}",
      },
      {
        "name": "QOC-DRSP-score qualité final-%",
        "id": "ormcGyK4AyY",
        "numerator": "(#{KRv6cSYO3EC}+#{O6kBcJbHFXb}+#{l6qvIjjie56}+#{uiF4MTc2IXD}+#{dWdm77WyEDN}+#{XjAp57Fn1PF}+#{HeFn4ikw5LQ}+#{ecduIJ9UrNO}+#{xZtv7xl8nzr}+#{Psb5r3UldL6}+#{gBqelfhzskh}+#{uUM5ET78Hde}+#{ykEeeSSv525}+#{ow1bliSgliM}+#{S4QifEO46zy}+#{I3MBniW5mgQ}+#{HFU6JvCxmY7}+#{jgo8aYWMMWA}+#{M9ix51caL8I}+#{Ov5mtrNc6y7}+#{ekFhvxXjkSL}+#{j4oCPcgrs4y}+#{zRJcuTjUzvI}+#{EbHBrhi0LOI}+#{UsL2WY9481D}+#{LxK9hKVj7rS}+#{QsMMNjhcNSZ}+#{HVnJxKqhQUP}+#{Re6ly2Nd3fB}+#{rSer93ugjM9}+#{HORkDqOFdTM})/(#{fZCvAwqH6Fh} + #{Prr5qX4QPVs} + #{OAvgSocKAr2} + #{ct1Idr1QVwb} + #{M4OlzTWXKqw})*100",
      }]

    describe("parseDependencies", () => {
        it("should work for indicator 0 with /", () => {
            expect(parseDependencies(indicators[0].numerator)).toEqual(["LxK9hKVj7rS", "QsMMNjhcNSZ", "HVnJxKqhQUP", "Re6ly2Nd3fB", "rSer93ugjM9", "HORkDqOFdTM", "M4OlzTWXKqw"])
        })
        it("should work for indicator 1 with just sums", () => {
            expect(parseDependencies(indicators[1].numerator)).toEqual(["gBqelfhzskh", "uUM5ET78Hde", "ykEeeSSv525", "ow1bliSgliM", "S4QifEO46zy", "I3MBniW5mgQ", "HFU6JvCxmY7", "jgo8aYWMMWA", "M9ix51caL8I", "Ov5mtrNc6y7"])
        })
        it("should work for indicator 2 without spaces and *", () => {
            expect(parseDependencies(indicators[2].numerator)).toEqual(["KRv6cSYO3EC", "O6kBcJbHFXb", "l6qvIjjie56", "uiF4MTc2IXD", "dWdm77WyEDN", "XjAp57Fn1PF", "HeFn4ikw5LQ", "ecduIJ9UrNO", "xZtv7xl8nzr", "Psb5r3UldL6", "gBqelfhzskh", "uUM5ET78Hde", "ykEeeSSv525", "ow1bliSgliM", "S4QifEO46zy", "I3MBniW5mgQ", "HFU6JvCxmY7", "jgo8aYWMMWA", "M9ix51caL8I", "Ov5mtrNc6y7", "ekFhvxXjkSL", "j4oCPcgrs4y", "zRJcuTjUzvI", "EbHBrhi0LOI", "UsL2WY9481D", "LxK9hKVj7rS", "QsMMNjhcNSZ", "HVnJxKqhQUP", "Re6ly2Nd3fB", "rSer93ugjM9", "HORkDqOFdTM", "fZCvAwqH6Fh", "Prr5qX4QPVs", "OAvgSocKAr2", "ct1Idr1QVwb", "M4OlzTWXKqw"])
        })    
    })
})
