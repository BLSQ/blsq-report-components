class IncentiveSupport {
  static commonPrefix(names) {
    let prefixCandidate = names[0];

    for (
      let index = prefixCandidate.length;
      index > 0;
      index = prefixCandidate.lastIndexOf("-") >= 0 ? prefixCandidate.lastIndexOf("-") : 0
    ) {
      prefixCandidate = prefixCandidate.slice(0, index);
      if (names.every((name) => name.startsWith(prefixCandidate))) {
        return names[0].slice(0, index + 1);
      }
    }
    return "";
  }

  static computePeriods(periodType, period) {
    const year = period.slice(0, 4);
    const yearNumber = parseInt(year, 0);
    let periods;
    if (periodType === "Quarterly") {
      periods = [yearNumber - 1 + "Q4", year + "Q1", year + "Q2", year + "Q3", year + "Q4", yearNumber + 1 + "Q1"];
    } else if (periodType === "QuarterlyNov") {
      periods = [
        yearNumber - 1 + "NovQ4",
        year + "NovQ1",
        year + "NovQ2",
        year + "NovQ3",
        year + "NovQ4",
        yearNumber + 1 + "NovQ1",
      ];
    } else if (periodType === "FinancialJuly") {
      periods = [yearNumber - 1 + "July", yearNumber + "July", yearNumber + 1 + "July"];
    } else if (periodType === "Yearly") {
      periods = [yearNumber - 1 + "", yearNumber + "", yearNumber + 1 + ""];
    } else if (periodType === "YearlyNov") {
      periods = [yearNumber - 1 + "Nov", yearNumber + "Nov", yearNumber + 1 + "Nov"];
    } else if (periodType === "Monthly") {
      periods = [
        year + "01",
        year + "02",
        year + "03",
        year + "04",
        year + "05",
        year + "06",
        year + "07",
        year + "08",
        year + "09",
        year + "10",
        year + "11",
        year + "12",
      ];
    } else {
      throw new Error("Unsupported periodType " + periodType);
    }
    return periods;
  }
}

export default IncentiveSupport;
