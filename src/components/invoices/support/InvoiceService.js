import Dhis2 from "../../../support/Dhis2";
import Values from "./Values";

class InvoiceService {
  async fetchInvoiceData(orgUnitId, period, invoiceType, mapper) {
    let mainOrgUnit;
    let orgUnits = [];

    if (invoiceType.contractGroupSet) {
      orgUnits = await Dhis2.getOrgunitsForContract(
        orgUnitId,
        invoiceType.contractGroupSet
      );
      mainOrgUnit = await Dhis2.getOrgunit(orgUnitId);
    } else if (invoiceType.organisationUnitGroup) {
      orgUnits = await Dhis2.getOrgunitsForGroup(
        orgUnitId,
        invoiceType.organisationUnitGroup
      );
      orgUnits = orgUnits.organisationUnits;
      mainOrgUnit = await Dhis2.getOrgunit(orgUnitId);
    } else {
      mainOrgUnit = await Dhis2.getOrgunit(orgUnitId);
      orgUnits = [mainOrgUnit];
    }

    const request = Dhis2.buildInvoiceRequest(
      orgUnits,
      period,
      invoiceType,
      orgUnitId
    );

    request.mainOrgUnit = mainOrgUnit;

    const rawValues = await Dhis2.getInvoiceValues(request);
    const dataElementsNames = await this.getDataElementsNames(request);
    const values = new Values(rawValues, dataElementsNames);
    const invoice = mapper.mapValues(request, values);
    const systemInfo = await Dhis2.systemInfoRaw();

    invoice.invoiceType = invoiceType;
    invoice.period = period;
    invoice.generatedAt = new Date(systemInfo.serverDate);
    return invoice;
  }

  async getDataElementsNames(request) {
    const dataElementsFromGroups = await Dhis2.getDataElementNamesByGroups(
      request.invoiceType.dataElementGroups
    );
    const dataElementsFromDataSet = await Dhis2.getDataElementNamesByDataSets(
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
}

export default InvoiceService;
