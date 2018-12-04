import invoiceDescriptors from "./invoice-descriptors.json";
import DemoMapper from "./demo-chc/Mapper";
import DemoInvoice from "./demo-chc/Invoice";
import DemoMonthlyMapper from "./demo-chc-monthly/Mapper";
import DemoMonthlyInvoice from "./demo-chc-monthly/Invoice";


import { indexBy } from "blsq-report-components";

const INVOICE_DEMO_CHT = "demo-chc";
const INVOICE_DEMO_CHT_MONTHLY ="demo-chc-monthly"

const INVOICES = {
  [INVOICE_DEMO_CHT]: {
    component: DemoInvoice,
    mapper: DemoMapper
  },
  [INVOICE_DEMO_CHT_MONTHLY]: {
    component: DemoMonthlyInvoice,
    mapper: DemoMonthlyMapper
  }
};

const DESCRIPTOR_BY_CODE = indexBy(invoiceDescriptors, e => e.code);

class Invoices {
  static getInvoiceTypeCodes(orgUnit) {
    const invoiceCodes = [INVOICE_DEMO_CHT, INVOICE_DEMO_CHT_MONTHLY];

    return invoiceCodes;
  }

  static getInvoiceType(code) {
    let invoice = DESCRIPTOR_BY_CODE[code];
    if (invoice) {
      return invoice;
    }
    throw new Error("not supported type : " + code);
  }

  static getInvoiceTypes(codes) {
    return codes.map(code => this.getInvoiceType(code));
  }
  static component(code) {
    return INVOICES[code].component;
  }

  static mapper(code) {
    const MapperClass = INVOICES[code].mapper;
    return new MapperClass();
  }

  static isCalculable(invoice, currentUser) {
    return this.getOrbfCalculations(invoice, currentUser).length !== 0;
  }
  static getOrbfCalculations(invoice, currentUser) {
    if (currentUser === undefined) {
      return [];
    }
    return [];
  }
}
export default Invoices;
