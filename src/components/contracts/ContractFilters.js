import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withTranslation } from "react-i18next";
import moment from "moment";

import { Box, Grid, Button, makeStyles } from "@material-ui/core";
import Add from "@material-ui/icons/Add";

import Filter from "../shared/Filter";
import filtersConfig, { columnsCount } from "./filters";

import ContractsDialog from "./ContractsDialog";

import { filterItems, encodeFiltersQueryParams, decodeFiltersQueryParams } from "./utils/filtersUtils";

const styles = (theme) => ({
  createButton: {
    marginRight: theme.spacing(2),
  },
});

const useStyles = makeStyles((theme) => styles(theme));

const ContractFilters = ({
  setFilteredContracts,
  t,
  contractFields,
  contracts,
  contractsOverlaps,
  history,
  location,
  changeTable,
  fetchContracts,
  onModeChange,
}) => {
  const [filters, setFilters] = React.useState(filtersConfig(contractFields));
  const [isTouched, setIsTouched] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const classes = useStyles();
  useEffect(() => {
    const newFilters = decodeFiltersQueryParams(location, filtersConfig(contractFields));
    const filteredContracts = filterItems(newFilters, contracts, contractsOverlaps);
    setFilteredContracts(filteredContracts);
    setFilters(newFilters);
  }, [contracts]);

  const checkErrors = () => {
    setHasError(false);
    filters.forEach((f) => {
      if (f.type === "date" && f.value && !moment(f.value).isValid() && !hasError) {
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
            <Grid container item xs={12} md={3} key={`column-${column}`}>
              {filters
                .filter((f) => f.column === column)
                .map((filter) => (
                  <Filter key={filter.key} filter={filter} onSearch={handleSearch} setFilterValue={setFilterValue} />
                ))}
            </Grid>
          ))}
      </Grid>
      <Grid container item xs={12} spacing={4}>
        <Grid container item xs={12} justify="flex-end">
          <ContractsDialog
            contract={{
              id: 0,
              orgUnit: null,
              codes: [],
              fieldValues: {},
              children: null,
            }}
            contracts={contracts}
            contractFields={contractFields}
            onSavedSuccessfull={fetchContracts}
          >
            <Button color="primary" variant="contained" startIcon={<Add />} className={classes.createButton}>
              {t("create")}
            </Button>
          </ContractsDialog>
          <Button onClick={onModeChange} color="primary" variant="contained" className={classes.createButton}>
            {t("contracts.massUpdate")}
          </Button>

          <Button onClick={handleSearch} color="primary" variant="contained" disabled={!isTouched || hasError}>
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
  fetchContracts: PropTypes.func.isRequired,
  onModeChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withRouter(withTranslation()(ContractFilters));
