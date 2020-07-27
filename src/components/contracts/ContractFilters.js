import React from "react";
import PropTypes from "prop-types";
import { withNamespaces } from "react-i18next";
import moment from 'moment'

import {
    Box,
    Grid,
    Button,
} from "@material-ui/core";

import Filter from "../shared/Filter"
import filtersConfig from "./filters";
import { filterItems } from "./utils";


const ContractFilters = ({setFilteredContracts, t, contracts, contractsOverlaps}) => {
  const [filters, setFilters] = React.useState(filtersConfig);
  const [isTouched, setIsTouched] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);


  const checkErrors = () => {
    setHasError(false)
    filters.forEach(f => {
      if (f.type === "date" && f.value && !moment(f.value).isValid() && !hasError) {
        setHasError(true)
      }
    })
  }
  const setFilterValue = (filterId, value) => {
    const newFilters = [...filters]
    const filterIndex = newFilters.findIndex(f => f.id === filterId)
    const filter = newFilters[filterIndex]
    if (filterIndex !== -1 && filter && filter.value !== value) {
      filter.value = value
      setFilters(newFilters)
      setIsTouched(true)
      checkErrors()
    }
  }

  const handleSearch = () => {
    setIsTouched(false)
    setFilteredContracts(filterItems(filters, contracts, contractsOverlaps))
  }
  return (
    <Box mb={3}>
      <Grid container item xs={12} spacing={4}>
        {
          [1, 2, 3, 4].map((column) => (
            <Grid container item xs={12} md={3} key={`column-${column}`}
              alignItems="center">
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
            disabled={!isTouched || hasError}
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
  contractsOverlaps: PropTypes.object.isRequired,
  setFilteredContracts: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withNamespaces()(ContractFilters);
