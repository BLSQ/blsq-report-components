import React from "react";
import PropTypes from "prop-types";
import { withNamespaces } from "react-i18next";

import { FormControl, TextField, makeStyles } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { getOptionFromField } from "./utils/index";

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
const ContractFieldSelect = ({ contract, field, handleChange, t }) => {
  const classes = useStyles();
  const code = contract.fieldValues && contract.fieldValues[field.code];
  const options = field.optionSet.options.map((o) => o.code);
  return (
    <FormControl className={classes.formControl}>
      <Autocomplete
        fullWidth
        noOptionsText={t("noResult")}
        multiple={false}
        id={field.id}
        value={code || null}
        options={options}
        getOptionLabel={(code) => getOptionFromField(field, code).label}
        onChange={(event, newValue) => handleChange(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label={field.name}
            InputProps={{
              ...params.InputProps,
              className: classes.input,
            }}
            InputLabelProps={{
              className: classes.label,
              shrink: code && code !== "",
            }}
            placeholder=""
          />
        )}
      />
    </FormControl>
  );
};

ContractFieldSelect.propTypes = {
  t: PropTypes.func.isRequired,
  contract: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default withNamespaces()(ContractFieldSelect);
