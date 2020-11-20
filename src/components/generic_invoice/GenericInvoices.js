import GenericInvoice from "./GenericInvoice";
import GenericMapper from "./GenericMapper";

class GenericInvoices {
  constructor(projectDescriptor) {
    this.projectDescriptor = projectDescriptor;
    this.invoiceDescriptors = [];
    this._buildRegisterDescriptors();
    this._build_widgets();
  }

  _build_widgets() {
    this.widgets = {};
    this.invoiceDescriptors.forEach(invoiceDescriptor => {
      this.widgets[invoiceDescriptor.code] = {
        component: GenericInvoice,
        mapper: GenericMapper
      };
    });
  }

  _buildRegisterDescriptors() {
    Object.keys(this.projectDescriptor.payment_rules).forEach(
      paymentRuleCode => {
        const paymentRule = this.projectDescriptor.payment_rules[
          paymentRuleCode
        ];
        paymentRule.code = paymentRuleCode;
        let orgUnitGroupIds = [];
        let dataElementGroups = []; // TODO outputs dataset where not created
        let dataSets = [].concat(paymentRule.data_set_ids);
        Object.keys(paymentRule.packages).forEach(packageCode => {
          const orbfPackage = paymentRule.packages[packageCode];
          dataElementGroups = dataElementGroups.concat(
            orbfPackage.data_element_group_ids
          );
          dataSets = dataSets.concat(orbfPackage.data_set_ids);
          orgUnitGroupIds = orgUnitGroupIds.concat(
            orbfPackage.main_org_unit_group_ids
          );
        });
        const descriptor = {
          code: paymentRuleCode,
          dataElementGroups: dataElementGroups,
          dataSets: dataSets,
          description: "ORBF2 - " + paymentRule.name,
          frequency: paymentRule.frequency || "quarterly", //TODO find
          name: "ORBF2 - " + paymentRule.name,
          orientation: "landscape",
          paymentRule: paymentRule,
          orgUnitGroupIds: orgUnitGroupIds
        };
        this.invoiceDescriptors.push(descriptor);
      }
    );
  }

  getInvoiceTypeCodes(orgUnit) {
    let applicableInvoices = [];

    this.invoiceDescriptors.forEach(invoiceDescriptor => {
      if (orgUnit.organisationUnitGroups) {
        const matching = orgUnit.organisationUnitGroups.filter(oug =>
          invoiceDescriptor.orgUnitGroupIds.includes(oug.id)
        );

        if (matching.length > 0) {
          applicableInvoices.push(invoiceDescriptor.code);
        }
      }
    });
    return applicableInvoices;
  }

  getInvoiceType(code) {
    return this.invoiceDescriptors.find(desc => desc.code === code);
  }

  getInvoiceTypes(codes) {
    return codes.map(code => this.getInvoiceType(code));
  }

  mapper(code) {
    if (this.widgets[code] === undefined) {
      return;
    }
    const MapperClass = this.widgets[code].mapper;
    return new MapperClass();
  }

  component(code) {
    return this.widgets[code].component;
  }
}

export default GenericInvoices;
