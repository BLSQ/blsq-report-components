import _ from "lodash";
import PluginRegistry from "../core/PluginRegistry";
import DatePeriods from "../../support/DatePeriods";

export const isDataSetComplete = (completeDataSetRegistration) => {
  if (completeDataSetRegistration == undefined) {
    return false;
  }
  if ("completed" in completeDataSetRegistration) {
    return completeDataSetRegistration.completed;
  }
  return true;
};

const asDataSetIds = (dataEntry) => {
  const d = dataEntry.dataSetId ? [dataEntry.dataSetId] : dataEntry.dataSetIds;
  return d ? d : [];
};

export const dsRegistrationPeriods = (dataSet, period) => {
  const periods = DatePeriods.split(period, dataSet.periodType.toLowerCase());
  return periods;
};

const fetchCompleteDataSetRegistrations = async (api, dataEntry, dataSets, period, activeContract) => {
  const dsc = await api.get("completeDataSetRegistrations", {
    dataSet: dataSets.map((d) => d.id),
    period: dataSets.flatMap((dataSet) => dsRegistrationPeriods(dataSet, period)),
    orgUnit: activeContract.orgUnit.id,
  });

  return dsc.completeDataSetRegistrations ? dsc.completeDataSetRegistrations : [];
};

const fetchDataSets = async (api, dataEntry) => {
  const response = await api.get("dataSets", {
    filter: ["id:in:[" + asDataSetIds(dataEntry).join(",") + "]"],
    paging: false,
    fields:
      "id,name,periodType,access,dataSetElements[dataElement[id,name,valueType,optionSet[options[code,name]],categoryCombo[id,name,categoryOptionCombos[id,name]]]],dataEntryForm[:all],indicators[id,name,numerator,denominator]",
  });
  return response.dataSets;
};

const fetchDefaultCoc = async (api) => {
  return (
    await api.get("categoryOptionCombos", {
      filter: "name:eq:default",
    })
  ).categoryOptionCombos[0].id;
};

const fetchDataValues = async (api, dataEntry, activeContract, dataEntryRegistry, period) => {
  const dv = dataEntry.dataSetId
    ? await api.get("/dataValueSets", {
        dataSet: asDataSetIds(dataEntry),
        orgUnit: activeContract.orgUnit.id,
        period: period,
      })
    : { dataValues: [] };
  let rawValues = dv.dataValues || [];
  // gives an opportunity to the dataEntryRegistry to load extra data
  if (dataEntryRegistry.fetchExtraData) {
    const extraValues = await dataEntryRegistry.fetchExtraData(api, activeContract.orgUnit, period, dataEntry);
    rawValues = rawValues.concat(extraValues);
  }
  return rawValues;
};

const toggleDataSetCompletion = async (api, dataSetId, period, orgUnitId, completeDataSetRegistration, completed) => {
  if (completeDataSetRegistration && "completed" in completeDataSetRegistration) {
    // newer dhis2 version just toggle "completed" or create one
    await api.post("completeDataSetRegistrations", {
      completeDataSetRegistrations: [
        {
          dataSet: dataSetId,
          period: period,
          organisationUnit: orgUnitId,
          completed: !completed,
        },
      ],
    });
  } else if (completeDataSetRegistration && completed) {
    // older dhis2 delete the existing completion record
    await api.delete(
      "completeDataSetRegistrations?ds=" + dataSetId + "&pe=" + period + "&ou=" + orgUnitId + "&multiOu=false",
    );
  } else {
    // create a registration record (with the completed flag just in case)

    await api.post("completeDataSetRegistrations", {
      completeDataSetRegistrations: [
        {
          dataSet: dataSetId,
          period: period,
          organisationUnit: orgUnitId,
          completed: !completed,
        },
      ],
    });
  }
};

