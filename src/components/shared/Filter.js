import React from "react";
import PropTypes from "prop-types";
import { withNamespaces } from "react-i18next";

import {
    FormControl,
    Input,
    InputAdornment,
    Tooltip,
    InputLabel,
} from "@material-ui/core";
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from "@material-ui/icons/Search";
import InfoIcon from '@material-ui/icons/Info';
import EventIcon from '@material-ui/icons/Event';
import { DatePicker } from '@material-ui/pickers';


const styles = theme => ({
  formControl: {
    width: "100%"
  },
  label: {
      color: 'black',
  },
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
            <InputLabel className={classes.label}>
              {t(filter.key)}
            </InputLabel>
            <Input
              fullWidth={true}
              value={filter.value}
              onKeyPress={(e) => handleKeyPressed(e)}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
            }
              endAdornment={
                filter.keyInfo ?
                  <InputAdornment position="end">
                    <Tooltip
                      arrow
                      title={t(filter.keyInfo)}
                  >
                      <InfoIcon color="primary" />
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
            <DatePicker
              autoOk
              disableToolbar
              InputLabelProps={{
                        className: classes.label,
                        shrink: filter.value !== '',
                    }}
              InputProps={{
              endAdornment:(
                <InputAdornment position="end">
                  <EventIcon color="primary" />
                </InputAdornment>)
            }}
              variant="inline"
              format="DD/MM/yyyy"
              label={t(filter.key)}
              value={filter.value}
              onChange={(newValue) =>
                        setFilterValue(
                            1, moment(newValue).format('yyyy/MM/DD'),
                        )
                    }
                />
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
