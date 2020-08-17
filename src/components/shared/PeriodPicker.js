import React from "react";
import PropTypes from "prop-types";
import {
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  makeStyles,
} from "@material-ui/core";

import DatePeriods from "../../support/DatePeriods";
import { withNamespaces } from "react-i18next";

const buildPeriods = (period, periodDelta) => {
  const periods = [];
  Array(periodDelta.before)
    .fill()
    .forEach((x, i) => {
      periods.unshift(
        DatePeriods.previousQuarter(i === 0 ? period : periods[0]),
      );
    });
  periods.push(period);
  Array(periodDelta.after)
    .fill()
    .forEach((x, i) => {
      const currentIndex = periods.length - 1;
      periods.push(
        DatePeriods.nextQuarter(i === 0 ? period : periods[currentIndex]),
      );
    });
  return periods;
};

const styles = (theme) => ({
  formControl: {
    width: "100%",
    verticalAlign: "bottom",
  },
});

const useStyles = makeStyles((theme) => styles(theme));
const PeriodPicker = ({
  period,
  periodFormat,
  t,
  onPeriodChange,
  periodDelta,
  labelKey,
}) => {
  const periods = buildPeriods(period, periodDelta);
  const classes = useStyles();
  return (
    <FormControl className={classes.formControl}>
      <InputLabel>{t(labelKey)}</InputLabel>
      <Select
        value={period}
        onChange={(event) => onPeriodChange(event.target.value)}
        title={period}
      >
        {periods.map((dhis2period) => (
          <MenuItem key={dhis2period} value={dhis2period} title={dhis2period}>
            {DatePeriods.displayName(dhis2period, periodFormat.quarterly)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

PeriodPicker.defaultProps = {
  periodFormat: {
    quarterly: "quarter",
  },
  periodDelta: {
    before: 5,
    after: 2,
  },
  labelKey: "period",
};

PeriodPicker.propTypes = {
  periodFormat: PropTypes.object,
  period: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
  periodDelta: PropTypes.object,
  labelKey: PropTypes.string,
};

export default withNamespaces()(PeriodPicker);
