import DatePeriods from "../../support/DatePeriods";

const KNOWN_FIELDS = ["contract_start_date", "contract_end_date", "id", "orgUnit"];

class Contract {
  constructor(fieldValues) {
    this.fieldValues = fieldValues;
    this.id = this.fieldValues.id;
    this.orgUnit = fieldValues.orgUnit;    
    this.startPeriod = fieldValues.contract_start_date
      ? fieldValues.contract_start_date.replace("-", "").substring(0, 6)
      : null;
    this.endPeriod = fieldValues.contract_end_date
      ? fieldValues.contract_end_date.replace("-", "").substring(0, 6)
      : null;

    this.codes = [];

    Object.keys(fieldValues).forEach((k) => {
      if (!KNOWN_FIELDS.includes(k)) {
        this.codes.push(fieldValues[k]);
      }
    });
    this.orgUnit.codes = this.codes;
  }

  matchPeriod(period) {
    const startMonthPeriods = DatePeriods.split(period, "monthly");

    return startMonthPeriods.some(
      (startMonthPeriod) => this.startPeriod <= startMonthPeriod && (this.endPeriod == undefined || startMonthPeriod <= this.endPeriod),
    );
  }
  overlaps(contract) {
    if (contract.id === this.id) {
      return false;
    }
    return contract.startPeriod <= this.endPeriod && this.startPeriod <= contract.endPeriod;
  }
}

export default Contract;
