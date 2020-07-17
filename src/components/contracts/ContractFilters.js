import React from "react";
import PropTypes from "prop-types";

import {
    FormControl,
    Input,
    Typography,
    InputAdornment,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

const ContractFilters = ({filter, setFilter}) => (
  <>
    <FormControl>
      <Input
        id="input-with-icon-adornment"
        fullWidth={true}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
          }
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        />
    </FormControl>
    <Typography fontWeight="fontWeightLight">
      Filter on name, contract codes, periods or type "overlaps"
    </Typography>
  </>
);

ContractFilters.defaultProps = {
    filter: '',
  };

ContractFilters.propTypes = {
    filter: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
  };

export default ContractFilters;
