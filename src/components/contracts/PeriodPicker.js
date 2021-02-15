import { FormControl, TextField, makeStyles } from "@material-ui/core";
import { Autocomplete, createFilterOptions } from "@material-ui/lab";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import DatePeriods from "../../support/DatePeriods";
import PropTypes from "prop-types";

const styles = (theme) => ({
  formControl: {
    width: "100%",
    marginBottom: theme.spacing(),
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  input: {
    width: "100%",
  },
});
const useStyles = makeStyles((theme) => styles(theme));

const minYear = 1970;
const maxYear = new Date().getFullYear() + 40;

const PeriodPicker = ({ currentPeriod, mode, fieldName, min, max, onPeriodChange }) => {
  const indexOfMonth = mode === "beginning" ? 0 : 2;
  const classes = useStyles();
  const { t } = useTranslation();
  const defaultPeriod = currentPeriod || "" + new Date().getFullYear() + (mode == "beginning" ? "01" : "12");

  const [period, setPeriod] = useState(undefined);

  const visibibleQuarters = [];
  let year = minYear;
  while (year <= maxYear) {
    DatePeriods.split("" + year, "quarterly").forEach((p) => visibibleQuarters.push(p));
    year = year + 1;
  }
  const visibleMonths = visibibleQuarters
    .map((period) => {
      const monthPeriod = DatePeriods.split(period, "monthly")[indexOfMonth];
      return {
        value: monthPeriod,
        label: DatePeriods.displayName(monthPeriod, "monthYear"),
        monthPeriod: monthPeriod,
        quarterPeriod: period,
      }; // +" / "+
    })
    .filter((p) => {
      if (min && p.monthPeriod < min) {
        return false;
      }
      if (max && p.monthPeriod >= max) {
        return false;
      }
      return true;
    });
  const handleChange = (newperiod) => {
    setPeriod(newperiod);
    onPeriodChange(newperiod ? newperiod.monthPeriod : undefined);
  };

  const filterOptions = createFilterOptions({
    /* this allow to filter by typing 201601 or 20216Q1 or janvier 20... */
    stringify: (option) => {
      return option.label + " " + option.monthPeriod + " " + option.quarterPeriod;
    },
  });
  const current = visibleMonths.filter((v) => v.monthPeriod === defaultPeriod);

  return (
    <FormControl>
      <Autocomplete
        fullWidth
        noOptionsText={t("noResult")}
        multiple={false}
        value={period}
        defaultValue={current[0]}
        options={visibleMonths}
        getOptionLabel={(option) => option.label}
        filterOptions={filterOptions}
        onChange={(event, newValue) => handleChange(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label={fieldName}
            InputProps={{
              ...params.InputProps,
              className: classes.input,
            }}
            InputLabelProps={{
              className: classes.label,
            }}
            placeholder=""
          />
        )}
      />
    </FormControl>
  );
};

PeriodPicker.propTypes = {
  currentPeriod: PropTypes.string,
  mode: PropTypes.oneOf(["beginning", "end"]),
  fieldName: PropTypes.string.isRequired,
  min: PropTypes.string,
  max: PropTypes.string,
  onPeriodChange: PropTypes.func.isRequired,
};

export default PeriodPicker;
