import Dhis2 from "./Dhis2";

it("by default fetch current periods month, quarter and year", () => {
  const dhis2 = new Dhis2({
    url: "https://play.dhis2.org/2.29",
    user: "admin",
    password: "district",
    disableInitialize: true,
    categoryComboId: "t3aNCvHsoSn"
  });

  const request = dhis2.buildInvoiceRequest([], "2016Q1", {}, "azeazeaze");

  expect(request).toEqual({
    orgUnits: [],
    period: "2016Q1",
    quarterPeriod: "2016Q1",
    quarterPeriods: ["2016Q1"],
    monthlyPeriods: ["201601", "201602", "201603"],
    yearlyPeriods: ["2016"],
    yearlyJulyPeriods: ["2015July"],
    year: "2016",
    quarter: "1",
    invoiceType: {}
  });
});

it("invoiceType can force lookup of previous periods", () => {
  const dhis2 = new Dhis2({
    url: "https://play.dhis2.org/2.29",
    user: "admin",
    password: "district",
    disableInitialize: true,
    categoryComboId: "t3aNCvHsoSn"
  });

  const request = dhis2.buildInvoiceRequest(
    [],
    "2016Q1",
    { previousPeriods: 1 },
    "azeazeaze"
  );
  expect(request).toEqual({
    invoiceType: { previousPeriods: 1 },
    monthlyPeriods: [
      "201601",
      "201602",
      "201603",
      "201510",
      "201511",
      "201512"
    ],
    orgUnit: undefined,
    orgUnits: [],
    period: "2016Q1",
    quarter: "1",
    quarterPeriod: "2016Q1",
    quarterPeriods: ["2016Q1", "2015Q4"],
    year: "2016",
    yearlyPeriods: ["2016", "2015"],
    yearlyJulyPeriods: ["2015July"]
  });
});
