import React from "react";
import PropTypes from "prop-types";
import { withNamespaces } from "react-i18next";

import {
    FormControl,
    Input,
    InputAdornment,
    Tooltip,
    IconButton,
    InputLabel,
    Checkbox,
    FormControlLabel,
} from "@material-ui/core";
import TextField from '@material-ui/core/TextField';
import { Autocomplete } from '@material-ui/lab';

import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from "@material-ui/icons/Search";
import InfoIcon from '@material-ui/icons/Info';
import Clear from '@material-ui/icons/Clear';
import { KeyboardDatePicker } from '@material-ui/pickers';


const styles = theme => ({
  formControl: {
    width: "100%",
    marginBottom: theme.spacing()
  },
  searchLabel: {
    paddingLeft: theme.spacing(4),
    paddingTop: 4
  },
  label: {
    paddingTop: 4
  },
  clearDateButton: {
      marginRight: theme.spacing(2),
      padding: 0,
      position: 'absolute',
      right: theme.spacing(5),
      top: 20
  },
  input: {
    height: 38,
  }
});

const useStyles = makeStyles((theme) => styles(theme));

const Filter = ({filter, setFilterValue, onSearch, t}) => {
  const classes = useStyles();
  const [selectInputValue, setSelectInputValue] = React.useState("");

  const handleKeyPressed = (e) => {
    if (e.key === 'Enter') {
      onSearch()
      e.preventDefault();
    }
  }
  switch (filter.type) {
    case "search": {
        return (
          <FormControl className={classes.formControl}>
            <InputLabel shrink={filter.value !== ""} className={classes.searchLabel}>
              {t(filter.key)}
            </InputLabel>
            <Input
              id={filter.id}
              fullWidth={true}
              className={classes.input}
              value={filter.value}
              onKeyPress={(e) => handleKeyPressed(e)}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
            }
              endAdornment={
                filter.keyInfo ?
                  <InputAdornment position="end">
                    <Tooltip
                      arrow
                      title={t(filter.keyInfo)}
                  >
                      <InfoIcon color="action" />
                    </Tooltip>
                  </InputAdornment>
                : null
          }
              onChange={(event) => setFilterValue(filter.id, event.target.value)}
          />
          </FormControl>
        );
    }
    case "date": {
        return (
          <FormControl className={classes.formControl}>
            <KeyboardDatePicker
              id={filter.id}
              autoOk
              disableToolbar
              variant="inline"
              InputLabelProps={{
                        className: classes.label,
                        shrink: Boolean(filter.value),
                    }}
              format="DD/MM/YYYY"
              label={t(filter.key)}
              helperText=""
              InputProps={{
                className: classes.input
              }}
              value={filter.value === '' ? null : filter.value}
              onChange={(newValue) =>
                    setFilterValue(
                        filter.id, newValue ? newValue.format('MM/DD/YYYY') : null,
                    )
                }
            />

            {
                    filter.value
                    && (
                    <Tooltip
                      arrow
                      title={t("clear")}
                                >
                      <IconButton
                        color="inherit"
                        onClick={() => setFilterValue(
                                  filter.id, null,
                              )}
                        className={classes.clearDateButton}
                                >
                        <Clear color="primary" />
                      </IconButton>
                    </Tooltip>)
            }
          </FormControl>
        );
    }
    case "select":{
        let shrink = (filter.value && filter.value !== "") || selectInputValue !== "";
        if (filter.multi) {
          shrink =  filter.value && filter.value.length > 0 || selectInputValue !== ""
        }
        return (
          <FormControl className={classes.formControl}>
            <Autocomplete
              noOptionsText={t('noResult')}
              multiple={filter.multi}
              id={filter.id}
              value={filter.value}
              options={filter.options}
              getOptionLabel={(option) => option ? option.label : ""}
              defaultValue={filter.value}
              onInputChange={(event, newInputValue) => {
                setSelectInputValue(newInputValue)
              }}
              onChange={(event, newValue) => {
                setSelectInputValue("")
                setFilterValue(filter.id, newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t(filter.key)}
                  InputProps={{
                    ...params.InputProps,
                    className: classes.input
                  }}
                  InputLabelProps={{
                            className: classes.label,
                            shrink,
                        }}
                  placeholder=""
                  />
                )}
              />
          </FormControl>
        );
    }
    case "checkbox":{
        return (
          <FormControlLabel
            control={(
              <Checkbox
                color="primary"
                checked={filter.value === true}
                onChange={event => setFilterValue(filter.id, event.target.checked)}
                value={filter.value}
                  />
              )}
            label={t(filter.key)}
          />
        );
    }

    default:
        return "";
}

};

Filter.propTypes = {
  filter: PropTypes.object.isRequired,
  setFilterValue: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default withNamespaces()(Filter);
