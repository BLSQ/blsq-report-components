class CompositeInvoices {
  constructor(sources) {
    this.sources = sources;
  }

  getInvoiceTypeCodes(orgUnit) {
    const invoiceTypeCodes = this.sources.flatMap(source => {
      return source.getInvoiceTypeCodes(orgUnit);
    });

    return invoiceTypeCodes;
  }

  getInvoiceType(code) {
    const errors = [];
    let invoiceType;
    this.sources.forEach(source => {
      try {
        if (invoiceType === undefined) {
          invoiceType = source.getInvoiceType(code);
          return invoiceType;
        }
      } catch (error) {
        errors.push(error.message);
      }
    });
    if (invoiceType) {
      return invoiceType;
    }
    throw new Error("unsupported code '" + code + "'" + errors.join(","));
  }

  getInvoiceTypes(codes) {
    return codes.map(code => this.getInvoiceType(code));
  }

  component(code) {
    let component;
    const errors = [];
    this.sources.forEach(source => {
      if (component == undefined) {
        component = source.component(code);
      }
    });
    return component;
  }

  mapper(code) {
    let mapper;
    this.sources.forEach(source => {
      if (mapper == undefined) {
        mapper = source.mapper(code);
      }
    });
    return mapper;
  }

  isCalculable(invoice, currentUser) {
    return this.getOrbfCalculations(invoice, currentUser).length !== 0;
  }

  getOrbfCalculations(invoice, currentUser) {
    const errors = [];
    let calculations;
    this.sources.forEach(source => {
      if (calculations === undefined) {
        calculations = source.getOrbfCalculations(invoice, currentUser);
      }
    });
    return calculations
  }
}

export default CompositeInvoices;
