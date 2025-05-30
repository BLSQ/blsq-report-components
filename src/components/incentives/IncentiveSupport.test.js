import IncentiveSupport from "./IncentiveSupport";
describe("IncentiveSupport", () => {
  describe("computePeriods", () => {
    it("should work", () => {
      expect(IncentiveSupport.computePeriods("QuarterlyNov", "2021NovQ1")).toEqual([
        "2020NovQ4",
        "2021NovQ1",
        "2021NovQ2",
        "2021NovQ3",
        "2021NovQ4",
        "2022NovQ1",
      ]);
    });
    it("should work for quarterly", () => {
      expect(IncentiveSupport.computePeriods("Quarterly", "2021Q1")).toEqual([
        "2020Q4",
        "2021Q1",
        "2021Q2",
        "2021Q3",
        "2021Q4",
        "2022Q1",
      ]);
    });
    it("should work for monthly", () => {
      expect(IncentiveSupport.computePeriods("Monthly", "202101")).toEqual([
        "202101",
        "202102",
        "202103",
        "202104",
        "202105",
        "202106",
        "202107",
        "202108",
        "202109",
        "202110",
        "202111",
        "202112",
      ]);
    });
  });
});
