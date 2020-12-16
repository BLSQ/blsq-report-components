import React, { useEffect, useState } from "react";
import DatePeriods from "../../support/DatePeriods";
import PluginRegistry from "../core/PluginRegistry";
import _ from "lodash";
import { Link } from "react-router-dom";
import { Button, Paper, Typography, Chip, Grid } from "@material-ui/core";
import AssignmentIcon from "@material-ui/icons/Assignment";
import FormDataContext from "./FormDataContext";
import InvoiceLinks from "../invoices/InvoiceLinks";
import { useTranslation } from "react-i18next";

const DataEntrySelectionPage = ({ match, periodFormat, dhis2 }) => {
  const { t, i18n } = useTranslation();
  const dataEntryRegistry = PluginRegistry.extension("dataentry.dataEntries");
  const [orgUnit, setOrgUnit] = useState(undefined);
  const [dataEntries, setDataEntries] = useState(undefined);
  const [formData, setFormData] = useState(undefined);
  const [error, setError] = useState(undefined);
  const period = match.params.period;
  useEffect(() => {
    const loadData = async () => {
      const contractService = PluginRegistry.extension("contracts.service");

      const contracts = await contractService.fetchContracts(match.params.orgUnitId);

      const activeContract = contracts.mainContracts.contracts.filter((c) => c.matchPeriod(period))[0];
      if (activeContract == undefined) {
        setError({
          message: match.params.orgUnitId + " has no contract for that period : " + period,
          link: "/contracts/" + match.params.orgUnitId,
        });
        return undefined;
      }
      activeContract.orgUnit.activeContracts = [activeContract];

      setOrgUnit(activeContract.orgUnit);
      const expectedDataEntries = dataEntryRegistry.getExpectedDataEntries(activeContract, period);
      setDataEntries(expectedDataEntries);

      const api = await dhis2.api();
      if (match.params.dataEntryCode) {
        const dataEntry = dataEntryRegistry.getDataEntry(match.params.dataEntryCode);
        const dataSet = await api.get("/dataSets/" + dataEntry.dataSetId, {
          fields:
            "id,name,periodType,dataSetElements[dataElement[id,name,valueType,optionSet[options[code,name]],categoryCombo[id,name,categoryOptionCombos[id,name]]]]",
        });
        const dataElementsById = _.keyBy(
          dataSet.dataSetElements.map((dse) => dse.dataElement),
          (de) => de.id,
        );

        let completeDataSetRegistration;
        const dsc = await api.get("completeDataSetRegistrations", {
          dataSet: dataEntry.dataSetId,
          period: period,
          orgUnit: activeContract.orgUnit.id,
        });
        completeDataSetRegistration = dsc.completeDataSetRegistrations
          ? dsc.completeDataSetRegistrations[0]
          : undefined;
        const dv = await api.get("/dataValueSets", {
          dataSet: dataEntry.dataSetId,
          orgUnit: activeContract.orgUnit.id,
          period: period,
        });
        const rawValues = dv.dataValues || [];
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
          calculator.setIndexedValues(indexedValues);
          calculator.setDefaultCoc(defaultCoc)
          debugger;
        }

        const newFormData = {
          period,
          values: rawValues,
          indexedValues: indexedValues,
          orgUnit: activeContract.orgUnit,
          dataSetComplete: completeDataSetRegistration && completeDataSetRegistration.completed,
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
            if (this.calculator[calculatorFunction]) {
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
              const newIndexedValues = this.indexedValues[key]
                ? {
                    ...this.indexedValues,
                    [key]: [{ ...this.indexedValues[key][0], value: value }],
                  }
                : {
                    ...this.indexedValues,
                    [key]: [{ dataElement: newValue.de, value: value }],
                  };
              calculator.setIndexedValues(newIndexedValues);
              const updatedFormaData = {
                ...this,
                valids: { ...this.valids, [key]: true },
                errors: { ...this.valids, [key]: undefined },
                updating: { ...this.updating, [key]: false },
                indexedValues: newIndexedValues,
              };
              setFormData(updatedFormaData);
            } catch (error) {
              const updatedFormaData = {
                ...this,
                valids: { ...this.valids, [key]: false },
                errors: { ...this.valids, [key]: error.message },
                updating: { ...this.updating, [key]: false },
              };

              setFormData(updatedFormaData);
            }
          },
          async toggleComplete() {
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

            const updatedFormaData = {
              ...this,
              dataSetComplete: !this.dataSetComplete,
            };

            setFormData(updatedFormaData);
          },
        };

        setFormData(newFormData);
      }
    };
    loadData();
  }, []);
  let DataEntryForm = React.Fragment;
  if (
    dataEntryRegistry &&
    match.params.dataEntryCode &&
    dataEntries &&
    dataEntries.some((dataEntry) => dataEntry.dataEntryType.code === match.params.dataEntryCode)
  ) {
    DataEntryForm = dataEntryRegistry.getDataEntryForm(match.params.dataEntryCode);
  }

  return (
    <Paper style={{ minHeight: "90vh", paddingLeft: "50px", paddingTop: "20px" }}>
      {error && (
        <div>
          <Link to={error.link}>{error.message}</Link>
        </div>
      )}
      <h1>
        <AssignmentIcon /> {orgUnit && orgUnit.name}
      </h1>

      <pre>
        {orgUnit &&
          orgUnit.ancestors
            .slice(1, orgUnit.ancestors.length - 1)
            .map((a) => a.name)
            .join(" > ")}
      </pre>

      {orgUnit && orgUnit.activeContracts && (
        <div>
          {t("dataEntry.contractFrom")} <code>{orgUnit.activeContracts[0].startPeriod}</code>{" "}
          {t("dataEntry.contractTo")} <code>{orgUnit.activeContracts[0].endPeriod}</code>{" "}
          {orgUnit.activeContracts[0].codes.map((c) => (
            <Chip label={c} />
          ))}
        </div>
      )}

      <Grid container>
        <Grid item xs={3}>
          <h2>{t("dataEntry.dataEntries")}</h2>
          <table>
            <tbody>
              {dataEntries &&
                dataEntries.map((dataEntry) => (
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
                        to={"/dataEntry/" + orgUnit.id + "/" + dataEntry.period + "/" + dataEntry.dataEntryType.code}
                        title={dataEntry.period}
                      >
                        {DatePeriods.displayName(dataEntry.period, periodFormat[DatePeriods.detect(dataEntry.period)])}
                      </Button>
                    </td>
                  </tr>
                ))}
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
      </Grid>
      <br />
      <div>
        {formData && (
          <FormDataContext.Provider value={formData}>
            <DataEntryForm period={period} dataEntryCode={match.params.dataEntryCode} formData={formData} />
            <br />
          </FormDataContext.Provider>
        )}
      </div>
    </Paper>
  );
};

export default DataEntrySelectionPage;
