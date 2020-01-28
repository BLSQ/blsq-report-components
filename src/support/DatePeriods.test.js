import DatePeriods from "./DatePeriods";
DatePeriods.setLocale("en");

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

it("split financialJuly to month  ", () => {
  expect(DatePeriods.split("2016July", "monthly")).toEqual([
    "201607",
    "201608",
    "201609",
    "201610",
    "201611",
    "201612",
    "201701",
    "201702",
    "201703",
    "201704",
    "201705",
    "201706"
  ]);
});

it("split financialJuly to quarter  ", () => {
  expect(DatePeriods.split("2016July", "quarterly")).toEqual([
    "2016Q3",
    "2016Q4",
    "2017Q1",
    "2017Q2"
  ]);
});

it("split financialJuly to month  ", () => {
  expect(DatePeriods.split("2016July", "yearly")).toEqual(["2016", "2017"]);
});

it("split financialJuly to month  ", () => {
  expect(DatePeriods.split("2016July", "sixMonthly")).toEqual([
    "2016S2",
    "2017S1"
  ]);
});

it("split month to financialJuly ", () => {
  expect(DatePeriods.split("201606", "financialJuly")).toEqual(["2015July"]);

  expect(DatePeriods.split("201607", "financialJuly")).toEqual(["2016July"]);
});

it("split sixmonthly to financialJuly ", () => {
  expect(DatePeriods.split("2016S1", "financialJuly")).toEqual(["2015July"]);
  expect(DatePeriods.split("2016S2", "financialJuly")).toEqual(["2016July"]);
});

it("split yearQuarter to financialJuly ", () => {
  expect(DatePeriods.split("2016Q1", "financialJuly")).toEqual(["2015July"]);
  expect(DatePeriods.split("2016Q2", "financialJuly")).toEqual(["2015July"]);
  expect(DatePeriods.split("2016Q3", "financialJuly")).toEqual(["2016July"]);
  expect(DatePeriods.split("2016Q4", "financialJuly")).toEqual(["2016July"]);
});

