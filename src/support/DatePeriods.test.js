import DatePeriods from "./DatePeriods";

it("calculates next quarter", () => {
  expect(DatePeriods.next("2016Q1")).toEqual("2016Q2");
  expect(DatePeriods.next("2016Q2")).toEqual("2016Q3");
  expect(DatePeriods.next("2016Q3")).toEqual("2016Q4");
  expect(DatePeriods.next("2016Q4")).toEqual("2017Q1");
});

it("calculates previous quarter", () => {
  expect(DatePeriods.previous("2016Q1")).toEqual("2015Q4");
  expect(DatePeriods.previous("2016Q2")).toEqual("2016Q1");
  expect(DatePeriods.previous("2016Q3")).toEqual("2016Q2");
  expect(DatePeriods.previous("2016Q4")).toEqual("2016Q3");
});

it("calculates previous sixMonth period", () => {
  expect(DatePeriods.previous("2016S1")).toEqual("2015S2");
  expect(DatePeriods.previous("2016S2")).toEqual("2016S1");
});

it("calculates next sixMonth period", () => {
  expect(DatePeriods.next("2016S1")).toEqual("2016S2");
  expect(DatePeriods.next("2016S2")).toEqual("2017S1");
});

it("calculates previous sixMonth period", () => {
  expect(DatePeriods.previous("2016S1")).toEqual("2015S2");
  expect(DatePeriods.previous("2016S2")).toEqual("2016S1");
});

it("split a quarter in monthly periods", () => {
  expect(DatePeriods.monthlyPeriods("2016", "1")).toEqual([
    "201601",
    "201602",
    "201603"
  ]);
});

it("split yearQuarter in monthly periods", () => {
  expect(DatePeriods.split("2016Q4", "monthly")).toEqual([
    "201610",
    "201611",
    "201612"
  ]);
});

it("split yearQuarter in quarterly periods", () => {
  expect(DatePeriods.split("2016Q4", "quarterly")).toEqual(["2016Q4"]);
});

it("split yearQuarter in yearly periods", () => {
  expect(DatePeriods.split("2016Q4", "yearly")).toEqual(["2016"]);
});

it("split monthly in quarterly periods", () => {
  expect(DatePeriods.split("201611", "monthly")).toEqual(["201611"]);
});

it("split monthly in quarterly periods", () => {
  expect(DatePeriods.split("201611", "quarterly")).toEqual(["2016Q4"]);
});

it("split monthly in yearly periods", () => {
  expect(DatePeriods.split("201611", "yearly")).toEqual(["2016"]);
});

it("split year into in sixMonthly periods", () => {
  expect(DatePeriods.split("2016", "sixMonthly")).toEqual(["2016S1", "2016S2"]);
});

it("split quarter into in sixMonthly periods", () => {
  expect(DatePeriods.split("2016Q1", "sixMonthly")).toEqual(["2016S1"]);
  expect(DatePeriods.split("2016Q2", "sixMonthly")).toEqual(["2016S1"]);
  expect(DatePeriods.split("2016Q3", "sixMonthly")).toEqual(["2016S2"]);
  expect(DatePeriods.split("2016Q4", "sixMonthly")).toEqual(["2016S2"]);
});

it("split sixMonthly into in quarter periods", () => {
  expect(DatePeriods.split("2016S1", "quarterly")).toEqual([
    "2016Q1",
    "2016Q2"
  ]);
  expect(DatePeriods.split("2016S2", "quarterly")).toEqual([
    "2016Q3",
    "2016Q4"
  ]);
});

it("split sixMonthly into in sixMonthly periods", () => {
  expect(DatePeriods.split("2016S1", "sixMonthly")).toEqual(["2016S1"]);
});

it("split sixMonth period into in months", () => {
  expect(DatePeriods.split("2016S1", "monthly")).toEqual([
    "201601",
    "201602",
    "201603",
    "201604",
    "201605",
    "201606"
  ]);
  expect(DatePeriods.split("2016S2", "monthly")).toEqual([
    "201607",
    "201608",
    "201609",
    "201610",
    "201611",
    "201612"
  ]);
});

it("split monthly in sixMonthly period", () => {
  expect(DatePeriods.split("201611", "sixMonthly")).toEqual(["2016S2"]);
  expect(DatePeriods.split("201607", "sixMonthly")).toEqual(["2016S2"]);
  expect(DatePeriods.split("201606", "sixMonthly")).toEqual(["2016S1"]);
});

it("split monthly in yearly periods", () => {
  expect(DatePeriods.split("201611", "yearly")).toEqual(["2016"]);
});

it("split yearly in yearly periods", () => {
  expect(DatePeriods.split("2016", "yearly")).toEqual(["2016"]);
});

it("split yearly in quarterly periods", () => {
  expect(DatePeriods.split("2016", "quarterly")).toEqual([
    "2016Q1",
    "2016Q2",
    "2016Q3",
    "2016Q4"
  ]);
});

