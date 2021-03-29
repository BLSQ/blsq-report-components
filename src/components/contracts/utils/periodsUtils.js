import DatePeriods from "../../../support/DatePeriods";
import moment from "moment";

export const getStartMonthFromQuarter = (startPeriod) => {
  const startPeriodMonths = DatePeriods.split(startPeriod, "monthly");
  return DatePeriods.monthName(startPeriodMonths[0]);
};

export const getEndMonthFromQuarter = (endPeriod) => {
  const endPeriodMonths = DatePeriods.split(endPeriod, "monthly");
  return DatePeriods.monthName(endPeriodMonths[endPeriodMonths.length - 1]);
};

export const getStartDateFromPeriod = (startPeriod) => {
  if (startPeriod == undefined) {
    return undefined
  }
  const startPeriodMonths = DatePeriods.split(startPeriod, "monthly");
  return moment(startPeriodMonths[0], "YYYYMM").format("YYYY-MM-DD");
};
export const getEndDateFromPeriod = (endPeriod) => {
  if (endPeriod == undefined) {
    return undefined
  }  
  const endPeriodMonths = DatePeriods.split(endPeriod, "monthly");
  return moment(endPeriodMonths[endPeriodMonths.length - 1], "YYYYMM")
    .endOf("month")
    .format("YYYY-MM-DD");
};

export const getQuarterFromDate = (date) => {
  const month = parseInt(moment(date).format("MM"), 10);
  const year = moment(date).format("YYYY");
  return DatePeriods.dhis2QuarterPeriod(year, month);
};

export const getContractDates = (contract) => ({
  startDate: getStartDateFromPeriod(contract.startPeriod),
  endDate: getEndDateFromPeriod(contract.endPeriod),
});

export const isToday = (dateString) => moment(dateString, "MM/DD/YYYY").isSame(moment(), "day");
