import Values from "./Values";
import GroupBasedOrgUnitsResolver from "./GroupBasedOrgUnitsResolver";
import PluginRegistry from "../../core/PluginRegistry";

class InvoiceService {
  async fetchInvoiceData(dhis2, orgUnitId, period, invoiceType, mapper) {
    const extensions = PluginRegistry.extensions("invoices.orgUnitsResolver");
    const resolver =
      extensions.length > 0
        ? extensions[extensions.length - 1]
        : new GroupBasedOrgUnitsResolver();

        const {
      mainOrgUnit,
      orgUnits,
      categoryCombo
    } = await resolver.resolveOrgunits(
      dhis2,
      orgUnitId,
      period,
      invoiceType,
      mapper
    );
    const request = dhis2.buildInvoiceRequest(
      invoiceType.includeMainOrgUnit
        ? orgUnits.concat([mainOrgUnit])
        : orgUnits,
      period,
      invoiceType,
      orgUnitId
    );

    request.mainOrgUnit = mainOrgUnit;
    if (dhis2.categoryComboId) {
      request.categoryCombos = await dhis2.getCategoryComboById();
    }
    request.categoryComboId = categoryCombo;
    const rawValues = await dhis2.getInvoiceValues(request);
    const dataElementsNames = await this.getDataElementsNames(dhis2, request);

    const values = new Values(rawValues, dataElementsNames);
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
    dataElementsFromGroups.dataElements.forEach(
      function(de) {
        names[de.id] = de.displayName;
        names = { ...names, ...this.getCategoryOptionComboByDataElement(de) };
      }.bind(this)
    );

    dataElementsFromDataSet.dataElements.forEach(
      function(de) {
        names[de.id] = de.displayName;
        names = { ...names, ...this.getCategoryOptionComboByDataElement(de) };
      }.bind(this)
    );
    return names;
  }

  getCategoryOptionComboByDataElement(de) {
    var names = {};
    const categoryOptionCombos = de.categoryCombo.categoryOptionCombos;
    if (categoryOptionCombos.length > 1) {
      categoryOptionCombos.forEach(function(catOptionCombo) {
        names[de.id + "." + catOptionCombo.id] =
          de.name + " - " + catOptionCombo.name;
      });
    } else if (categoryOptionCombos.length != 0) {
      names[de.id + "." + categoryOptionCombos[0].name] = de.name;
    }
    return names;
  }
}

export default InvoiceService;
