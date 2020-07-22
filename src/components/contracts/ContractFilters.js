import React from "react";
import PropTypes from "prop-types";
import { withNamespaces } from "react-i18next";

import {
    FormControl,
    Input,
    InputAdornment,
    Box,
    Grid,
    Button,
    Tooltip,
} from "@material-ui/core";
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from "@material-ui/icons/Search";
import InfoIcon from '@material-ui/icons/Info';
import { DatePicker } from '@material-ui/pickers';

const styles = {
  formControl: {
    width: "100%"
  },
};

const useStyles = makeStyles(() => styles);

const ContractFilters = ({filter, setFilter, t}) => {
  const classes = useStyles();
  const [search, setSearch] = React.useState(undefined);
  const [date, setDate] = React.useState(new Date());
  const handleKeyPressed = (e) => {
    if (e.key === 'Enter') {
      setFilter(search)
      e.preventDefault();
    }
  }
  return (
    <Box mb={3}>
      <Grid container item xs={12}>
        <Grid item xs={12} md={3}>
          <FormControl className={classes.formControl}>
            <Input
              id="input-with-icon-adornment"
              fullWidth={true}
              onKeyPress={(e) => handleKeyPressed(e)}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
            }
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    arrow
                    title={t('contracts.searchInfos')}
                  >
                    <InfoIcon color="primary" />
                  </Tooltip>
                </InputAdornment>
          }
              value={search}
              onChange={(event) => setSearch(event.target.value)}
          />
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3} >

          <DatePicker
            autoOk
            // error={error && blur}
            disableToolbar
            InputLabelProps={{
                        className: classes.label,
                        shrink: date !== '',
                    }}
            variant="inline"
            format="DD/MM/yyyy"
            label="LABEL"
            value={date === '' ? null : date}
            onChange={(newValue) =>
                        setDate(
                            moment(newValue).format('yyyy/MM/DD'),
                        )
                    }
            // onBlur={() => handleBlur(key)}
                />
        </Grid>
        <Grid item xs={12} md={3} />
        <Grid container item xs={12} md={3} justify="flex-end">
          <Button
            onClick={() => setFilter(search)}
            color="primary"
            variant="contained"
            disabled={false}
        >
            {t('filter')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

ContractFilters.defaultProps = {
    filter: '',
  };

ContractFilters.propTypes = {
    filter: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

export default withNamespaces()(ContractFilters);
