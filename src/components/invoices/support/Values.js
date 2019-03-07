class Values {
  constructor(values, names) {
    this.values = values;
    this.names = names;
  }

  amount(code, selectedPeriod) {
    if (this.values.dataValues === undefined) {
      return this.noValueAmount(code, selectedPeriod);
    }
    const amounts = this.getFilteredValues(
      this.getFilterCriteria(code, selectedPeriod)
    );
    const value = this.sumValues(amounts);

    return this.asAmount(code, selectedPeriod, value);
  }

  amountByOrgUnit(code, orgUnit, selectedPeriod) {
    if (this.values.dataValues === undefined) {
      return this.noValueAmount(code, selectedPeriod);
    }

    const amounts = this.getFilteredValues(
      this.getFilterCriteria(code, selectedPeriod, orgUnit)
    );
    const value = this.sumValues(amounts);

    return this.asAmount(code, selectedPeriod, value);
  }

  getFilterCriteria(code, period, orgUnit) {
    let categoryOptionCombo = this.codeType(code, "de.coc");
    let dataElement = this.codeType(code, "de");
    return {
      code: code,
      dataElement: dataElement,
      orgUnit: orgUnit,
      period: period,
      categoryOptionCombo: categoryOptionCombo
    };
  }

  getFilteredValues(filterCriteria) {
    const amounts = this.values.dataValues.filter(row => {
      let matchElement = row.dataElement === filterCriteria.dataElement;
      if (filterCriteria.categoryOptionCombo !== undefined) {
        matchElement =
          matchElement &&
          row.categoryOptionCombo === filterCriteria.categoryOptionCombo;
      }

      let matchOu = true;
      if (filterCriteria.orgUnit) {
        matchOu = row.orgUnit === filterCriteria.orgUnit;
      }

      return (
        matchElement &&
        row.period === filterCriteria.period &&
        row.value !== undefined &&
        matchOu
      );
    });

    return amounts;
  }

  asAmount(code, period, value) {
    return {
      code: code,
      name: this.names[code] ? this.names[code] : "",
      value: value,
      period: period
    };
  }

  sumValues(amounts) {
    if (amounts.length === 0) return " ";
    return amounts
      .map(amount => Number(amount.value))
      .reduce((pv, cv) => pv + cv, 0);
  }

  noValueAmount(code, selectedPeriod) {
    return {
      code: code,
      name: this.names[code] ? this.names[code] : "",
      value: undefined,
      period: selectedPeriod
    };
  }

  codeType(code, codeType) {
    if (code == undefined) {
      return undefined
    }
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

  textByOrgUnit(code, orgUnit, selectedPeriod) {
    if (this.values.dataValues === undefined) {
      return this.noValueAmount(code, selectedPeriod);
    }
    const amounts = this.getFilteredValues(
      this.getFilterCriteria(code, selectedPeriod, orgUnit)
    );
    let value = undefined;
    if (amounts.length > 0) {
      value = amounts[0].value;
    }

    return this.asAmount(code, selectedPeriod, value);
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
