import DecisionTable from "./DecisionTable";

describe("matchingRule", () => {
  const table = new DecisionTable({
    content: [
      "in:level_1,in:level_2,in:level_3,out:equity_bonus",
      "belgium,*,*,11",
      "belgium,namur,*,1",
      "belgium,brussel,*,2",
      "belgium,brussel,kk,7",
    ].join("\n"),
    start_period: undefined,
    end_period: undefined,
  });


  it("locate best rule for the rest of belgium", () => {
    expect(table.matchingRule({ level_1: "belgium", level_2: "houtsiplou", level_3: undefined })["equity_bonus"]).toEqual("11");
  });

  
  it("locate best rule for kk", () => {
    expect(table.matchingRule({ level_1: "belgium", level_2: "namur", level_3: "kk" })["equity_bonus"]).toEqual("1");
  });

  it("locate best rule for namur", () => {
    expect(table.matchingRule({ level_1: "belgium", level_2: "namur" })["equity_bonus"]).toEqual("1");
  });

  it("locate best rule for brussel", () => {
    expect(table.matchingRule({ level_1: "belgium", level_2: "brussel" })["equity_bonus"]).toEqual("2");
  });

  it("locate best rule for brussel kk", () => {
    expect(table.matchingRule({ level_1: "belgium", level_2: "brussel", level_3:"kk" })["equity_bonus"]).toEqual("7");
  });


  it("return nil if none matching", () => {
    expect(table.matchingRule({ level_1: "holland", level_2: "houtsiplou" })).toEqual(undefined);
  });


  describe( "matchPeriod" , () => {

  const table = new DecisionTable({
    content: [
      "in:level_1,in:level_2,in:level_3,out:equity_bonus",
      "belgium,*,*,11",
      "belgium,namur,*,1",
      "belgium,brussel,*,2",
      "belgium,brussel,kk,7",
    ].join("\n"),
    start_period: 202001,
    end_period: 202006,
  });

  it("doesn't match before" , () => {
    expect(table.matchPeriod("201912")).toEqual(false)
  })

  it("match in between" , () => {
    expect(table.matchPeriod("202001")).toEqual(true)
    expect(table.matchPeriod("202002")).toEqual(true)
    expect(table.matchPeriod("202003")).toEqual(true)
    expect(table.matchPeriod("202004")).toEqual(true)
    expect(table.matchPeriod("202005")).toEqual(true)
    expect(table.matchPeriod("202006")).toEqual(true)
  })

  it("doesn't match after" , () => {
    expect(table.matchPeriod("202007")).toEqual(false)
  })


})


});
