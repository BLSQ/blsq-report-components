class Values {
  constructor(values, names) {
    this.values = values;
    this.names = names;
  }

  amount(code, optionComboCode, selectedPeriod) {
    if (this.values.dataValues === undefined) {
      return {
        code: code,
        name: this.names[code]
          ? this.names[code]
          : this.names[optionComboCode]
          ? this.names[optionComboCode]
          : "",
        value: undefined,
        period: selectedPeriod
      };
    }
    var amounts = this.values.dataValues.filter(function(row) {
      return (
        (row.dataElement === code ||
          row.categoryOptionCombo === optionComboCode) &&
        row.period === selectedPeriod &&
        row.value !== undefined
      );
    });
    const value = amounts.length === 0 ? " " : Number(amounts[0].value);

    return {
      code: code,
      name: this.names[code]
        ? this.names[code]
        : this.names[optionComboCode]
        ? this.names[optionComboCode]
        : "",
      value: value,
      period: selectedPeriod
    };
  }

  amountByOrgUnit(code, optionComboCode, orgUnitCode, selectedPeriod) {
    if (this.values.dataValues === undefined) {
      return {
        code: code,
        name: this.names[code]
          ? this.names[code]
          : this.names[optionComboCode]
          ? this.names[optionComboCode]
          : "",
        value: undefined,
        period: selectedPeriod
      };
    }
    const amounts = this.values.dataValues.filter(function(row) {
      return (
        (row.dataElement === code ||
          row.categoryOptionCombo === optionComboCode) &&
        row.period === selectedPeriod &&
        row.value !== undefined &&
        row.orgUnit === orgUnitCode
      );
    });
    const value = amounts.length === 0 ? " " : Number(amounts[0].value);

    return {
      code: code,
      name: this.names[code]
        ? this.names[code]
        : this.names[optionComboCode]
        ? this.names[optionComboCode]
        : "",
      value: value,
      period: selectedPeriod
    };
  }

  textByOrgUnit(code, optionComboCode, orgUnitCode, selectedPeriod) {
    if (this.values.dataValues === undefined) {
      return {
        code: code,
        name: this.names[code]
          ? this.names[code]
          : this.names[optionComboCode]
          ? this.names[optionComboCode]
          : "",
        value: undefined,
        period: selectedPeriod
      };
    }
    const amounts = this.values.dataValues.filter(function(row) {
      return (
        (row.dataElement === code ||
          row.categoryOptionCombo === optionComboCode) &&
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
      name: this.names[code]
        ? this.names[code]
        : this.names[optionComboCode]
        ? this.names[optionComboCode]
        : "",
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