it("split yearly in quarterly periods", () => {
  expect(DatePeriods.split("2016", "monthly")).toEqual([
    "201601",
    "201602",
    "201603",
    "201604",
    "201605",
    "201606",
    "201607",
    "201608",
    "201609",
    "201610",
    "201611",
    "201612"
  ]);
});

it("next month", () => {
  expect(DatePeriods.next("201601")).toEqual("201602");
  expect(DatePeriods.next("201612")).toEqual("201701");
});

it("next quarter", () => {
  expect(DatePeriods.next("2016Q1")).toEqual("2016Q2");
  expect(DatePeriods.next("2016Q4")).toEqual("2017Q1");
});

it("next year", () => {
  expect(DatePeriods.next("2016")).toEqual("2017");
});

it("previous month", () => {
  expect(DatePeriods.previous("201601")).toEqual("201512");
  expect(DatePeriods.previous("201612")).toEqual("201611");
});

it("previous quarter", () => {
  expect(DatePeriods.previous("2016Q1")).toEqual("2015Q4");
  expect(DatePeriods.previous("2016Q4")).toEqual("2016Q3");
});

it("previous year", () => {
  expect(DatePeriods.previous("2016")).toEqual("2015");
});

it("monthsInQuarter", () => {
  expect(DatePeriods.monthsInQuarter(4)).toEqual(["10", "11", "12"]);
});

it("monthsNamesInQuarter", () => {
  expect(DatePeriods.monthsNamesInQuarter(4)).toEqual([
    "October",
    "November",
    "December"
  ]);
});

it("period2QuarterName", () => {
  expect(
    DatePeriods.split("2014", "quarterly").map(q =>
      DatePeriods.displayName(q, "quarter")
    )
  ).toEqual([
    "January - March 2014",
    "April - June 2014",
    "July - September 2014",
    "October - December 2014"
  ]);
});

it("period2FinancialYearJulyQuarterName", () => {
  expect(
    DatePeriods.split("2018", "quarterly").map(q =>
      DatePeriods.displayName(q, "fyJulyQuarter")
    )
  ).toEqual([
    "FY 2017/2018 Quarter 3 (January - March 2018)",
    "FY 2017/2018 Quarter 4 (April - June 2018)",
    "FY 2018/2019 Quarter 1 (July - September 2018)",
    "FY 2018/2019 Quarter 2 (October - December 2018)"
  ]);
});

it("monthYear", () => {
  expect(
    DatePeriods.split("2014", "monthly").map(q =>
      DatePeriods.displayName(q, "monthYear")
    )
  ).toEqual([
    "January 2014",
    "February 2014",
    "March 2014",
    "April 2014",
    "May 2014",
    "June 2014",
    "July 2014",
    "August 2014",
    "September 2014",
    "October 2014",
    "November 2014",
    "December 2014"
  ]);
});

it("monthYear 2 ", () => {
  expect(
    DatePeriods.split("2014", "quarterly").map(q =>
      DatePeriods.displayName(q, "monthYear")
    )
  ).toEqual(["March 2014", "June 2014", "September 2014", "December 2014"]);
});

it("month", () => {
  expect(
    DatePeriods.split("2014", "quarterly").map(q =>
      DatePeriods.displayName(q, "month")
    )
  ).toEqual(["March", "June", "September", "December"]);
});

it("monthName", () => {
  expect(DatePeriods.monthName("2016Q4")).toEqual("December");
  expect(DatePeriods.monthName("201611")).toEqual("November");
});

it("sixMonth", () => {
  expect(DatePeriods.displayName("2016S1", "sixMonth")).toEqual(
    "January - June 2016"
  );
  expect(DatePeriods.displayName("2016S2", "sixMonth")).toEqual(
    "July - December 2016"
  );
});

it("eduQuarter", () => {
  expect(DatePeriods.displayName("2016Q4", "eduQuarter")).toEqual(
    "2016-2017 T1 - Septembre - Décembre"
  );
  expect(DatePeriods.displayName("2017Q1", "eduQuarter")).toEqual(
    "2016-2017 T2 - Janvier - Mars"
  );
  expect(DatePeriods.displayName("2017Q2", "eduQuarter")).toEqual(
    "2016-2017 T3 - Avril - Juin"
  );
  expect(DatePeriods.displayName("2017Q3", "eduQuarter")).toEqual(
    "2016-2017 XX - Juillet - Aout"
  );

});

it("calculates previous periods", () => {
  expect(DatePeriods.previousPeriods("2018Q3", 3)).toEqual(["2018Q2", "2018Q1", "2017Q4"]);
  expect(DatePeriods.previousPeriods("201802", 3)).toEqual(["201801", "201712", "201711"]);
  expect(DatePeriods.previousPeriods("2018", 3)).toEqual(["2017", "2016", "2015"]);
});

it("calculates next periods", () => {
  expect(DatePeriods.nextPeriods("2018Q3", 3)).toEqual(["2018Q4", "2019Q1", "2019Q2"]);
  expect(DatePeriods.nextPeriods("201802", 3)).toEqual(["201803", "201804", "201805"]);
  expect(DatePeriods.nextPeriods("2018", 3)).toEqual(["2019", "2020", "2021"]);
});