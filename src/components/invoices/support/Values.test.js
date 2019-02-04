import Values from "./Values";

const values = new Values(
  {
    dataValues: [
      {
        dataElement: "de",
        categoryOptionCombo: "coc",
        period: "2016Q1",
        value: "5",
        orgUnit: "orgunit1"
      },
      {
        dataElement: "de",
        categoryOptionCombo: "coc2",
        period: "2016Q1",
        value: "10",
        orgUnit: "orgunit1"
      },
      {
        dataElement: "de",
        categoryOptionCombo: "coc",
        period: "2016Q1",
        value: "10",
        orgUnit: "orgunit2"
      },
      {
        dataElement: "de",
        categoryOptionCombo: "coc2",
        period: "2016Q1",
        value: "20",
        orgUnit: "orgunit2"
      }
    ]
  },
  {
    de: "Vaccination",
    "de.coc": "Vaccination - under 5 year"
  }
);

const noValueAmounts = new Values(
  { dataValues: undefined },
  {
    de: "Vaccination",
    "de.coc": "Vaccination - under 5 year"
  }
);

it("handle data element (sum all coc)", () => {
  expect(values.amountByOrgUnit("de", "orgunit1", "2016Q1")).toEqual({
    code: "de",
    name: "Vaccination",
    period: "2016Q1",
    value: 5 + 10
  });
  expect(values.amountByOrgUnit("de", "orgunit2", "2016Q1")).toEqual({
    code: "de",
    name: "Vaccination",
    period: "2016Q1",
    value: 10 + 20
  });
});

it("handle data element with a coc", () => {
  expect(values.amountByOrgUnit("de.coc", "orgunit1", "2016Q1")).toEqual({
    code: "de.coc",
    name: "Vaccination - under 5 year",
    period: "2016Q1",
    value: 5
  });
  expect(values.amountByOrgUnit("de.coc", "orgunit2", "2016Q1")).toEqual({
    code: "de.coc",
    name: "Vaccination - under 5 year",
    period: "2016Q1",
    value: 10
  });
});

it("handle no values and empty values", () => {
  expect(
    noValueAmounts.amountByOrgUnit("de.coc", "orgunit1", "2016Q1")
  ).toEqual({
    code: "de.coc",
    name: "Vaccination - under 5 year",
    period: "2016Q1",
    value: undefined
  });
  expect(values.amountByOrgUnit("de.coc", "orgunit5", "2016Q1")).toEqual({
    code: "de.coc",
    name: "Vaccination - under 5 year",
    period: "2016Q1",
    value: " "
  });
});
