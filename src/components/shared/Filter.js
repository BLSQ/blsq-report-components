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
} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from "@material-ui/icons/Search";
import InfoIcon from '@material-ui/icons/Info';
import Clear from '@material-ui/icons/Clear';
import { KeyboardDatePicker } from '@material-ui/pickers';


const styles = theme => ({
  formControl: {
    width: "100%"
  },
  searchLabel: {
      paddingLeft: theme.spacing(4)
  },
  clearDateButton: {
      marginRight: theme.spacing(2),
      padding: 0,
      position: 'absolute',
      right: theme.spacing(5),
      top: 20
  }
});

const useStyles = makeStyles((theme) => styles(theme));

const Filter = ({filter, setFilterValue, onSearch, t}) => {
  const classes = useStyles();

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
              onChange={(event) => setFilterValue(0, event.target.value)}
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
                        shrink: Boolean(filter.value),
                    }}
              format="DD/MM/yyyy"
              label={t(filter.key)}
              helperText=""
              value={filter.value === '' ? null : filter.value}
              onChange={(newValue) =>
                    setFilterValue(
                        1, newValue,
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
                                  1, null,
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

    default:
        return '';
}

};

Filter.propTypes = {
  filter: PropTypes.object.isRequired,
  setFilterValue: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default withNamespaces()(Filter);
