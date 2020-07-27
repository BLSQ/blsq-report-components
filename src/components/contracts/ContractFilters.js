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
  console.log('new Array(4)', new Array(4))
  return (
    <Box mb={3}>
      <Grid container item xs={12} spacing={4}>
        {
          [1, 2, 3, 4].map((column) => (
            <Grid item xs={12} md={3} key={`column-${column}`}>
              {
                filters.filter(f => f.column === column).map(filter => (
                  <Filter
                    key={filter.key}
                    filter={filter}
                    onSearch={handleSearch}
                    setFilterValue={setFilterValue}
                  />
                ))
              }
            </Grid>
          ))}
      </Grid>
      <Grid container item xs={12} spacing={4}>
        <Grid container item xs={12} justify="flex-end">
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