export const buildFormData = async ({
  dhis2,
  api,
  dataEntryCode,
  activeContract,
  dataEntryRegistry,
  period,
  setFormData,
}) => {
  const dataEntry = dataEntryRegistry.getDataEntry(dataEntryCode);
  const dataSets = await fetchDataSets(api, dataEntry);
  const dataSet = dataSets[0];

  const dataElementsById = _.keyBy(
    dataSets.flatMap((dataset) => dataset.dataSetElements.map((dse) => dse.dataElement)),
    (de) => de.id,
  );
  const completeDataSetRegistrations = await fetchCompleteDataSetRegistrations(
    api,
    dataEntry,
    dataSets,
    period,
    activeContract,
  );
  let completeDataSetRegistration = completeDataSetRegistrations[0];

  let rawValues = await fetchDataValues(api, dataEntry, activeContract, dataEntryRegistry, period);

  if (dataEntryRegistry.fetchExtraMetaData) {
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
  const defaultCoc = await fetchDefaultCoc(api);

  const indexedValues = _.groupBy(rawValues, (v) =>
    [v.orgUnit, v.period, v.dataElement, v.categoryOptionCombo].join("-"),
  );

  let calculator;
  if (dataEntryRegistry.getCalculator) {
    calculator = dataEntryRegistry.getCalculator(activeContract.orgUnit, period, dataEntryCode);
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
    completeDataSetRegistration: completeDataSetRegistration,
    completeDataSetRegistrations: completeDataSetRegistrations,
    dataSet: dataSet,
    dataSets: dataSets,
    dataElementsById: dataElementsById,
    calculator: calculator,
    valids: {},
    errors: {},
    updating: {},

    isDataSetComplete(dataSetId, givenPeriod) {
      if (givenPeriod == undefined) {
        givenPeriod = period;
      }
      if (dataSetId == undefined) {
        const reg = this.completeDataSetRegistrations.find(
          (registration) => registration.dataSet == this.dataSet.id && registration.period == givenPeriod,
        );
        const completed = isDataSetComplete(reg);
        return completed;
      } else {
        const reg = this.completeDataSetRegistrations.find(
          (registration) => registration.dataSet == dataSetId && registration.period == givenPeriod,
        );
        const completed = isDataSetComplete(reg);
        return completed;
      }
    },
    areDataSetsComplete(datasetIds, givenPeriod) {
      const regs = this.completeDataSetRegistrations.filter((registration) =>
        datasetIds.includes(registration.dataSet),
      );

      const dataSets = this.dataSets.filter((d) => datasetIds.includes(d.id));

      for (const dataSet of dataSets) {
        const periods = dsRegistrationPeriods(dataSet, givenPeriod || period);

        for (const regPeriod of periods) {
          const isDsComplete = this.isDataSetComplete(dataSet.id, regPeriod);
          console.log(regPeriod, dataSet.name, dataSet.id, isDsComplete);
          if (isDsComplete == false) {
            return false;
          }
        }
      }
      return true;
    },
    isDataWritable(dataSetId) {
      const dataSet = dataSetId ? this.dataSets.find((d) => d.id == dataSetId) : this.dataSet;
      return dataSet && dataSet.access && dataSet.access.data.write;
    },

    areDataWritable(datasetIds) {
      const dataSets = this.dataSets.filter((d) => datasetIds.includes(d));
      const allWritable = dataSets.every((dataSet) => dataSet && dataSet.access && dataSet.access.data.write);
      return allWritable;
    },
    error(de, givenPeriod) {
      return this.errors[this.getKey(de, givenPeriod)];
    },
    getKey(de, givenPeriod) {
      const deCoc = de.split(".");
      return [activeContract.orgUnit.id, givenPeriod || period, deCoc[0], deCoc[1] || defaultCoc].join("-");
    },
    getError(de, givenPeriod) {
      const key = this.getKey(de, givenPeriod);
      return this.errors[key];
    },
    isModified(de, givenPeriod) {
      const key = this.getKey(de, givenPeriod);
      return this.valids[key] == true;
    },
    isUpdating(de, givenPeriod) {
      const key = this.getKey(de, givenPeriod);
      return this.updating[key] == true;
    },
    isInvalid(de, givenPeriod) {
      const key = this.getKey(de, givenPeriod);
      return this.valids[key] == false;
    },
    getValue(de, givenPeriod) {
      const key = this.getKey(de, givenPeriod);

      const ourValues = this.indexedValues[key];
      return ourValues ? ourValues[0] : undefined;
    },
    getCalculatedValue(hesabuPackage, formulaCode, period, orgUnit, activity) {
      let orgUnitId = orgUnit ? orgUnit.id : activeContract.orgUnit.id;
      const calculatorFunction = activity
        ? `${hesabuPackage.code}_${activity.code}_${formulaCode}_${orgUnitId}_${period}`
        : `${hesabuPackage.code}_${formulaCode}_${orgUnitId}_${period}`;
      if (this.calculator && this.calculator[calculatorFunction]) {
        try {
          return this.calculator[calculatorFunction]();
        } catch (e) {
          console.log(e);
          throw e;
        }
      }
    },
    async updateValue({ dataElement, value, givenPeriod, givenDataSetId }) {
      const de = dataElement;
      const deCoc = de.split(".");
      const key = this.getKey(de, givenPeriod);
      if (this.updating[key]) {
        return;
      } else {
        this.updating[key] = true;
      }
      const newValue = {
        de: deCoc[0],
        co: deCoc[1] || defaultCoc,
        ds: givenDataSetId || dataSet.id,
        ou: activeContract.orgUnit.id,
        pe: givenPeriod || period,
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
          calculator.resetCachedCalculations()
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
    async toggleComplete(calculations, dataSetId, givenPeriod) {
      if (dataSetId == undefined) {
        dataSetId = this.dataSet.id;
      }
      const completed = this.isDataSetComplete(dataSetId, givenPeriod);
      const completeDataSetRegistration = this.completeDataSetRegistrations.find(
        (registration) => registration.dataSet == dataSetId && registration.period == givenPeriod,
      );
      await toggleDataSetCompletion(
        api,
        dataSetId,
        givenPeriod,
        activeContract.orgUnit.id,
        completeDataSetRegistration,
        completed,
      );
      if (calculations && !completed) {
        const orbf2 = PluginRegistry.extension("invoices.hesabu");
        calculations.forEach((calculation) => orbf2.calculate(calculation));
      }
      const completeDataSetRegistrations = await fetchCompleteDataSetRegistrations(
        api,
        dataEntry,
        dataSets,
        period,
        activeContract,
      );
      const reg = completeDataSetRegistrations.find((registration) => registration.dataSet == dataSetId);
      this.completeDataSetRegistrations = completeDataSetRegistrations;
      const updatedFormaData = {
        ...this,
        completeDataSetRegistration: completeDataSetRegistrations[0],
        completeDataSetRegistrations: completeDataSetRegistrations,
      };

      setFormData(updatedFormaData);
      return updatedFormaData;
    },
  };
  return newFormData;
};
