const MONTH_TO_QUARTER = {
  1: "1",
  2: "1",
  3: "1",
  4: "2",
  5: "2",
  6: "2",
  7: "3",
  8: "3",
  9: "3",
  10: "4",
  11: "4",
  12: "4"
};

const MONTH_NAMES_BY_QUARTER = {
  "1": ["January", "February", "March"],
  "2": ["April", "May", "June"],
  "3": ["July", "August", "September"],
  "4": ["October", "November", "December"]
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const MONTH_NUMBER_BY_QUARTER = {
  "1": ["1", "2", "3"],
  "2": ["4", "5", "6"],
  "3": ["7", "8", "9"],
  "4": ["10", "11", "12"]
};

const YEARLY = "yearly";
const MONTHLY = "monthly";
const QUARTERLY = "quarterly";
const SIX_MONTHLY = "sixMonthly";

const FORMAT_FY_JULY_QUARTER = "fyJulyQuarter";
const FORMAT_QUARTER = "quarter";
const FORMAT_MONTH = "month";
const FORMAT_MONTH_YEAR = "monthYear";

const SUPPORTED_FORMATS = [
  FORMAT_FY_JULY_QUARTER,
  FORMAT_QUARTER,
  FORMAT_MONTH,
  FORMAT_MONTH_YEAR
];

class DatePeriods {
  static padMonth(n) {
    return n < 10 ? "0" + n : n;
  }
  static month2quarter(month) {
    return MONTH_TO_QUARTER[month];
  }
  static dhis2MonthPeriod(year, month) {
    return year + "" + this.padMonth(month);
  }
  static dhis2QuarterPeriod(year, month) {
    return year + "Q" + this.month2quarter(month);
  }

  static dhis2QuarterPeriodShort(month) {
    return this.month2quarter(month);
  }

  static monthsInQuarter(quarterIntOrString) {
    let quarter = "" + quarterIntOrString;
    let months = MONTH_NUMBER_BY_QUARTER[quarter];
    if (months === undefined) {
      throw new Error("Doesn't appear to be a quarter" + quarter);
    }
    return months;
  }

  static monthsNamesInQuarter(quarterIntOrString) {
    let quarter = "" + quarterIntOrString;
    let months = [];

    months = MONTH_NAMES_BY_QUARTER[quarter];
    if (months === undefined) {
      throw new Error("Doesn't appear to be a quarter" + quarter);
    }
    return months;
  }

  static currentQuarter() {
    let currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 2);
    return (
      currentDate.getFullYear() +
      "Q" +
      this.quarterByMonth(currentDate.getMonth())
    );
  }

  static monthName(period) {
    const year_months = this.split(period, MONTHLY);
    const year_month = year_months[year_months.length - 1];
    const month = year_month.slice(4);
    const monthNumber = parseInt(month, 0);
    return MONTH_NAMES[monthNumber - 1];
  }

  static monthNameYear(period) {
    const year_months = this.split(period, MONTHLY);
    const year_month = year_months[year_months.length - 1];
    const year = year_month.slice(0, 4);
    const month = year_month.slice(4);
    const monthNumber = parseInt(month, 0);
    return MONTH_NAMES[monthNumber - 1] + " " + year;
  }

  static displayName(dhis2period, format) {
    if (format === FORMAT_FY_JULY_QUARTER) {
      return this.period2FinancialYearJulyQuarterName(dhis2period);
    } else if (format === FORMAT_QUARTER) {
      return this.period2QuarterName(dhis2period);
    } else if (format === FORMAT_MONTH) {
      return this.monthName(dhis2period);
    } else if (format === FORMAT_MONTH_YEAR) {
      return this.monthNameYear(dhis2period);
    }

    throw new Error(
      "unsupported format '" + format + "' see " + SUPPORTED_FORMATS.join(",")
    );
  }

  static period2QuarterName(dhis2period) {
    const yearPeriod = this.split(dhis2period, YEARLY)[0];
    const quarterPeriod = this.split(dhis2period, QUARTERLY)[0];
    const monthsPeriod = this.split(quarterPeriod, MONTHLY);
    return (
      [monthsPeriod[0], monthsPeriod[2]]
        .map(monthPeriod => this.monthName(monthPeriod))
        .join(" - ") +
      " " +
      yearPeriod
    );
  }

  static period2FinancialYearJulyQuarterName(dhis2period) {
    return (
      this.financialJulyQuarterName(dhis2period) +
      " (" +
      this.period2QuarterName(dhis2period) +
      ")"
    );
  }

  static financialJulyQuarterName(dhis2period) {
    const yearPeriod = this.split(dhis2period, YEARLY)[0];
    const quarterPeriod = this.split(dhis2period, QUARTERLY)[0];

    let year = parseInt(yearPeriod, 0);
    let quarter = parseInt(quarterPeriod.slice(5), 0);

    if (quarter <= 2) {
      year = year - 1;
      quarter = quarter + 2;
    } else {
      quarter = quarter - 2;
    }

    return "FY " + year + "/" + (year + 1) + " Quarter " + quarter;
  }

  static next(period) {
    if (period.includes("Q")) {
      return this.nextQuarter(period);
    }
    if (period.length === 6) {
      return this.nextYearMonth(period);
    }
    if (period.length === 4) {
      return this.nextYear(period);
    }
  }

  static previous(period) {
    if (period.includes("Q")) {
      return this.previousQuarter(period);
    }
    if (period.length === 6) {
      return this.previousYearMonth(period);
    }
    if (period.length === 4) {
      return this.previousYear(period);
    }
  }

  static nextYearMonth(period) {
    let year = parseInt(period.slice(0, 4), 0);
    let month = parseInt(period.slice(4, 6), 0);
    if (month === 12) {
      year += 1;
      month = 1;
    } else {
      month += 1;
    }
    return "" + year + this.padMonth(month);
  }

  static previousYearMonth(period) {
    let year = parseInt(period.slice(0, 4), 0);
    let month = parseInt(period.slice(4, 6), 0);
    if (month === 1) {
      year -= 1;
      month = 12;
    } else {
      month -= 1;
    }
    return "" + year + this.padMonth(month);
  }

  static nextYear(period) {
    let year = parseInt(period.slice(0, 4), 0);
    return "" + (year + 1);
  }

  static previousYear(period) {
    let year = parseInt(period.slice(0, 4), 0);
    return "" + (year - 1);
  }

  static nextQuarter(period) {
    let year = parseInt(period.slice(0, 4), 0);
    let quarter = parseInt(period.slice(5, 6), 0);
    if (quarter === 4) {
      year += 1;
      quarter = 1;
    } else if (quarter < 4) {
      quarter += 1;
    }
    return year + "Q" + quarter;
  }

  static sixMonthlyQuarters(year, quarterStr) {
    let quarter = parseInt(quarterStr, 0);
    let quarters = [];
    if (quarter === 1 || quarter === 2) {
      quarters = [1, 2];
    } else {
      quarters = [3, 4];
    }
    return quarters.map(q => year + "Q" + q);
  }

  static previousQuarter(period) {
    let year = parseInt(period.slice(0, 4), 0);
    let quarter = parseInt(period.slice(5, 6), 0);
    if (quarter === 1) {
      year -= 1;
      quarter = 4;
    } else if (quarter > 1) {
      quarter -= 1;
    }
    return year + "Q" + quarter;
  }

  static quarterByMonth(month) {
    let quarter = 0;
    if (month >= 1 && month <= 3) {
      quarter = 1;
    }
    if (month >= 4 && month <= 6) {
      quarter = 2;
    }
    if (month >= 7 && month <= 9) {
      quarter = 3;
    }
    if (month >= 10 && month <= 12) {
      quarter = 4;
    }
    return quarter;
  }

  static split(period, splitType) {
    if (period.includes("Q")) {
      return this.splitYearQuarter(period, splitType);
    }
    if (period.length === 6) {
      return this.splitYearMonth(period, splitType);
    }
    if (period.length === 4) {
      return this.splitYear(period, splitType);
    }
    throw new Error(
      "don't know how to split " +
        period +
        " as '" +
        splitType +
        "' length" +
        period.length
    );
  }

  static splitYear(period, splitType) {
    let year = parseInt(period.slice(0, 4), 0);
    if (splitType === MONTHLY) {
      return [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12"
      ].map(month => "" + year + month);
    }

    if (splitType === QUARTERLY) {
      return ["Q1", "Q2", "Q3", "Q4"].map(quarter => "" + year + quarter);
    }
    if (splitType === YEARLY) {
      return ["" + year];
    }
  }

  static splitYearQuarter(period, splitType) {
    let year = parseInt(period.slice(0, 4), 0);
    let quarter = parseInt(period.slice(5, 6), 0);
    if (splitType === MONTHLY) {
      return this.monthsInQuarter(quarter).map(month =>
        this.dhis2MonthPeriod(year, month)
      );
    }

    if (splitType === SIX_MONTHLY) {
      return this.sixMonthlyQuarters(year, quarter);
    }

    if (splitType === QUARTERLY) {
      return [period];
    }
    if (splitType === YEARLY) {
      return ["" + year];
    }
    throw new Error("unknown splitType" + splitType);
  }

  static splitYearMonth(period, splitType) {
    let year = parseInt(period.slice(0, 4), 0);
    let month = parseInt(period.slice(4, 6), 0);
    if (splitType === MONTHLY) {
      return [period];
    }
    if (splitType === QUARTERLY) {
      const quarter = this.month2quarter(month);
      return ["" + year + "Q" + quarter];
    }
    if (splitType === YEARLY) {
      return ["" + year];
    }
    throw new Error("unknown splitType" + splitType);
  }

  static monthlyPeriods(year, quarter) {
    return this.monthsInQuarter(quarter).map(month =>
      this.dhis2MonthPeriod(year, month)
    );
  }
}

export default DatePeriods;
