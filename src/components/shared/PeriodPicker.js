import React from "react";
import PropTypes from "prop-types";
import { InputLabel, FormControl, Select, MenuItem, makeStyles } from "@material-ui/core";

import { withTranslation } from "react-i18next";

import DatePeriods from "../../support/DatePeriods";


const styles = (theme) => ({
  formControl: {
    width: "100%",
    verticalAlign: "bottom",
  },

});

const useStyles2 = makeStyles((theme) => ({
  select: {
    color: "white",
  },
  icon: { color: "white" },
  label: { color: "white" },
}));  



const useStyles = makeStyles((theme) => styles(theme));
const PeriodPicker = ({ disableInputLabel, variant, period, periodFormat, t, onPeriodChange, periodDelta, labelKey, min, max, renderPeriod }) => {
  const periods = DatePeriods.buildPeriods(period, periodDelta, min, max);
  const classes = variant == "white" ? useStyles2() : useStyles();
  const displayPeriod = (dhis2period) =>
    renderPeriod === null ? DatePeriods.displayName(dhis2period, periodFormat.quarterly) : renderPeriod(dhis2period);
  return (
    <FormControl color="inherit" className={classes.formControl}>
      { !disableInputLabel && <InputLabel color="inherit">{t(labelKey)}</InputLabel>}
      <Select color="inherit" value={period} onChange={(event) => onPeriodChange(event.target.value)} title={period}  classes={classes}>
        {periods.map((dhis2period) => (
          <MenuItem key={dhis2period} value={dhis2period} title={dhis2period} color="inherit">
            {displayPeriod(dhis2period)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

PeriodPicker.defaultProps = {
  disableInputLabel: false,
  currentPeriodFormat: "quarter",
  periodFormat: {
    quarterly: "quarter",
  },
  periodDelta: {
    before: 5,
    after: 2,
  },
  labelKey: "period",
  min: "",
  max: "",
  renderPeriod: null,
};

PeriodPicker.propTypes = {
  disableInputLabel :  PropTypes.func.isRequired,
  periodFormat: PropTypes.object,
  period: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
  periodDelta: PropTypes.object,
  labelKey: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
  renderPeriod: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
};

export default withTranslation()(PeriodPicker);
