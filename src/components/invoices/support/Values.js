class Values {
  constructor(values, names) {
    this.values = values;
    this.names = names;
  }

  amount(code, selectedPeriod) {
    if (this.values.dataValues === undefined) {
      return {
        code: code,
        name: this.names[code] ? this.names[code] : "",
        value: undefined,
        period: selectedPeriod
      };
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
    if (this.values.dataValues === undefined) {
      return {
        code: code,
        name: this.names[code] ? this.names[code] : "",
        value: undefined,
        period: selectedPeriod
      };
    }
    const amounts = this.values.dataValues.filter(function(row) {
      return (
        row.dataElement === code &&
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

  textByOrgUnit(code, orgUnitCode, selectedPeriod) {
    if (this.values.dataValues === undefined) {
      return {
        code: code,
        name: this.names[code] ? this.names[code] : "",
        value: undefined,
        period: selectedPeriod
      };
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