it("split yearQuarter to financialJuly ", () => {
  expect(DatePeriods.split("2016", "financialJuly")).toEqual([
    "2015July",
    "2016July"
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

it("detect month", () => {
  expect(DatePeriods.detect("201601")).toEqual("monthly");
});

it("detect quarterly", () => {
  expect(DatePeriods.detect("2016Q")).toEqual("quarterly");
});

it("detect yearly", () => {
  expect(DatePeriods.detect("2016")).toEqual("yearly");
});

it("detect yearly", () => {
  expect(DatePeriods.detect("2016July")).toEqual("financialJuly");
});

it("detect sixMonthly", () => {
  expect(DatePeriods.detect("2016S1")).toEqual("sixMonthly");
  expect(DatePeriods.detect("2016S2")).toEqual("sixMonthly");
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

it("next financialJuly", () => {
  expect(DatePeriods.next("2016July")).toEqual("2017July");
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

it("previous financialJuly", () => {
  expect(DatePeriods.previous("2016July")).toEqual("2015July");
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

it("formats quarterly", () => {
  expect(
    DatePeriods.format(
      "2019Q3",
      "Financial year ${financialJulyYear}/${financialJulyYearPlus1} - Quarter ${financialQuarterNumber} ${monthQuarterStart}-${monthQuarterEnd}"
    )
  ).toEqual("Financial year 2019/2020 - Quarter 1 July-September");
  expect(
    DatePeriods.format(
      "2019Q2",
      "Financial year ${financialJulyYear}/${financialJulyYearPlus1} - Quarter ${financialQuarterNumber} ${monthQuarterStart}-${monthQuarterEnd}"
    )
  ).toEqual("Financial year 2018/2019 - Quarter 4 April-June");
});
it("formats monthly periods", () => {
  expect(
    DatePeriods.format(
      "201903",
      " dhis2period: ${dhis2period} " +
        "financialJulyYear: ${financialJulyYear} " +
        "financialJulyYearPlus1: ${financialJulyYearPlus1} " +
        "year: ${year} " +
        "quarterNumber: ${quarterNumber} " +
        "financialQuarterNumber: ${financialQuarterNumber} " +
        "monthNumber: ${monthNumber} " +
        "monthName: ${monthName} " +
        "monthQuarterStart: ${monthQuarterStart} " +
        "monthQuarterEnd: ${monthQuarterEnd} "
    )
  ).toEqual(
    " dhis2period: 201903 " +
      "financialJulyYear: 2018 " +
      "financialJulyYearPlus1: 2019 " +
      "year: 2019 quarterNumber: 1 " +
      "financialQuarterNumber: 3 " +
      "monthNumber: 3 monthName: March " +
      "monthQuarterStart: January " +
      "monthQuarterEnd: March "
  );
});
it("formats detects unknown token", () => {
  expect(() => {
    DatePeriods.format(
      "201903",
      " dhis2period: ${dhis2period} ${unknown token}"
    );
  }).toThrowError(
    'unknown placeholder :\'unknown token\' only knows {"dhis2period":"201903","financialJulyYear":2018,"financialJulyYearPlus1":2019,"year":2019,"quarterNumber":1,"financialQuarterNumber":3,"monthNumber":3,"monthName":"March","monthQuarterStart":"January","monthQuarterEnd":"March"}'
  );
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

it("monthYear", () => {
  try {
    DatePeriods.setMonthTranslations([
      "Tir",
      "Yekatit",
      "Megabit",
      "Miyazia",
      "Ginbot",
      "Sene",
      "Hamle",
      "Nehase",
      "Meskerem",
      "Tikimt",
      "Hidar",
      "Tahisas"
    ]);
    expect(
      DatePeriods.split("2014", "monthly").map(q =>
        DatePeriods.displayName(q, "monthYear")
      )
    ).toEqual([
      "Tir 2014",
      "Yekatit 2014",
      "Megabit 2014",
      "Miyazia 2014",
      "Ginbot 2014",
      "Sene 2014",
      "Hamle 2014",
      "Nehase 2014",
      "Meskerem 2014",
      "Tikimt 2014",
      "Hidar 2014",
      "Tahisas 2014"
    ]);
  } finally {
    DatePeriods.setLocale("en");
  }
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
    "2016-2017 T1 - September - December"
  );
  expect(DatePeriods.displayName("2017Q1", "eduQuarter")).toEqual(
    "2016-2017 T2 - January - March"
  );
  expect(DatePeriods.displayName("2017Q2", "eduQuarter")).toEqual(
    "2016-2017 T3 - April - June"
  );
  expect(DatePeriods.displayName("2017Q3", "eduQuarter")).toEqual(
    "2016-2017 XX - July - August"
  );
});

it("calculates previous periods", () => {
  expect(DatePeriods.previousPeriods("2018Q3", 3)).toEqual([
    "2017Q4",
    "2018Q1",
    "2018Q2"
  ]);
  expect(DatePeriods.previousPeriods("201802", 3)).toEqual([
    "201711",
    "201712",
    "201801"
  ]);
  expect(DatePeriods.previousPeriods("2018", 3)).toEqual([
    "2015",
    "2016",
    "2017"
  ]);
});

it("calculates next periods", () => {
  expect(DatePeriods.nextPeriods("2018Q3", 3)).toEqual([
    "2018Q4",
    "2019Q1",
    "2019Q2"
  ]);
  expect(DatePeriods.nextPeriods("201802", 3)).toEqual([
    "201803",
    "201804",
    "201805"
  ]);
  expect(DatePeriods.nextPeriods("2018", 3)).toEqual(["2019", "2020", "2021"]);
});

it("split quarter in months by split type", () => {
  expect(DatePeriods.split("2018Q4", "monthly")).toEqual([
    "201810",
    "201811",
    "201812"
  ]);
  expect(DatePeriods.split("2018Q4", "quarterlyFirstMonths")).toEqual([
    "201810"
  ]);
  expect(DatePeriods.split("2019Q1", "quarterlyFirstMonths")).toEqual([
    "201901"
  ]);
  expect(DatePeriods.split("2018Q4", "quarterlyTwoLastMonths")).toEqual([
    "201811",
    "201812"
  ]);
  expect(DatePeriods.split("2019Q1", "quarterlyTwoLastMonths")).toEqual([
    "201902",
    "201903"
  ]);
});
