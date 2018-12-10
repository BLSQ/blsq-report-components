import DatePeriods from "../../support/DatePeriods";

class GenericMapper {
  mapValues(request, values) {
    const invoices = [];

    const paymentRule = request.invoiceType.paymentRule;
    Object.keys(paymentRule.packages).forEach(packageCode => {
      const orbfPackage = paymentRule.packages[packageCode];
      const periods = DatePeriods.split(request.period, orbfPackage.frequency);

      periods.forEach(period => {
        invoices.push({
          orbfPackage: orbfPackage,
          period: period,
          activities: orbfPackage.activities.map(activity => {
            const activityAmounts = {
              descriptor: activity
            };
            Object.keys(activity).forEach(state => {
              activityAmounts[state] = values.amount(activity[state], period);
            });
            return activityAmounts;
          }),
          totals: this.mapTotals(request, values, orbfPackage, period)
        });
      });
    });

    return {
      request: request,
      orgUnit: request.mainOrgUnit,
      period: request.period,
      values: values.values.dataValues,
      invoices: invoices
    };
  }

  mapTotals(request, values, orbfPackage, period) {
    const totals = {};
    values.assignFormulaAmounts(totals, orbfPackage.formulas, period);
    return totals;
  }
}

export default GenericMapper;
