import _ from "lodash";
import PluginRegistry from "../core/PluginRegistry";

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
  const d = dataEntry.dataSetId ? [dataEntry.dataSetId] : dataEntry.dataSetIds  
  return d ? d : []
};

const fetchCompleteDataSetRegistrations = async (api, dataEntry, period, activeContract) => {
  const dsc = await api.get("completeDataSetRegistrations", {
    dataSet: asDataSetIds(dataEntry),
    period: period,
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

export const buildFormData = async ({ dhis2, api, dataEntryCode, activeContract, dataEntryRegistry, period, setFormData }) => {
  const dataEntry = dataEntryRegistry.getDataEntry(dataEntryCode);
  const dataSets = await fetchDataSets(api, dataEntry);
  const dataSet = dataSets[0];

  const dataElementsById = _.keyBy(
    dataSets.flatMap((dataset) => dataset.dataSetElements.map((dse) => dse.dataElement)),
    (de) => de.id,
  );
  const completeDataSetRegistrations = await fetchCompleteDataSetRegistrations(api, dataEntry, period, activeContract);
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

    isDataSetComplete(dataSetId) {
      if (dataSetId == undefined) {
        const reg = this.completeDataSetRegistrations.find((registration) => registration.dataSet == this.dataSet.id);
        const completed = isDataSetComplete(reg);
        return completed
      } else {
        const reg = this.completeDataSetRegistrations.find((registration) => registration.dataSet == dataSetId);
        const completed = isDataSetComplete(reg);
        return completed;
      }
    },
    isDataWritable(dataSetId) {
      const dataSet = dataSetId ? this.dataSets.find((d) => d.id == dataSetId) : this.dataSet;
      return dataSet && dataSet.access && dataSet.access.data.write;
    },
    error(de) {
      return this.errors[this.getKey(de)];
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
        return this.calculator[calculatorFunction]();
      }
    },
    async updateValue({ dataElement, value, givenPeriod, givenDataSetId}) {
      const de = dataElement
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
    async toggleComplete(calculations, dataSetId) {
      if (dataSetId == undefined) {
        dataSetId = this.dataSet.id;
      }
      const completed = this.isDataSetComplete(dataSetId);
      const completeDataSetRegistration = this.completeDataSetRegistrations.find(
        (registration) => registration.dataSet == dataSetId,
      );
      await toggleDataSetCompletion(
        api,
        dataSetId,
        period,
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
