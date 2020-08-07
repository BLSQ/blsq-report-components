import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withNamespaces } from "react-i18next";
import moment from "moment";

import { Box, Grid, Button } from "@material-ui/core";

import Filter from "../shared/Filter";
import filtersConfig, { columnsCount } from "./filters";
import {
  filterItems,
  encodeFiltersQueryParams,
  decodeFiltersQueryParams,
} from "./utils";

const ContractFilters = ({
  setFilteredContracts,
  t,
  contractFields,
  contracts,
  contractsOverlaps,
  history,
  location,
  changeTable,
}) => {
  const [filters, setFilters] = React.useState(filtersConfig(contractFields));
  const [isTouched, setIsTouched] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  useEffect(() => {
    const newFilters = decodeFiltersQueryParams(location, filters);
    const filteredContracts = filterItems(
      newFilters,
      contracts,
      contractsOverlaps,
    );
    setFilteredContracts(filteredContracts);
    setFilters(newFilters);
  }, []);

  const checkErrors = () => {
    setHasError(false);
    filters.forEach((f) => {
      if (
        f.type === "date" &&
        f.value &&
        !moment(f.value).isValid() &&
        !hasError
      ) {
        setHasError(true);
      }
    });
  };

  const setFilterValue = (filterId, value) => {
    const newFilters = [...filters];
    const filterIndex = newFilters.findIndex((f) => f.id === filterId);
    const filter = newFilters[filterIndex];

    if (filterIndex !== -1 && filter && filter.value !== value) {
      filter.value = value;
      setFilters(newFilters);
      setIsTouched(true);
      checkErrors();
      history.push({
        pathname: location.pathname,
        search: encodeFiltersQueryParams(location, filters),
      });
    }
  };

  const handleSearch = () => {
    setIsTouched(false);
    setFilteredContracts(filterItems(filters, contracts, contractsOverlaps));
    changeTable("page", 0);
  };
  return (
    <Box mb={3}>
      <Grid container item xs={12} spacing={4}>
        {Array(columnsCount)
          .fill()
          .map((x, i) => i + 1)
          .map((column) => (
            <Grid
              container
              item
              xs={12}
              md={3}
              key={`column-${column}`}
              // alignItems="center"
            >
              {filters
                .filter((f) => f.column === column)
                .map((filter) => (
                  <Filter
                    key={filter.key}
                    filter={filter}
                    onSearch={handleSearch}
                    setFilterValue={setFilterValue}
                  />
                ))}
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
            {t("filter")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

ContractFilters.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  contractFields: PropTypes.array.isRequired,
  contracts: PropTypes.array.isRequired,
  contractsOverlaps: PropTypes.object.isRequired,
  setFilteredContracts: PropTypes.func.isRequired,
  changeTable: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withRouter(withNamespaces()(ContractFilters));
