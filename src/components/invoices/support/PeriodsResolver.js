
import DatePeriods from "../../../support/DatePeriods"

class PeriodsResolver {
  resolvePeriods(orgUnits, period, invoiceType, orgUnitId) {
    const year = period.slice(0, 4);
    const quarter = DatePeriods.split(period, "quarterly")[0].slice(5, 6);

    let quarterPeriods = DatePeriods.split(period, "quarterly");
    let monthlyPeriods = DatePeriods.split(period, "monthly");
    let yearlyPeriods = DatePeriods.split(period, "yearly");
    let yearlyJulyPeriods = DatePeriods.split(period, "financialJuly");

    if (invoiceType.previousPeriods) {
      quarterPeriods = quarterPeriods.concat(
        DatePeriods.previousPeriods(
          DatePeriods.split(period, "quarterly")[0],
          invoiceType.previousPeriods
        )
      );
      monthlyPeriods = monthlyPeriods.concat(
        DatePeriods.previousPeriods(DatePeriods.split(period, "monthly")[0], 3)
      );
      yearlyPeriods = yearlyPeriods.concat(
        DatePeriods.previousPeriods(
          DatePeriods.split(period, "yearly")[0],
          invoiceType.previousPeriods
        )
      );
    }

    return {
      period: period,
      quarterPeriod: period,
      quarterPeriods: quarterPeriods,
      monthlyPeriods: monthlyPeriods,
      yearlyPeriods: yearlyPeriods,
      yearlyJulyPeriods: yearlyJulyPeriods,
      year: year,
      quarter: quarter
    };
  }
}

export default PeriodsResolver