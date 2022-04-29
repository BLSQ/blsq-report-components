import IndicatorEvaluator from "./IndicatorEvaluator";
import Values from "../invoices/support/Values";

describe("IndicatorEvaluator", () => {
  const emptyValues = () => {
    return new Values({ dataValues: [] }, {});
  };
  const indicators = [
    {
      name: "2018D - Family Planning (Long Acting Reversible Methods)",
      id: "C6dAvSMNGTd",
      numerator:
        "#{EISFnXrZICm.f5I0iyxP3EV}+#{EISFnXrZICm.UEERTk6Kl9e}+#{IicfUlzAHo3.f5I0iyxP3EV}+#{IicfUlzAHo3.UEERTk6Kl9e}+#{YILgS7FwLll.f5I0iyxP3EV}+#{YILgS7FwLll.UEERTk6Kl9e}+#{k0ArBKGITBY.f5I0iyxP3EV}+#{k0ArBKGITBY.UEERTk6Kl9e}",
      denominator: "1",
    },
  ];

  const orgUnitId = "orgunitIddhsi2";
  const period = "201601";

  it("should work without values", () => {
    const values = emptyValues();
    const evaluator = new IndicatorEvaluator(indicators, values);

    evaluator.evaluate(orgUnitId, period);

    expect(values.values).toEqual({ dataValues: [] });
    expect(values.names).toEqual({
      C6dAvSMNGTd: "Indicator - 2018D - Family Planning (Long Acting Reversible Methods)",
    });
  });

  it("should work with a value", () => {
    const values = emptyValues();

    values.values.dataValues.push(
      {
        period: period,
        orgUnit: orgUnitId,
        dataElement: "EISFnXrZICm",
        categoryOptionCombo: "f5I0iyxP3EV",
        value: "10",
      },
      {
        period: period,
        orgUnit: orgUnitId,
        dataElement: "EISFnXrZICm",
        categoryOptionCombo: "UEERTk6Kl9e",
        value: "5",
      },
    );
    const evaluator = new IndicatorEvaluator(indicators, values);

    evaluator.evaluate(orgUnitId, period);

    expect(values.values.dataValues.find((v) => v.dataElement === "C6dAvSMNGTd")).toEqual({
      attributeOptionCombo: "default",
      categoryOptionCombo: "default",
      dataElement: "C6dAvSMNGTd",
      orgUnit: "orgunitIddhsi2",
      period: "201601",
      value: "15",
    });
    expect(values.names).toEqual({
      C6dAvSMNGTd: "Indicator - 2018D - Family Planning (Long Acting Reversible Methods)",
    });
  });
});
