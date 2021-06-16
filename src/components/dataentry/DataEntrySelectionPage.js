import React, { useEffect, useState } from "react";
import DatePeriods from "../../support/DatePeriods";
import PluginRegistry from "../core/PluginRegistry";
import _ from "lodash";
import { Link } from "react-router-dom";
import { Button, Paper, Typography, Chip, Grid, IconButton } from "@material-ui/core";
import AssignmentIcon from "@material-ui/icons/Assignment";
import InfoIcon from "@material-ui/icons/Info";
import { Alert } from "@material-ui/lab";

import FormDataContext from "./FormDataContext";
import InvoiceLinks from "../invoices/InvoiceLinks";
import { useTranslation } from "react-i18next";
import { withRouter } from "react-router";
import PeriodPicker from "../shared/PeriodPicker";
import PortalHeader from "../shared/PortalHeader";

function isDataSetComplete(completeDataSetRegistration) {
  if (completeDataSetRegistration == undefined) {
    return false;
  }
  if ("completed" in completeDataSetRegistration) {
    return completeDataSetRegistration.completed;
  }
  return true;
}

const DataEntrySelectionPage = ({ history, match, periodFormat, dhis2 }) => {
  const { t, i18n } = useTranslation();
  const dataEntryRegistry = PluginRegistry.extension("dataentry.dataEntries");
  const [orgUnit, setOrgUnit] = useState(undefined);
  const [dataEntries, setDataEntries] = useState(undefined);
  const [subContractsDataEntries, setSubContractsDataEntries] = useState(undefined);
  const [mainContractDataEntries, setMainContractDataEntries] = useState(undefined);
  const [formData, setFormData] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [generalError, setGeneralError] = useState(undefined);

  const period = match.params.period;
  useEffect(() => {
    const loadData = async () => {
      try {
        const contractService = PluginRegistry.extension("contracts.service");

        const contracts = await contractService.fetchContracts(match.params.orgUnitId);
        const activeContracts = contracts.allContracts.filter(
          (c) => c.orgUnit.id == match.params.orgUnitId && c.matchPeriod(period),
        );
        const activeContract = activeContracts[0];

        if (activeContract == undefined) {
          setError({
            message: match.params.orgUnitId + " has no contract for that period : " + period,
            link: "/contracts/" + match.params.orgUnitId,
          });
          return undefined;
        }

        if (activeContracts.length > 1) {
          setError({
            message: match.params.orgUnitId + " has multiple contracts for that period : " + period,
            link: "/contracts/" + match.params.orgUnitId,
          });
          return undefined;
        }

        activeContract.orgUnit.activeContracts = [activeContract];

        setOrgUnit(activeContract.orgUnit);
        const expectedDataEntries = dataEntryRegistry.getExpectedDataEntries(activeContract, period);
        setDataEntries(expectedDataEntries);

        const activeSubContracts = contracts.subContracts.contracts.filter(
          (c) => c.fieldValues.contract_main_orgunit == match.params.orgUnitId && c.matchPeriod(period),
        );
        let expectedSubContractDataEntries = [];
        for (let activeSubContract of activeSubContracts) {
          activeSubContract.orgUnit.activeContracts = [activeSubContract];
          const expectedSubContractDataEntry = dataEntryRegistry.getExpectedDataEntries(activeSubContract, period);
          expectedSubContractDataEntries.push({
            orgUnit: {
              id: activeSubContract.orgUnit.id,
              name: activeSubContract.orgUnit.name,
            },
            dataEntry: expectedSubContractDataEntry,
          });
        }
        setSubContractsDataEntries(expectedSubContractDataEntries);

        const mainContract = await contractService.fetchContracts(activeContract.fieldValues.contract_main_orgunit);
        const activeMainContracts =
          (mainContract.allContracts &&
            mainContract.allContracts.filter(
              (c) => c.orgUnit.id == activeContract.fieldValues.contract_main_orgunit && c.matchPeriod(period),
            )) ||
          [];
        let activeMainContract = activeMainContracts[0] || [];
        activeMainContract.orgUnit = { activeContracts: activeMainContract.length > 0 ? [activeMainContract] : [] };
        const expectedMainContractDataEntries = dataEntryRegistry.getExpectedDataEntries(activeMainContract, period);
        const expectedMainContractDataEntry =
          expectedMainContractDataEntries.length > 0
            ? {
                orgUnit: {
                  id: activeMainContract.fieldValues.orgUnit.id,
                  name: activeMainContract.fieldValues.orgUnit.name,
                },
                dataEntry: expectedMainContractDataEntries,
              }
            : null;
        setMainContractDataEntries(expectedMainContractDataEntry);

        if (match.params.dataEntryCode == undefined && expectedDataEntries.length > 0) {
          const defaultDataEntry = expectedDataEntries[0];
          history.push(
            "/dataEntry/" +
              activeContract.orgUnit.id +
              "/" +
              defaultDataEntry.period +
              "/" +
              defaultDataEntry.dataEntryType.code,
          );
        }

        const api = await dhis2.api();
        if (match.params.dataEntryCode) {
          const dataEntry = dataEntryRegistry.getDataEntry(match.params.dataEntryCode);
          const dataSet = dataEntry.dataSetId
            ? await api.get("/dataSets/" + dataEntry.dataSetId, {
                fields:
                  "id,name,periodType,access,dataSetElements[dataElement[id,name,valueType,optionSet[options[code,name]],categoryCombo[id,name,categoryOptionCombos[id,name]]]]",
              })
            : { dataSetElements: [] };

          const dataElementsById = _.keyBy(
            dataSet.dataSetElements.map((dse) => dse.dataElement),
            (de) => de.id,
          );

          let completeDataSetRegistration;
          const dsc = dataEntry.dataSetId
            ? await api.get("completeDataSetRegistrations", {
                dataSet: dataEntry.dataSetId,
                period: period,
                orgUnit: activeContract.orgUnit.id,
              })
            : { completeDataSetRegistrations: [] };

          completeDataSetRegistration = dsc.completeDataSetRegistrations
            ? dsc.completeDataSetRegistrations[0]
            : undefined;
          const dv = dataEntry.dataSetId
            ? await api.get("/dataValueSets", {
                dataSet: dataEntry.dataSetId,
                orgUnit: activeContract.orgUnit.id,
                period: period,
              })
            : { dataValues: [] };
          let rawValues = dv.dataValues || [];
          if (dataEntryRegistry.fetchExtraData) {
            const extraValues = await dataEntryRegistry.fetchExtraData(api, activeContract.orgUnit, period, dataEntry);
            rawValues = rawValues.concat(extraValues);

            const extraDataElements = await dataEntryRegistry.fetchExtraMetaData(
              api,
              activeContract.orgUnit,
              period,
              dataEntry,
            );

            for (let extraDe of extraDataElements) {
              dataElementsById[extraDe.id] = extraDe;
            }
          }
          const defaultCoc = (
            await api.get("categoryOptionCombos", {
              filter: "name:eq:default",
            })
          ).categoryOptionCombos[0].id;

          const indexedValues = _.groupBy(rawValues, (v) =>
            [v.orgUnit, v.period, v.dataElement, v.categoryOptionCombo].join("-"),
          );

          let calculator;
          if (dataEntryRegistry.getCalculator) {
            calculator = dataEntryRegistry.getCalculator(activeContract.orgUnit, period, match.params.dataEntryCode);
            if (calculator) {
              calculator.setIndexedValues(indexedValues);
              calculator.setDefaultCoc(defaultCoc);
            }
          }

          const newFormData = {
            period,
            values: rawValues,
            indexedValues: indexedValues,
            orgUnit: activeContract.orgUnit,
            dataSetComplete: isDataSetComplete(completeDataSetRegistration),
            completeDataSetRegistration: completeDataSetRegistration,
            dataSet: dataSet,
            dataElementsById: dataElementsById,
            calculator: calculator,
            valids: {},
            errors: {},
            updating: {},

            isDataSetComplete() {
              return this.dataSetComplete;
            },
            isDataWritable() {
              return this.dataSet && this.dataSet.access && this.dataSet.access.data.write;
            },
            error(de) {
              return this.errors[this.getKey(de)];
            },
            getKey(de) {
              const deCoc = de.split(".");
              return [activeContract.orgUnit.id, period, deCoc[0], deCoc[1] || defaultCoc].join("-");
            },
            getError(de) {
              const key = this.getKey(de);
              return this.errors[key];
            },
            isModified(de) {
              const key = this.getKey(de);
              return this.valids[key] == true;
            },
            isUpdating(de) {
              const key = this.getKey(de);
              return this.updating[key] == true;
            },
            isInvalid(de) {
              const key = this.getKey(de);
              return this.valids[key] == false;
            },
            getValue(de) {
              const key = this.getKey(de);
              const ourValues = this.indexedValues[key];
              return ourValues ? ourValues[0] : undefined;
            },
            getCalculatedValue(hesabuPackage, formulaCode, period, orgUnit, activity) {
              let orgUnitId = orgUnit ? orgUnit.id : activeContract.orgUnit.id;
              const calculatorFunction = activity
                ? `${hesabuPackage.code}_${activity.code}_${formulaCode}_${orgUnitId}_${period}`
                : `${hesabuPackage.code}_${formulaCode}_${orgUnitId}_${period}`;
              if (this.calculator && this.calculator[calculatorFunction]) {
                return this.calculator[calculatorFunction]();
              }
            },
            async updateValue(de, value) {
              const deCoc = de.split(".");
              const key = this.getKey(de);
              if (this.updating[key]) {
                return;
              } else {
                this.updating[key] = true;
              }
              const newValue = {
                de: deCoc[0],
                co: deCoc[1] || defaultCoc,
                ds: dataSet.id,
                ou: activeContract.orgUnit.id,
                pe: period,
                value: value,
              };
              try {
                await dhis2.setDataValue(newValue);
                let newIndexedValues = this.indexedValues;
                if (this.indexedValues[key]) {
                  newIndexedValues[key] = [{ ...this.indexedValues[key][0], value: value }];
                } else {
                  newIndexedValues[key] = [{ dataElement: newValue.de, value: value }];
                }
                if (calculator) {
                  calculator.setIndexedValues(newIndexedValues);
                }
                this.valids[key] = true;
                this.errors[key] = undefined;
                this.updating[key] = false;

                setFormData({ ...this });
              } catch (error) {
                this.valids[key] = false;
                this.errors[key] = error.message;
                this.updating[key] = false;

                setFormData({ ...this });
              }
            },
            async toggleComplete(calculations) {
              if (completeDataSetRegistration && "completed" in completeDataSetRegistration) {
                // newer dhis2 version just toggle "completed" or create one
                await api.post("completeDataSetRegistrations", {
                  completeDataSetRegistrations: [
                    {
                      dataSet: this.dataSet.id,
                      period: this.period,
                      organisationUnit: activeContract.orgUnit.id,
                      completed: !this.dataSetComplete,
                    },
                  ],
                });
              } else if (completeDataSetRegistration && this.dataSetComplete) {
                // older dhis2 delete the existing completion record
                await api.delete(
                  "completeDataSetRegistrations?ds=" +
                    this.dataSet.id +
                    "&pe=" +
                    this.period +
                    "&ou=" +
                    activeContract.orgUnit.id +
                    "&multiOu=false",
                );
              } else {
                // older dis2 delete the existing completion record

                await api.post("completeDataSetRegistrations", {
                  completeDataSetRegistrations: [
                    {
                      dataSet: this.dataSet.id,
                      period: this.period,
                      organisationUnit: activeContract.orgUnit.id,
                      completed: !this.dataSetComplete,
                    },
                  ],
                });
              }

              if (calculations && !this.dataSetComplete) {
                const orbf2 = PluginRegistry.extension("invoices.hesabu");
                calculations.forEach((calculation) => orbf2.calculate(calculation));
              }

              const updatedFormaData = {
                ...this,
                dataSetComplete: !this.dataSetComplete,
              };

              setFormData(updatedFormaData);
            },
          };

          setFormData(newFormData);
        }
      } catch (error) {
        setGeneralError(error);
      }
    };
    loadData();
  }, []);
  let DataEntryForm = React.Fragment;
  let dataEntryType;

  if (
    dataEntryRegistry &&
    match.params.dataEntryCode &&
    dataEntries &&
    dataEntries.some((dataEntry) => dataEntry.dataEntryType.code === match.params.dataEntryCode)
  ) {
    DataEntryForm = dataEntryRegistry.getDataEntryForm(match.params.dataEntryCode);
    dataEntryType = dataEntryRegistry.getDataEntry(match.params.dataEntryCode);
  }

  let quarterPeriod = "";
  if (period) {
    quarterPeriod = DatePeriods.split(period, "quarterly")[0];
  }

  return (
    <Paper style={{ minHeight: "90vh", paddingLeft: "50px", paddingTop: "20px" }}>
      {generalError && <div style={{ color: "red" }}>{generalError.message}</div>}
      {error && (
        <div>
          <Link to={error.link}>{error.message}</Link>
        </div>
      )}
      <h1>
        <AssignmentIcon /> {orgUnit && orgUnit.name}
      </h1>

      <div style={{ fontFamily: "monospace" }}>
        {orgUnit &&
          orgUnit.ancestors.slice(1, orgUnit.ancestors.length - 1).map((ancestor, index) => {
            return (
              <span key={"ancestor" + index}>
                <Link to={"/select/?q=&period=" + quarterPeriod + "&parent=" + ancestor.id}>{ancestor.name}</Link>
                {index < orgUnit.ancestors.length - 3 && "  >  "}
              </span>
            );
          })}
      </div>

      {orgUnit && orgUnit.activeContracts && (
        <div>
          {t("dataEntry.contractFrom")} <code>{orgUnit.activeContracts[0].startPeriod}</code>{" "}
          {t("dataEntry.contractTo")} <code>{orgUnit.activeContracts[0].endPeriod}</code>{" "}
          <Link to={"/contracts/" + orgUnit.id}>
            <IconButton>
              <InfoIcon color="action" />
            </IconButton>
          </Link>{" "}
          {orgUnit.activeContracts[0].codes.map((c, index) => (
            <Chip key={c + "_" + index} label={c} style={{ margin: "5px" }} />
          ))}
        </div>
      )}

      <PortalHeader>
        <div style={{ display: "flex", flexDirection: "row", alignContent: "center", justifyContent: "flex-start" }}>
          <Typography variant="h6" style={{ marginRight: "20px" }}>
            {t("dataEntry.dataEntries")}
          </Typography>
          <div style={{ background: "rgba(255, 255, 255, 0.20)", color: "#fff; important!", padding: "5px" }}>
            <PeriodPicker
              variant="white"
              disableInputLabel={true}
              period={quarterPeriod}
              periodDelta={{
                before: 5,
                after: 5,
              }}
              onPeriodChange={(newPeriod) => {
                history.push("/dataEntry/" + match.params.orgUnitId + "/" + newPeriod);
              }}
            />
          </div>
        </div>
      </PortalHeader>

      <Grid container>
        <Grid item xs={3}>
          <h2>{t("dataEntry.dataEntries")}</h2>
          <table>
            <tbody>
              {dataEntries &&
                dataEntries.map((dataEntry) => {
                  const isCurrent =
                    dataEntry.dataEntryType.code == match.params.dataEntryCode &&
                    dataEntry.period == match.params.period;
                  return (
                    <tr>
                      <td>
                        {" "}
                        <Typography variant="overline" gutterBottom>
                          {dataEntry.dataEntryType.name}
                        </Typography>
                      </td>
                      <td>
                        <Button
                          key={dataEntry.dataEntryType.code + "-" + dataEntry.period + "-" + orgUnit.id}
                          variant="text"
                          color="primary"
                          size="small"
                          component={Link}
                          style={isCurrent ? { backgroundColor: "lightyellow" } : {}}
                          to={"/dataEntry/" + orgUnit.id + "/" + dataEntry.period + "/" + dataEntry.dataEntryType.code}
                          title={dataEntry.period}
                        >
                          {DatePeriods.displayName(
                            dataEntry.period,
                            periodFormat[DatePeriods.detect(dataEntry.period)],
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Grid>
        <Grid item>
          <h2>{t("dataEntry.invoices")}</h2>
          {orgUnit && (
            <InvoiceLinks
              t={t}
              orgUnit={orgUnit}
              period={period}
              invoices={PluginRegistry.extension("invoices.invoices")}
            />
          )}
        </Grid>
        {mainContractDataEntries && mainContractDataEntries.orgUnit && (
          <Grid item>
            <h2>{t("dataEntry.mainContractDataEntries")}</h2>
            <table>
              <thead>
                <tr>
                  <td>
                    <Typography>{mainContractDataEntries.orgUnit.name}</Typography>
                  </td>
                </tr>
              </thead>
              <tbody>
                {mainContractDataEntries.dataEntry.map((mainContract) => {
                  return (
                    <tr>
                      <td>
                        {" "}
                        <Typography variant="overline" gutterBottom>
                          {mainContract.dataEntryType.name}
                        </Typography>
                      </td>
                      <td>
                        <Button
                          key={
                            mainContract.dataEntryType.code +
                            "-" +
                            mainContract.period +
                            "-" +
                            mainContractDataEntries.orgUnit.id
                          }
                          variant="text"
                          color="primary"
                          size="small"
                          component={Link}
                          to={
                            "/dataEntry/" +
                            mainContractDataEntries.orgUnit.id +
                            "/" +
                            mainContract.period +
                            "/" +
                            mainContract.dataEntryType.code
                          }
                          title={mainContract.period}
                        >
                          {DatePeriods.displayName(
                            mainContract.period,
                            periodFormat[DatePeriods.detect(mainContract.period)],
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Grid>
        )}
        {subContractsDataEntries && subContractsDataEntries.length > 0 && (
          <Grid item>
            <h2>{t("dataEntry.subContractDataEntries")}</h2>
            {subContractsDataEntries.map((subContract) => {
              return (
                <table>
                  <thead>
                    <tr>
                      <td>
                        <Typography>{subContract.orgUnit.name}</Typography>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {subContract &&
                      subContract.dataEntry.map((dataEntry) => {
                        const orgUnitId = subContract.orgUnit.id;
                        return (
                          <tr>
                            <td>
                              {" "}
                              <Typography variant="overline" gutterBottom>
                                {dataEntry.dataEntryType.name}
                              </Typography>
                            </td>
                            <td>
                              <Button
                                key={dataEntry.dataEntryType.code + "-" + dataEntry.period + "-" + orgUnitId}
                                variant="text"
                                color="primary"
                                size="small"
                                component={Link}
                                to={
                                  "/dataEntry/" +
                                  subContract.orgUnit.id +
                                  "/" +
                                  dataEntry.period +
                                  "/" +
                                  dataEntry.dataEntryType.code
                                }
                                title={dataEntry.period}
                              >
                                {DatePeriods.displayName(
                                  dataEntry.period,
                                  periodFormat[DatePeriods.detect(dataEntry.period)],
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              );
            })}
          </Grid>
        )}
      </Grid>
      <div>
        {formData && (
          <FormDataContext.Provider value={formData}>
            {formData.dataSet.id && !formData.isDataWritable() && (
              <Alert severity="info" style={{ maxWidth: "1024px" }}>
                {t("dataEntry.dataSetNotWritable", { interpolation: true, dataSetName: formData.dataSet.name })}
              </Alert>
            )}
            <DataEntryForm
              period={period}
              dataEntryCode={match.params.dataEntryCode}
              formData={formData}
              dataEntryType={dataEntryType}
            />
            <br />
          </FormDataContext.Provider>
        )}
      </div>
    </Paper>
  );
};

export default withRouter(DataEntrySelectionPage);
