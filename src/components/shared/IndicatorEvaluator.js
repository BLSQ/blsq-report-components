/* eslint-disable */
String.prototype.scan = function (regex) {
  if (!regex.global) throw new Error("regex must have 'global' flag set");
  var r = [];
  this.replace(regex, function () {
    r.push(Array.prototype.slice.call(arguments, 1, -2));
  });
  return r;
};

/**
 * mimic the indicator evaluation
 * largely inspired by https://github.com/BLSQ/orbf-rules_engine/blob/master/lib/orbf/rules_engine/builders/indicator_expression_parser.rb
 */
class IndicatorEvaluator {
  constructor(indicators, values) {
    indicators.forEach((indicator) => {
      const dependencies = indicator.numerator.scan(/#{([a-zA-Z0-9.]+)}/g).flat();
      indicator.dependencies = dependencies;
    });
    this.indicators = indicators;
    this.values = values;
    this.addIndicatorNames(values);
  }

  evaluate(orgUnitId, period) {
    this.indicators.forEach((indicator) => {
      let indicatorExpression = "" + indicator.numerator;
      let atLeastOneValue = false;
      indicator.dependencies.forEach((dependency) => {
        const value = this.values.amountByOrgUnit(dependency, orgUnitId, period);
        if (value.value !== " ") {
          atLeastOneValue = true;
        }
        indicatorExpression = indicatorExpression.replace(
          "#{" + dependency + "}",
          value.value === " " ? "0" : value.value,
        );
      });
      if (atLeastOneValue) {
        try {
          indicatorExpression = eval(indicatorExpression);
          if (this.values.values.dataValues == undefined) {
            this.values.values.dataValues = []
          }
          this.values.values.dataValues.push({
            attributeOptionCombo: "default",
            categoryOptionCombo: "default",
            dataElement: indicator.id,
            orgUnit: orgUnitId,
            period: period,
            value: "" + indicatorExpression,
          });
        } catch (error) {
          console.log("error evaluating : " + indicatorExpression + " " + error);
        }
      }
    });
  }
  addIndicatorNames(values) {
    this.indicators.forEach((indicator) => (values.names[indicator.id] = "Indicator - " + indicator.name));
  }
}

export default IndicatorEvaluator;
