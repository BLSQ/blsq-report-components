import Dhis2 from "../../../support/Dhis2";
import Values from "./Values";

class InvoiceService {
  async fetchInvoiceData(dhis2, orgUnitId, period, invoiceType, mapper) {
    let mainOrgUnit;
    let orgUnits = [];

    if (invoiceType.contractGroupSet) {
      orgUnits = await dhis2.getOrgunitsForContract(
        orgUnitId,
        invoiceType.contractGroupSet
      );
      mainOrgUnit = await dhis2.getOrgunit(orgUnitId);
    } else if (invoiceType.organisationUnitGroup) {
      orgUnits = await dhis2.getOrgunitsForGroup(
        orgUnitId,
        invoiceType.organisationUnitGroup
      );
      orgUnits = orgUnits.organisationUnits;
      mainOrgUnit = await dhis2.getOrgunit(orgUnitId);
    } else {
      mainOrgUnit = await dhis2.getOrgunit(orgUnitId);
      orgUnits = [mainOrgUnit];
    }

    const request = dhis2.buildInvoiceRequest(
      orgUnits,
      period,
      invoiceType,
      orgUnitId
    );

    request.mainOrgUnit = mainOrgUnit;

    const rawValues = await dhis2.getInvoiceValues(request);
    const dataElementsNames = await this.getDataElementsNames(dhis2, request);
    const dataElementsCategoryOptionComboNames = await this.getDataElementCategoryOptionComboNames(
      dhis2,
      request
    );
    const values = new Values(
      rawValues,
      dataElementsNames,
      dataElementsCategoryOptionComboNames
    );
    const invoice = mapper.mapValues(request, values);
    const systemInfo = await dhis2.systemInfoRaw();

    invoice.invoiceType = invoiceType;
    invoice.period = period;
    invoice.generatedAt = new Date(systemInfo.serverDate);
    return invoice;
  }

  async getDataElementsNames(dhis2, request) {
    const dataElementsFromGroups = await dhis2.getDataElementNamesByGroups(
      request.invoiceType.dataElementGroups
    );
    const dataElementsFromDataSet = await dhis2.getDataElementNamesByDataSets(
      request.invoiceType.dataSets
    );
    var names = {};
    dataElementsFromGroups.dataElements.forEach(function(de) {
      names[de.id] = de.displayName;
    });

    dataElementsFromDataSet.dataElements.forEach(function(de) {
      names[de.id] = de.displayName;
    });
    return names;
  }

  async getDataElementCategoryOptionComboNames(dhis2, request) {
    const dataElementsFromGroups = await dhis2.getDataElementNamesByGroups(
      request.invoiceType.dataElementGroups
    );
    const dataElementsFromDataSet = await dhis2.getDataElementNamesByDataSets(
      request.invoiceType.dataSets
    );
    var names = {};

    await Promise.all(
      dataElementsFromGroups.dataElements.forEach(
        async function(de) {
          var dataElementNamesFromGroup = await this.getCategoryOptionComboByDataElement(
            de.id
          );
          names = {
            ...names,
            ...dataElementNamesFromGroup
          };
        }.bind(this)
      )
    );

    await Promise.all(
      dataElementsFromDataSet.dataElements.forEach(
        async function(de) {
          var dataElementNamesFromDataSet = await this.getCategoryOptionComboByDataElement(
            de.id
          );
          names = {
            ...names,
            ...dataElementNamesFromDataSet
          };
        }.bind(this)
      )
    );
    return names;
  }

  async getCategoryOptionComboByDataElement(dataElementId) {
    const categoryOptionComboNames = await dhis2.getCategoryOptionComboByDataElement(
      dataElementId
    );
    var names = {};
    const categoryOptionCombos =
      categoryOptionComboNames.categoryCombo.categoryOptionCombos;
    if (categoryOptionCombos.length > 1) {
      categoryOptionCombos.forEach(function(catOptionCombo) {
        names[categoryOptionComboNames.id + "." + catOptionCombo.id] =
          categoryOptionComboNames.name + "-" + catOptionCombo.name;
      });
    } else {
      names[categoryOptionComboNames.id + "." + catOptionCombo.id] =
        categoryOptionComboNames.name;
    }
    return names;
  }
}

export default InvoiceService;
