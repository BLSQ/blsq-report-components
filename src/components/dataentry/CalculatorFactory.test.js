import _ from "lodash"
import { generateCalculator } from "./CalculatorFactory"

describe("CalculatorFactory", () => {

    const packages = {
        "quantite_pma": {
            "name": "Quantité PMA",
            "description": "Quantité PMA",
            "code": "quantite_pma",
            "frequency": "monthly",
            "kind": "single",
            "activities": [
                {
                    "name": "Nouvelle consultation curative",
                    "code": "quant01",
                    "verifiee": "PomlUynlgCl",
                    "declaree": "roUjqa7stCo",
                    "validee": "YAMlbdR0wVt",
                    "subsides": "Ey3nvMokVVf",
                    "prix_unitaire": "kqjh11e8gXt"
                },
                {
                    "name": "Nouvelle consult curative pour des pers indigents (max 5%)",
                    "code": "quant02",
                    "verifiee": "vXajvdGswg2",
                    "declaree": "NFnh2vh0zyi",
                    "validee": "s9SkIwVqzG7",
                    "subsides": "PZZxPMrSO4h",
                    "prix_unitaire": "wkMEoCXCnqi"
                },
                {
                    "name": "Chirurgie mineure",
                    "code": "quant03",
                    "verifiee": "G5nRbwVb0cd",
                    "declaree": "VBIYcOJSmpU",
                    "validee": "jLd5h3DpVlG",
                    "subsides": "HteaMQisttG",
                    "prix_unitaire": "cHKHMGox1AA"
                },
            ],
            "data_set_ids": [],
            "data_element_group_ids": [],
            "main_org_unit_group_ids": [
                "l8rvojVTile",
                "QJPLrdlbloZ"
            ],
            "target_org_unit_group_ids": [],
            "groupset_ext_id": null,
            "matching_groupset_ids": [
                "H4XnqvSQYbh",
                "XLCi1Al1WE9"
            ],
            "deg_ext_id": "CylI8BbOKzg",
            "activity_formulas": {
                "subsides": {
                    "short_name": "subsides",
                    "description": "Montant production quantité",
                    "expression": "ROUND(validee * prix_unitaire,2)",
                    "frequency": "monthly",
                    "exportable_formula_code": null
                },
                "prix_unitaire": {
                    "short_name": "Prix unitaire",
                    "description": "Prix unitaire prenant en compte la categorie d'équité",
                    "expression": "bareme_unitaire",
                    "frequency": "monthly",
                    "exportable_formula_code": null
                },
                "quarterly_subsides": {
                    "short_name": "quarterly_subsides",
                    "description": "quarterly_subsides",
                    "expression": "sum(%{subsides_current_quarter_values})",
                    "frequency": "monthly",
                    "exportable_formula_code": null
                    
                }
            },
            "activity_decision_tables": [
                {
                    "comment": "prices for 2020Q1",
                    "start_period": "202001",
                    "end_period": "202003",
                    "in_headers": [
                        "activity_code",
                        "groupset_code_equite_fbr"
                    ],
                    "out_headers": [
                        "bareme_unitaire"
                    ],
                    "content": "\"in:activity_code\",\"in:groupset_code_equite_fbr\",\"out:bareme_unitaire\"\r\n\"quant01\",\"categorie_i\",\"0.4\"\r\n\"quant01\",\"categorie_ii\",\"0.5\"\r\n\"quant01\",\"categorie_iii\",\"0.5\"\r\n\"quant01\",\"categorie_iv\",\"0.6\"\r\n\"quant01\",\"categorie_v\",\"0.6\"\r\n\"quant01\",\"categorie_vi\",\"0.7\"\r\n\"quant01\",\"categorie_vii\",\"0.8\"\r\n\"quant01\",\"categorie_viii\",\"0.9\"\r\n\"quant02\",\"categorie_i\",\"2.5\"\r\n\"quant02\",\"categorie_ii\",\"2.7\"\r\n\"quant02\",\"categorie_iii\",\"3\"\r\n\"quant02\",\"categorie_iv\",\"3.5\"\r\n\"quant02\",\"categorie_v\",\"3.7\"\r\n\"quant02\",\"categorie_vi\",\"4\"\r\n\"quant02\",\"categorie_vii\",\"4.6\"\r\n\"quant02\",\"categorie_viii\",\"5.4\"\r\n\"quant04\",\"categorie_i\",\"2.1\"\r\n\"quant04\",\"categorie_ii\",\"2.3\"\r\n\"quant04\",\"categorie_iii\",\"2.6\"\r\n\"quant04\",\"categorie_iv\",\"3\"\r\n\"quant04\",\"categorie_v\",\"3.2\"\r\n\"quant04\",\"categorie_vi\",\"3.4\"\r\n\"quant04\",\"categorie_vii\",\"4\"\r\n\"quant04\",\"categorie_viii\",\"4.6\"\r\n\"quant03\",\"categorie_i\",\"3.6\"\r\n\"quant03\",\"categorie_ii\",\"3.9\"\r\n\"quant03\",\"categorie_iii\",\"4.3\"\r\n\"quant03\",\"categorie_iv\",\"5\"\r\n\"quant03\",\"categorie_v\",\"5.3\"\r\n\"quant03\",\"categorie_vi\",\"5.7\"\r\n\"quant03\",\"categorie_vii\",\"6.6\"\r\n\"quant03\",\"categorie_viii\",\"7.7\"\r\n\"quant05\",\"categorie_i\",\"2.8\"\r\n\"quant05\",\"categorie_ii\",\"3.1\"\r\n\"quant05\",\"categorie_iii\",\"3.4\"\r\n\"quant05\",\"categorie_iv\",\"4\"\r\n\"quant05\",\"categorie_v\",\"4.3\"\r\n\"quant05\",\"categorie_vi\",\"4.5\"\r\n\"quant05\",\"categorie_vii\",\"5.3\"\r\n\"quant05\",\"categorie_viii\",\"6.1\"\r\n\"quant06\",\"categorie_i\",\"1.4\"\r\n\"quant06\",\"categorie_ii\",\"1.6\"\r\n\"quant06\",\"categorie_iii\",\"1.7\"\r\n\"quant06\",\"categorie_iv\",\"2\"\r\n\"quant06\",\"categorie_v\",\"2.1\"\r\n\"quant06\",\"categorie_vi\",\"2.3\"\r\n\"quant06\",\"categorie_vii\",\"2.7\"\r\n\"quant06\",\"categorie_viii\",\"3.1\"\r\n\"quant11\",\"categorie_i\",\"1.7\"\r\n\"quant11\",\"categorie_ii\",\"1.9\"\r\n\"quant11\",\"categorie_iii\",\"2\"\r\n\"quant11\",\"categorie_iv\",\"2.4\"\r\n\"quant11\",\"categorie_v\",\"2.6\"\r\n\"quant11\",\"categorie_vi\",\"2.7\"\r\n\"quant11\",\"categorie_vii\",\"3.2\"\r\n\"quant11\",\"categorie_viii\",\"3.7\"\r\n\"quant08\",\"categorie_i\",\"0.7\"\r\n\"quant08\",\"categorie_ii\",\"0.8\"\r\n\"quant08\",\"categorie_iii\",\"0.9\"\r\n\"quant08\",\"categorie_iv\",\"1\"\r\n\"quant08\",\"categorie_v\",\"1.1\"\r\n\"quant08\",\"categorie_vi\",\"1.1\"\r\n\"quant08\",\"categorie_vii\",\"1.3\"\r\n\"quant08\",\"categorie_viii\",\"1.5\"\r\n\"quant09\",\"categorie_i\",\"2.1\"\r\n\"quant09\",\"categorie_ii\",\"2.3\"\r\n\"quant09\",\"categorie_iii\",\"2.6\"\r\n\"quant09\",\"categorie_iv\",\"3\"\r\n\"quant09\",\"categorie_v\",\"3.2\"\r\n\"quant09\",\"categorie_vi\",\"3.4\"\r\n\"quant09\",\"categorie_vii\",\"4\"\r\n\"quant09\",\"categorie_viii\",\"4.6\"\r\n\"quant10\",\"categorie_i\",\"7.1\"\r\n\"quant10\",\"categorie_ii\",\"7.8\"\r\n\"quant10\",\"categorie_iii\",\"8.5\"\r\n\"quant10\",\"categorie_iv\",\"9.9\"\r\n\"quant10\",\"categorie_v\",\"10.7\"\r\n\"quant10\",\"categorie_vi\",\"11.4\"\r\n\"quant10\",\"categorie_vii\",\"13.3\"\r\n\"quant10\",\"categorie_viii\",\"15.3\"\r\n\"quant18\",\"categorie_i\",\"1.4\"\r\n\"quant18\",\"categorie_ii\",\"1.6\"\r\n\"quant18\",\"categorie_iii\",\"1.7\"\r\n\"quant18\",\"categorie_iv\",\"2\"\r\n\"quant18\",\"categorie_v\",\"2.1\"\r\n\"quant18\",\"categorie_vi\",\"2.3\"\r\n\"quant18\",\"categorie_vii\",\"2.7\"\r\n\"quant18\",\"categorie_viii\",\"3.1\"\r\n\"quant19\",\"categorie_i\",\"7.1\"\r\n\"quant19\",\"categorie_ii\",\"7.8\"\r\n\"quant19\",\"categorie_iii\",\"8.5\"\r\n\"quant19\",\"categorie_iv\",\"9.9\"\r\n\"quant19\",\"categorie_v\",\"10.7\"\r\n\"quant19\",\"categorie_vi\",\"11.4\"\r\n\"quant19\",\"categorie_vii\",\"13.3\"\r\n\"quant19\",\"categorie_viii\",\"15.3\"\r\n\"quant14\",\"categorie_i\",\"3.6\"\r\n\"quant14\",\"categorie_ii\",\"3.9\"\r\n\"quant14\",\"categorie_iii\",\"4.3\"\r\n\"quant14\",\"categorie_iv\",\"5\"\r\n\"quant14\",\"categorie_v\",\"5.3\"\r\n\"quant14\",\"categorie_vi\",\"5.7\"\r\n\"quant14\",\"categorie_vii\",\"6.6\"\r\n\"quant14\",\"categorie_viii\",\"7.7\"\r\n\"quant13\",\"categorie_i\",\"0.9\"\r\n\"quant13\",\"categorie_ii\",\"1\"\r\n\"quant13\",\"categorie_iii\",\"1.1\"\r\n\"quant13\",\"categorie_iv\",\"1.3\"\r\n\"quant13\",\"categorie_v\",\"1.4\"\r\n\"quant13\",\"categorie_vi\",\"1.5\"\r\n\"quant13\",\"categorie_vii\",\"1.7\"\r\n\"quant13\",\"categorie_viii\",\"2\"\r\n\"quant15\",\"categorie_i\",\"1.3\"\r\n\"quant15\",\"categorie_ii\",\"1.5\"\r\n\"quant15\",\"categorie_iii\",\"1.6\"\r\n\"quant15\",\"categorie_iv\",\"1.9\"\r\n\"quant15\",\"categorie_v\",\"2\"\r\n\"quant15\",\"categorie_vi\",\"2.2\"\r\n\"quant15\",\"categorie_vii\",\"2.5\"\r\n\"quant15\",\"categorie_viii\",\"2.9\"\r\n\"quant16\",\"categorie_i\",\"1.1\"\r\n\"quant16\",\"categorie_ii\",\"1.2\"\r\n\"quant16\",\"categorie_iii\",\"1.3\"\r\n\"quant16\",\"categorie_iv\",\"1.5\"\r\n\"quant16\",\"categorie_v\",\"1.6\"\r\n\"quant16\",\"categorie_vi\",\"1.7\"\r\n\"quant16\",\"categorie_vii\",\"2\"\r\n\"quant16\",\"categorie_viii\",\"2.3\""
                },
                {
                    "comment": "prices for 2020Q2-Q4",
                    "start_period": "202004",
                    "end_period": "202012",
                    "in_headers": [
                        "activity_code",
                        "groupset_code_equite_fbr"
                    ],
                    "out_headers": [
                        "bareme_unitaire","name"
                    ],
                    "content": "\"in:activity_code\",\"in:groupset_code_equite_fbr\",\"out:bareme_unitaire\",\"out:name\"\n*,*,\"666\",\"diabolic\""
                }                
            ],
            "formulas": {
                "total_subsides_mensuel_pma_nk": {
                    "short_name": "total_subsides_mensuel_pma_nk",
                    "description": "total_subsides_mensuel_pma_nk",
                    "expression": "ROUND( sum(%{subsides_values}) , 2)",
                    "frequency": "monthly",
                    "exportable_formula_code": null,
                    "de_id": "DHKPgzpsF3l"
                }
            }
        },
        "qualite_pma": {
            "name": "Qualité PMA",
            "description": "Qualité PMA",
            "code": "qualite_pma_nord_kivu",
            "frequency": "quarterly",
            "kind": "single",
            "activities": [
                {
                    "name": "Organisation générale",
                    "code": "qual01",
                    "points_maximum": "anuQ6PgbsSC",
                    "subsides_trimestriels": "YKxAk3jBGBc",
                    "points_attribues": "ZKulYvPouv3"
                },
                {
                    "name": "Plan de management",
                    "code": "qual02",
                    "points_maximum": "wNlEyK6jmsG",
                    "points_attribues": "dNaHITGL2OR"
                },

            ],
            "data_set_ids": [],
            "data_element_group_ids": [],
            "main_org_unit_group_ids": [
                "l8rvojVTile",
                "QJPLrdlbloZ"
            ],
            "target_org_unit_group_ids": [],
            "groupset_ext_id": null,
            "matching_groupset_ids": [
                "H4XnqvSQYbh",
                "XLCi1Al1WE9"
            ],
            "deg_ext_id": "OgcT9dnEFJ1",
            "activity_formulas": {
                "total_subsides_trimestre_passe_pma": {
                    "short_name": "total_subsides_trimestre_passe_pma",
                    "description": "Total Subsides Trimestre Passe PMA PDSS/PVSBG",
                    "expression": "SUM(%{subsides_trimestriels_last_1_quarters_exclusive_window_values})",
                    "frequency": "quarterly",
                    "exportable_formula_code": null
                },
                "points_disponibles": {
                    "short_name": "Points Disponibles",
                    "description": "Points Disponibles",
                    "expression": "points_maximum",
                    "frequency": "quarterly",
                    "exportable_formula_code": null
                },
                "points_qualite_attribues": {
                    "short_name": "Les points attribués",
                    "description": "Les points attribués",
                    "expression": "points_attribues",
                    "frequency": "quarterly",
                    "exportable_formula_code": null
                },
                "score_pma_pdss": {
                    "short_name": "score_pma_pdss",
                    "description": "Pourcentage Score PMA PDSS/PVSBG",
                    "expression": "SAFE_DIV(points_qualite_attribues,points_disponibles)*100",
                    "frequency": "quarterly",
                    "exportable_formula_code": "can_compute_score"
                },
                "can_compute_score" : {
                    "expression":"IF( points_maximum_is_null == 0 || points_attribues_is_null == 0, 1, 0)",     
                    "frequency": "quarterly",               
                }             
            },
            "activity_decision_tables": [],
            "formulas": {
                "total_subsides_trimestre_passe_pma_nk": {
                    "short_name": "total_subsides_trimestre_passe_pma_nk",
                    "description": "Total Subsides Trimestre Passe PMA PDSS/PVSBG",
                    "expression": "MAX(%{total_subsides_trimestre_passe_pma_values})",
                    "frequency": "quarterly",
                    "exportable_formula_code": null,
                    "de_id": null
                },
                "total_max_qualite_pma_nk": {
                    "short_name": "total_max_qualite_pma_nk",
                    "description": "total_max_qualite_pma_nk",
                    "expression": "SUM(%{points_disponibles_values})",
                    "frequency": "quarterly",
                    "exportable_formula_code": null,
                    "de_id": null
                },
                "total_obtenus_qualite_pma_nk": {
                    "short_name": "total_obtenus_qualite_pma_nk",
                    "description": "total_obtenus_qualite_pma_nk",
                    "expression": "SUM(%{points_qualite_attribues_values})",
                    "frequency": "quarterly",
                    "exportable_formula_code": null,
                    "de_id": null
                },
                "score_qualite_pma_nk": {
                    "short_name": "score_qualite_pma_nk",
                    "description": "score_qualite_pma_nk",
                    "expression": "ROUND(SAFE_DIV(total_obtenus_qualite_pma_nk,total_max_qualite_pma_nk)*100, 2)",
                    "frequency": "quarterly",
                    "exportable_formula_code": null,
                    "de_id": "g05S9dbwW3Z"
                }
            }

        }
    }

    const orgUnit = {
        id: "zaerz654",
        name: "Orgunit name",
        activeContracts: [{
            startPeriod: "2019Q1",
            endPerio: "2020Q2",
            fieldValues: {
                equite_fbr: "categorie_iii"
            }
        }]
    }

    const defaultCoc = "defaultcocid"
    const newDataValue = (period, de, value) => {
        return { orgUnit: orgUnit.id, period: period, dataElement: de, value: value, categoryOptionCombo: defaultCoc }
    }

    it("it's calculating quantity: decision table, activity and package formulas + ROUND SUM %{_values}", () => {
        const quantityPackage = packages.quantite_pma
        const period = "202001"
        const rawValues = [
            newDataValue(period, quantityPackage.activities[0].validee, "4"),
            newDataValue(period, quantityPackage.activities[1].validee, "8"),
            newDataValue(period, quantityPackage.activities[2].validee, "10"),
        ]

        const calculator = generateCalculator(
            quantityPackage,
            orgUnit.id,
            period,
            Object.keys(quantityPackage.activity_formulas),
            Object.keys(quantityPackage.formulas),
            orgUnit)

        const indexedValues = _.groupBy(rawValues, (v) =>
            [v.orgUnit, v.period, v.dataElement, v.categoryOptionCombo].join("-"),
        );

        calculator.setIndexedValues(indexedValues)
        calculator.setDefaultCoc(defaultCoc)
        expect(calculator.quantite_pma_quant03_bareme_unitaire_zaerz654_202001()).toEqual(4.3)

        expect(calculator.quantite_pma_total_subsides_mensuel_pma_nk_zaerz654_202001()).toEqual(69)
    });



    it("it's calculating quantity: decision table, activity and package formulas + ROUND SUM %{_values}", () => {
        const quantityPackage = packages.quantite_pma
        const period = "202004"
        const rawValues = [
        ]

        const calculator = generateCalculator(
            quantityPackage,
            orgUnit.id,
            period,
            Object.keys(quantityPackage.activity_formulas),
            Object.keys(quantityPackage.formulas),
            orgUnit)

        const indexedValues = _.groupBy(rawValues, (v) =>
            [v.orgUnit, v.period, v.dataElement, v.categoryOptionCombo].join("-"),
        );
        
        calculator.setIndexedValues(indexedValues)
        calculator.setDefaultCoc(defaultCoc)
        expect(calculator.quantite_pma_quant03_bareme_unitaire_zaerz654_202004()).toEqual(666)
        expect(calculator.quantite_pma_quant03_name_zaerz654_202004()).toEqual("diabolic")

    });


    it("it's calculating quality: ROUND SAFE_DIV SUM %{_values} is_null", () => {
        const period = "2020Q1"
        const qualityPackage = packages.qualite_pma
        const excludedFormulas = ["total_subsides_trimestre_passe_pma","total_subsides_trimestre_passe_pma_nk" ]
        const rawValues = [
            newDataValue(period, qualityPackage.activities[0].points_attribues, "4"),
            newDataValue(period, qualityPackage.activities[0].points_maximum, "5"),            
            newDataValue(period, qualityPackage.activities[1].points_attribues, "7"),
            newDataValue(period, qualityPackage.activities[1].points_maximum, "8"),
        ]

        const calculator = generateCalculator(
            qualityPackage,
            orgUnit.id,
            period,
            Object.keys(qualityPackage.activity_formulas).filter(f => !excludedFormulas.includes(f)),
            Object.keys(qualityPackage.formulas).filter(f => !excludedFormulas.includes(f)),
            orgUnit)

        const indexedValues = _.groupBy(rawValues, (v) =>
            [v.orgUnit, v.period, v.dataElement, v.categoryOptionCombo].join("-"),
        );

        calculator.setIndexedValues(indexedValues)
        calculator.setDefaultCoc(defaultCoc)
        expect(calculator.qualite_pma_nord_kivu_qual01_can_compute_score_zaerz654_2020Q1()).toEqual(1)
        expect(calculator.qualite_pma_nord_kivu_qual02_can_compute_score_zaerz654_2020Q1()).toEqual(1)

        expect(calculator.qualite_pma_nord_kivu_qual01_score_pma_pdss_zaerz654_2020Q1()).toEqual(80)
        expect(calculator.qualite_pma_nord_kivu_qual02_score_pma_pdss_zaerz654_2020Q1()).toEqual(87.5)
        expect(calculator.qualite_pma_nord_kivu_score_qualite_pma_nk_zaerz654_2020Q1()).toEqual(84.62)
    });


    it("it's calculating quality: ROUND SAFE_DIV SUM %{_values} is_null", () => {
        const period = "2020Q1"
        const qualityPackage = packages.qualite_pma
        const excludedFormulas = ["total_subsides_trimestre_passe_pma","total_subsides_trimestre_passe_pma_nk" ]
        const rawValues = [
            newDataValue(period, qualityPackage.activities[1].points_attribues, "7"),
            newDataValue(period, qualityPackage.activities[1].points_maximum, "8"),
        ]

        const calculator = generateCalculator(
            qualityPackage,
            orgUnit.id,
            period,
            Object.keys(qualityPackage.activity_formulas).filter(f => !excludedFormulas.includes(f)),
            Object.keys(qualityPackage.formulas).filter(f => !excludedFormulas.includes(f)),
            orgUnit)

        const indexedValues = _.groupBy(rawValues, (v) =>
            [v.orgUnit, v.period, v.dataElement, v.categoryOptionCombo].join("-"),
        );

        calculator.setIndexedValues(indexedValues)
        calculator.setDefaultCoc(defaultCoc)
        expect(calculator.qualite_pma_nord_kivu_qual01_can_compute_score_zaerz654_2020Q1()).toEqual(0)
        expect(calculator.qualite_pma_nord_kivu_qual02_can_compute_score_zaerz654_2020Q1()).toEqual(1)

        expect(calculator.qualite_pma_nord_kivu_score_qualite_pma_nk_zaerz654_2020Q1()).toEqual(87.5)

        expect(calculator.qualite_pma_nord_kivu_qual02_score_pma_pdss_zaerz654_2020Q1()).toEqual(87.5)
    });

    it("detect unsupported feature in activity formulas", () => {
        const period = "2020Q1"
        const qualityPackage = packages.qualite_pma
        const excludedFormulas= []
        expect( () => {
        const calculator = generateCalculator(
            qualityPackage,
            orgUnit.id,
            period,
            Object.keys(qualityPackage.activity_formulas).filter(f => !excludedFormulas.includes(f)),
            Object.keys(qualityPackage.formulas).filter(f => !excludedFormulas.includes(f)),
            orgUnit)

        }).toThrow ("Unsupported feature for total_subsides_trimestre_passe_pma : SUM(%{subsides_trimestriels_last_1_quarters_exclusive_window_values}), probably need to ignore the formula")
    })

    it("it's calculating quantity on a quaterly period: decision table, activity and package formulas + ROUND SUM %{_values}", () => {
        const quantityPackage = packages.quantite_pma
        const period = "2020Q1"
        const rawValues = [
            newDataValue("202001", quantityPackage.activities[0].validee, "4"),
            newDataValue("202001", quantityPackage.activities[1].validee, "8"),
            newDataValue("202001", quantityPackage.activities[2].validee, "10"),
            newDataValue("202002", quantityPackage.activities[0].validee, "1"),
            newDataValue("202003", quantityPackage.activities[1].validee, "2"),
            newDataValue("202002", quantityPackage.activities[2].validee, "3"),
        ]

        const calculator = generateCalculator(
            quantityPackage,
            orgUnit.id,
            period,
            Object.keys(quantityPackage.activity_formulas),
            Object.keys(quantityPackage.formulas),
            orgUnit)

        const indexedValues = _.groupBy(rawValues, (v) =>
            [v.orgUnit, v.period, v.dataElement, v.categoryOptionCombo].join("-"),
        );

        calculator.setIndexedValues(indexedValues)
        calculator.setDefaultCoc(defaultCoc)

        expect(calculator.quantite_pma_quant03_subsides_zaerz654_202001()).toEqual(43)
        expect(calculator.quantite_pma_quant03_subsides_zaerz654_202002()).toEqual(12.9)
        expect(calculator.quantite_pma_quant03_subsides_zaerz654_202003()).toEqual(0)

        const expectedTotal = 43 + 12.9 + 0
        expect(calculator.quantite_pma_quant03_quarterly_subsides_zaerz654_202001()).toEqual(expectedTotal)
        expect(calculator.quantite_pma_quant03_quarterly_subsides_zaerz654_202002()).toEqual(expectedTotal)
        expect(calculator.quantite_pma_quant03_quarterly_subsides_zaerz654_202003()).toEqual(expectedTotal)

    });
})