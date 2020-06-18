class Contract {
  constructor(fieldValues) {
    this.fieldValues = fieldValues;
    this.id = this.fieldValues.id;
    this.orgUnit = fieldValues.orgUnit;
    this.startPeriod = fieldValues.start_contract
      .replace("-", "")
      .substring(0, 6);
    this.endPeriod = fieldValues.end_contract.replace("-", "").substring(0, 6);
  }

  matchPeriod(period) {
    const startMonthPeriods = DatePeriods.split(period, "monthly");

    return startMonthPeriods.some(
      startMonthPeriod =>
        this.startPeriod <= startMonthPeriod &&
        startMonthPeriod <= this.endPeriod
    );
  }
  overlaps(contract) {
    if (contract.id == this.id) {
      return false;
    }
    return (
      contract.startPeriod <= this.endPeriod &&
      this.startPeriod <= contract.endPeriod
    );
  }
}

export default Contract