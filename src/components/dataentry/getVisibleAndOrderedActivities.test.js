import _ from "lodash";
import { getVisibleAndOrderedActivities } from "./getVisibleAndOrderedActivities";

describe("getVisibleAndOrderedActivities", () => {
  const createQuantityPmaPackage = () => {
    return {
      name: "Quantité PMA",
      description: "Quantité PMA",
      code: "quantite_pma",
      frequency: "monthly",
      kind: "single",
      activity_decision_tables: [],
      activities: [
        {
          name: "Nouvelle consultation curative",
          code: "quant01",
          verifiee: "PomlUynlgCl",
          declaree: "roUjqa7stCo",
          validee: "YAMlbdR0wVt",
          subsides: "Ey3nvMokVVf",
          prix_unitaire: "kqjh11e8gXt",
        },
        {
          name: "Nouvelle consult curative pour des pers indigents (max 5%)",
          code: "quant02",
          verifiee: "vXajvdGswg2",
          declaree: "NFnh2vh0zyi",
          validee: "s9SkIwVqzG7",
          subsides: "PZZxPMrSO4h",
          prix_unitaire: "wkMEoCXCnqi",
        },
        {
          name: "Chirurgie mineure",
          code: "quant03",
          verifiee: "G5nRbwVb0cd",
          declaree: "VBIYcOJSmpU",
          validee: "jLd5h3DpVlG",
          subsides: "HteaMQisttG",
          prix_unitaire: "cHKHMGox1AA",
        },
        {
          name: "Chirurgie majeure",
          code: "quant04",
          verifiee: "G5nRbwVb0cd",
          declaree: "VBIYcOJSmpU",
          validee: "jLd5h3DpVlG",
          subsides: "HteaMQisttG",
          prix_unitaire: "cHKHMGox1AA",
        },
      ],
    };
  };

  const orgUnitCs = {
    id: "zaerz654",
    name: "Orgunit name",
    activeContracts: [
      {
        startPeriod: "2019Q1",
        endPeriod: "2020Q2",
        fieldValues: {
          equite_fbr: "categorie_iii",
          contract_type: "cs",
        },
      },
    ],
  };


  const orgUnitCsr = {
    id: "zaerz654",
    name: "Orgunit name",
    activeContracts: [
      {
        startPeriod: "2019Q1",
        endPeriod: "2020Q2",
        fieldValues: {
          equite_fbr: "categorie_v",
          contract_type: "csr",
        },
      },
    ],
  };

  it("return original activities if no decision tables", () => {
    const quantitePmaPackage = createQuantityPmaPackage();
    expect(getVisibleAndOrderedActivities(quantitePmaPackage).map((a) => a.code)).toEqual([
      "quant01",
      "quant02",
      "quant03",
      "quant04",
    ]);
  });

  it("return original activities if no decision tables with visible and order output", () => {
    const quantitePmaPackage = createQuantityPmaPackage();
    quantitePmaPackage.activity_decision_tables.push({
      content: [
        "in:level_1,in:level_2,in:level_3,out:equity_bonus",
        "belgium,*,*,11",
        "belgium,namur,*,1",
        "belgium,brussel,*,2",
        "belgium,brussel,kk,7",
      ].join("\n"),
      start_period: undefined,
      end_period: undefined,
      out_headers: ["equity_bonus"],
      in_headers: ["level_1", "level_2", "level_3"],
    });
    expect(getVisibleAndOrderedActivities(quantitePmaPackage).map((a) => a.code)).toEqual([
      "quant01",
      "quant02",
      "quant03",
      "quant04",
    ]);
  });

  it("return original activities if no decision tables with visible and order output", () => {
    const quantitePmaPackage = createQuantityPmaPackage();
    quantitePmaPackage.activity_decision_tables.push({
      content: [
        "in:level_1,in:level_2,in:level_3,out:equity_bonus",
        "belgium,*,*,11",
        "belgium,namur,*,1",
        "belgium,brussel,*,2",
        "belgium,brussel,kk,7",
      ].join("\n"),
      start_period: undefined,
      end_period: undefined,
      out_headers: ["equity_bonus"],
      in_headers: ["level_1", "level_2", "level_3"],
    });
    expect(getVisibleAndOrderedActivities(quantitePmaPackage).map((a) => a.code)).toEqual([
      "quant01",
      "quant02",
      "quant03",
      "quant04",
    ]);
  });

  it("return visible activities if decision tables with visible only output", () => {
    const quantitePmaPackage = createQuantityPmaPackage();

    quantitePmaPackage.activity_decision_tables.push({
      content: [
        "in:activity_code,in:groupset_code_contract_type,out:visible",
        "quant01,cs,1",
        "quant02,cs,1",
        "quant03,cs,0",
        "quant04,cs,1",
      ].join("\n"),
      start_period: undefined,
      end_period: undefined,
      out_headers: ["visible"],
      in_headers: ["activity_code","groupset_code_contract_type"],
    });

    expect(getVisibleAndOrderedActivities(quantitePmaPackage, "202101", orgUnitCs).map((a) => a.code)).toEqual([
      "quant01",
      "quant02",
      "quant04",
    ]);
  });

  it("return visible and ordered activities if decision tables with visible and order", () => {
    const quantitePmaPackage = createQuantityPmaPackage();

    quantitePmaPackage.activity_decision_tables.push({
      content: [
        "in:activity_code,in:groupset_code_contract_type,out:visible,out:order",
        "quant01,cs,1,4",
        "quant02,cs,1,1",
        "quant03,cs,0,2",
        "quant04,cs,1,2",
        "quant01,csr,0,4",
        "quant02,csr,1,1",
        "quant03,csr,1,2",
        "quant04,csr,0,2",
      ].join("\n"),
      start_period: undefined,
      end_period: undefined,
      out_headers: ["visible","order"],
      in_headers: ["activity_code","groupset_code_contract_type"],
    });

    expect(getVisibleAndOrderedActivities(quantitePmaPackage, "202101", orgUnitCs).map((a) => a.code)).toEqual([
      "quant02",
      "quant04",
      "quant01",
    ]);

    expect(getVisibleAndOrderedActivities(quantitePmaPackage, "202101", orgUnitCsr).map((a) => a.code)).toEqual([
        "quant02",
        "quant03",
      ]);
  });
});
