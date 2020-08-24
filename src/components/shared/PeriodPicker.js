import React from "react";
import PropTypes from "prop-types";
import {
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  makeStyles,
} from "@material-ui/core";

import { withNamespaces } from "react-i18next";
import moment from "moment";

import DatePeriods from "../../support/DatePeriods";

const buildPeriods = (period, periodDelta, min, max) => {
  const periods = [];
  Array(periodDelta.before)
    .fill()
    .forEach((x, i) => {
      const currentQuarter = i === 0 ? period : periods[0];
      if (currentQuarter) {
        const previousQuarter = DatePeriods.previousQuarter(currentQuarter);
        // console.log(previousQuarter);
        console.log(
          moment(previousQuarter, "YYYY[Q]Q")
            .startOf("quarter")
            .format("MM/DD/YYYY"),
        );
        const isValidPeriod =
          min === ""
            ? true
            : moment(previousQuarter, "YYYY[Q]Q")
                .startOf("quarter")
                .isAfter(moment(min, "YYYY[Q]Q").startOf("quarter"));
        if (isValidPeriod) {
          periods.unshift(previousQuarter);
        }
      }
    });
  periods.push(period);
  Array(periodDelta.after)
    .fill()
    .forEach((x, i) => {
      const currentIndex = periods.length - 1;
      const currentQuarter = i === 0 ? period : periods[currentIndex];
      if (currentQuarter) {
        const nextQuarter = DatePeriods.nextQuarter(currentQuarter);
        const isValidPeriod =
          max === ""
            ? true
            : moment(nextQuarter, "YYYY[Q]Q")
                .endOf("quarter")
                .isBefore(moment(max, "YYYY[Q]Q").endOf("quarter"));
        if (isValidPeriod) {
          periods.push(nextQuarter);
        }
      }
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
  min,
  max,
}) => {
  const periods = buildPeriods(period, periodDelta, min, max);
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
};

PeriodPicker.propTypes = {
  periodFormat: PropTypes.object,
  period: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
  periodDelta: PropTypes.object,
  labelKey: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
};

export default withNamespaces()(PeriodPicker);
