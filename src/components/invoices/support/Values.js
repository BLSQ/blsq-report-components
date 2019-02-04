class Values {
  constructor(values, names) {
    this.values = values;
    this.names = names;
  }

  amount(code, selectedPeriod) {
    if (this.values.dataValues === undefined) {
      return this.undefinedValue(code, selectedPeriod);
    }
    var amounts = this.values.dataValues.filter(function(row) {
      return (
        row.dataElement === code &&
        row.period === selectedPeriod &&
        row.value !== undefined
      );
    });
    const value =
      amounts.length === 0
        ? " "
        : amounts
            .map(amount => Number(amount.value))
            .reduce((pv, cv) => pv + cv, 0);

    return {
      code: code,
      name: this.names[code] ? this.names[code] : "",
      value: value,
      period: selectedPeriod
    };
  }

  amountByOrgUnit(code, orgUnitCode, selectedPeriod) {
    let categoryOptionCombo = this.codeType(code, "de.coc");
    let dataElementcode = this.codeType(code, "de");
    if (this.values.dataValues === undefined) {
      return this.undefinedValue(code, selectedPeriod);
    }
    const amounts = this.values.dataValues.filter(function(row) {
      return (
        ((categoryOptionCombo === undefined &&
          row.dataElement === dataElementcode) ||
          (categoryOptionCombo !== undefined &&
            (row.dataElement === dataElementcode &&
              row.categoryOptionCombo === categoryOptionCombo))) &&
        row.period === selectedPeriod &&
        row.value !== undefined &&
        row.orgUnit === orgUnitCode
      );
    });

    const value =
      amounts.length === 0
        ? " "
        : amounts
            .map(amount => Number(amount.value))
            .reduce((pv, cv) => pv + cv, 0);

    return {
      code: code,
      name: this.names[code] ? this.names[code] : "",
      value: value,
      period: selectedPeriod
    };
  }

  codeType(code, codeType) {
    switch (codeType) {
      case "de":
        return code.includes(".") ? code.split(".")[0] : code;
        break;
      case "de.coc":
        return code.includes(".") ? code.split(".")[1] : undefined;
        break;
      default:
    }
  }

  textByOrgUnit(code, orgUnitCode, selectedPeriod) {
    if (this.values.dataValues === undefined) {
      return this.undefinedValue(code, selectedPeriod);
    }
    const amounts = this.values.dataValues.filter(function(row) {
      return (
        row.dataElement === code &&
        row.period === selectedPeriod &&
        row.value !== undefined &&
        row.orgUnit === orgUnitCode
      );
    });
    let value = undefined;
    if (amounts.length > 0) {
      value = amounts[0].value;
    }

    return {
      code: code,
      name: this.names[code] ? this.names[code] : "",
      value: value,
      period: selectedPeriod
    };
  }

  assignFormulaAmounts(total, descriptor, period, normalizeAttrib) {
    Object.keys(descriptor).forEach(attribute => {
      total[attribute] = this.amount(descriptor[attribute].de_id, period);
    });
    return total;
  }

  undefinedValue(code, selectedPeriod) {
    return {
      code: code,
      name: this.names[code] ? this.names[code] : "",
      value: undefined,
      period: selectedPeriod
    };
  }

  assignFormulaAmountsOrgUnit(
    total,
    descriptor,
    period,
    normalizeAttrib,
    orgUnitId
  ) {
    Object.keys(descriptor).forEach(attribute => {
      total[attribute] = this.amountByOrgUnit(
        descriptor[attribute].de_id,
        orgUnitId,
        period
      );
    });
    return total;
  }
}

export default Values;
