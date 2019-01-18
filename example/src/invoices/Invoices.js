import invoiceDescriptors from "./invoice-descriptors.json";

// for reproducability fake descriptor in orbf2 format
import projectDescriptor from "./project-descriptors.json";

import DemoMapper from "./demo-chc/Mapper";
import DemoInvoice from "./demo-chc/Invoice";
import DemoMonthlyMapper from "./demo-chc-monthly/Mapper";
import DemoMonthlyInvoice from "./demo-chc-monthly/Invoice";

import {
  indexBy,
  GenericInvoices,
  CompositeInvoices
} from "@blsq/blsq-report-components";

const INVOICE_DEMO_CHT = "demo-chc";
const INVOICE_DEMO_CHT_MONTHLY = "demo-chc-monthly";
const INVOICE_DEMO_CHT_SEMIANNUALLY = "demo-chc-sixMonthly";

const INVOICES = {
  [INVOICE_DEMO_CHT]: {
    component: DemoInvoice,
    mapper: DemoMapper
  },
  [INVOICE_DEMO_CHT_MONTHLY]: {
    component: DemoMonthlyInvoice,
    mapper: DemoMonthlyMapper
  },
  [INVOICE_DEMO_CHT_SEMIANNUALLY]: {
    component: DemoInvoice,
    mapper: DemoMapper
  }
};

const DESCRIPTOR_BY_CODE = indexBy(invoiceDescriptors, e => e.code);

class Invoices {
  getInvoiceTypeCodes(orgUnit) {
    const invoiceCodes = [
      INVOICE_DEMO_CHT,
      INVOICE_DEMO_CHT_MONTHLY,
      INVOICE_DEMO_CHT_SEMIANNUALLY
    ];
    return invoiceCodes;
  }

  getInvoiceType(code) {
    let invoice = DESCRIPTOR_BY_CODE[code];
    if (invoice) {
      return invoice;
    }
    throw new Error("not supported type : " + code);
  }

  getInvoiceTypes(codes) {
    return codes.map(code => this.getInvoiceType(code));
  }
  component(code) {
    if (INVOICES[code]) {
      return INVOICES[code].component;
    }
  }

  mapper(code) {
    if (INVOICES[code]) {
      const MapperClass = INVOICES[code].mapper;
      return new MapperClass();
    }
  }

  isCalculable(invoice, currentUser) {
    return this.getOrbfCalculations(invoice, currentUser).length !== 0;
  }
  getOrbfCalculations(invoice, currentUser) {
    if (currentUser === undefined) {
      return [];
    }
    return [];
  }
}

export default new CompositeInvoices([
  new Invoices(),
  new GenericInvoices(projectDescriptor)
]);
