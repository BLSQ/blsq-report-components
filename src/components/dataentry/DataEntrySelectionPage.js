import React, { useEffect, useState } from "react";
import DatePeriods from "../../support/DatePeriods";
import PluginRegistry from "../core/PluginRegistry";
import _ from "lodash";
import { Link } from "react-router-dom";
import { Button } from "@material-ui/core";
import AssignmentIcon from "@material-ui/icons/Assignment";

import FormDataContext from "./FormDataContext";

// TODO use plugin
import dataEntryRegistry from "./DataEntries";

const DataEntrySelectionPage = ({ match, periodFormat, dhis2 }) => {
  const [orgUnit, setOrgUnit] = useState(undefined);
  const [dataEntries, setDataEntries] = useState(undefined);
  const [formData, setFormData] = useState(undefined);
  const [error, setError] = useState(undefined);
  useEffect(() => {
    const loadData = async () => {
      const contractService = PluginRegistry.extension("contracts.service");
      const period = match.params.period;
      const contracts = await contractService.fetchContracts(match.params.orgUnitId);
      const activeContract = contracts.mainContracts.contracts.filter((c) => c.matchPeriod(period))[0];
      if (activeContract == undefined) {
        setError({
          message: match.params.orgUnitId + " has no contract for that period : " + period,
          link: "/contracts/" + match.params.orgUnitId,
        });
        return undefined;
      }
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
        const dataElements = _.keyBy(
          dataSet.dataSetElements.map((dse) => dse.dataElement),
          (de) => de.id,
        );

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

        const newFormData = {
          period,
          values: rawValues,
          indexedValues: indexedValues,
          orgUnit: activeContract.orgUnit,
          dataSet: dataSet,
          dataElementsById: dataElements,
          valids: {},
          errors: {},
          updating: {},
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

              const updatedFormaData = {
                ...this,
                valids: { ...this.valids, [key]: true },
                errors: { ...this.valids, [key]: undefined },
                updating: { ...this.updating, [key]: false },
                indexedValues: {
                  ...this.indexedValues,
                  [key]: [{ ...this.indexedValues[key][0], value: value }],
                },
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
        };

        setFormData(newFormData);
      }
    };
    loadData();
  }, []);
  let DataEntryForm = React.Fragment;
  if (match.params.dataEntryCode) {
    DataEntryForm = dataEntryRegistry.getDataEntryForm(match.params.dataEntryCode);
  }
  return (
    <div>
      {error && (
        <div>
          <Link to={error.link}>{error.message}</Link>
        </div>
      )}
      <h1>
        <AssignmentIcon></AssignmentIcon> {orgUnit && orgUnit.name}
      </h1>

      <pre>
        {orgUnit &&
          orgUnit.ancestors
            .slice(1, orgUnit.ancestors.length - 1)
            .map((a) => a.name)
            .join(" > ")}
      </pre>

      <table>
        <tbody>
          {dataEntries &&
            dataEntries.map((dataEntry) => (
              <tr>
                <td>{dataEntry.dataEntryType.name}</td>
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
      <br></br>
      <FormDataContext.Provider value={formData}>
        <DataEntryForm></DataEntryForm>
      </FormDataContext.Provider>
    </div>
  );
};

export default DataEntrySelectionPage;
