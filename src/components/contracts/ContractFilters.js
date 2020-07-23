import React from "react";
import PropTypes from "prop-types";
import { withNamespaces } from "react-i18next";

import {
    Box,
    Grid,
    Button,
} from "@material-ui/core";

import Filter from "../shared/Filter"
import filtersConfig from "./filters";
import { filterItems } from "./utils";


const ContractFilters = ({setFilteredContracts, t, contracts}) => {
  const [filters, setFilters] = React.useState(filtersConfig);
  const [isTouched, setIsTouched] = React.useState(false);
  const setFilterValue = (index, value) => {
    const newFilters = [...filters]
    if (newFilters[index].value !== value) {
      newFilters[index].value = value
      setFilters(newFilters)
      setIsTouched(true)
    }
  }

  const handleSearch = () => {
    setIsTouched(false)
    setFilteredContracts(filterItems(filters, contracts))
  }

  return (
    <Box mb={3}>
      <Grid container item xs={12} spacing={4}>
        <Grid item xs={12} md={3}>
          {
            filters.filter(f => f.column === 1).map(filter => (
              <Filter
                key={filter.key}
                filter={filter}
                onSearch={handleSearch}
                setFilterValue={setFilterValue}
              />
            ))
          }
        </Grid>

        <Grid item xs={12} md={3} >

          {
            filters.filter(f => f.column === 2).map(filter => (
              <Filter
                key={filter.key}
                filter={filter}
                onSearch={handleSearch}
                setFilterValue={setFilterValue}
              />
            ))
          }
        </Grid>
        <Grid item xs={12} md={3} />
        <Grid container item xs={12} md={3} justify="flex-end">
          <Button
            onClick={handleSearch}
            color="primary"
            variant="contained"
            disabled={!isTouched}
        >
            {t('filter')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

ContractFilters.propTypes = {
  contracts: PropTypes.array.isRequired,
  setFilteredContracts: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withNamespaces()(ContractFilters);
