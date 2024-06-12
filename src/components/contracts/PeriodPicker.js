import { Divider, FormControl, MenuItem, TextField, makeStyles } from "@material-ui/core";
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
  const indexOfMonths = mode === "active" ? [0, 1, 2] : mode === "beginning" ? [0] : [2];
  const classes = useStyles();
  const { t } = useTranslation();
  const defaultPeriod =
    mode === "active"
      ? currentPeriod || ""
      : currentPeriod || "" + new Date().getFullYear() + (mode == "beginning" ? "01" : "12");

  let visibibleQuarters = [];
  let year = minYear;
  while (year <= maxYear) {
    DatePeriods.split("" + year, "quarterly").forEach((p) => visibibleQuarters.push(p));
    year = year + 1;
  }

  if (mode === "beginning") {
    visibibleQuarters.reverse();
  }

  if (mode === "active") {
    const currentQuarters = DatePeriods.split(
      DatePeriods.split(DatePeriods.currentQuarter(), "yearly")[0],
      "quarterly",
    );
    visibibleQuarters = currentQuarters.concat(visibibleQuarters);
  }

  if (!["beginning", "end", "active"].includes(mode)) {
    throw new Error("non support mode for period picker '" + mode + "'");
  }
  let index = 0;

  const visibleMonths = visibibleQuarters
    .flatMap((period) => {
      return indexOfMonths.map((indexOfMonth) => {
        const monthPeriod = DatePeriods.split(period, "monthly")[indexOfMonth];
        index = index + 1;
        return {
          value: monthPeriod,
          label: DatePeriods.displayName(monthPeriod, "monthYear"),
          monthPeriod: monthPeriod,
          quarterPeriod: period,
          index: index,
        };
      });
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

  const [period, setPeriod] = useState(undefined);

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
        key={"periodpicker-" + currentPeriod}
        fullWidth
        noOptionsText={t("noResult")}
        value={current[0]}
        defaultValue={current[0]}
        options={visibleMonths}
        getOptionLabel={(option) => option.label}
        getOptionSelected={(option) => option.value}
        filterOptions={filterOptions}
        renderOption={(option, props2) => {
          const { key, ...otherProps } = props2;
          return (
            <span>
              <li key={option.index} {...otherProps} title={option.monthPeriod}>
                {option.label}
              </li>
              {option.index == 12 && <hr />}
            </span>
          );
        }}
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
            title={current[0]?.monthPeriod }
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
