import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import { withNamespaces } from "react-i18next";
import {
  Breadcrumbs,
  Grid,
  makeStyles,
  Divider,
  Box,
  Button,
} from "@material-ui/core";
import Add from "@material-ui/icons/Add";
import { Link, withRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import PluginRegistry from "../core/PluginRegistry";
import ContractsResume from "./ContractsResume";
import { setIsLoading } from "../redux/actions/load";
import ContractsDialog from "./ContractsDialog";

import {
  getContractTableProps,
  filterItems,
  encodeFiltersQueryParams,
  decodeFiltersQueryParams,
} from "./utils";

import tablesStyles from "../styles/tables";
import icons from "../styles/icons";
import containersStyles from "../styles/containers";
import linksStyles from "../styles/links";

import Table from "../shared/Table";
import Filter from "../shared/Filter";

import filtersConfig, { activeToday } from "./filters";

const styles = (theme) => ({
  ...linksStyles(theme),
  ...tablesStyles(theme),
  ...containersStyles(theme),
  ...icons(theme),
});

const useStyles = makeStyles((theme) => styles(theme));

const ContractPage = ({ match, location, t, history }) => {
  const classes = useStyles();
  const isLoading = useSelector((state) => state.load.isLoading);
  const dispatch = useDispatch();
  const [filters, setFilters] = useState([activeToday, ...filtersConfig([])]);

  const [contractsDatas, setContractsDatas] = useState({
    allContracts: [],
    allContractsOverlaps: {},
    subContracts: {
      contracts: [],
      contractsById: null,
      contractsOverlaps: {},
    },
    mainContracts: {
      contracts: [],
      contractsById: null,
      contractsOverlaps: {},
    },
    contractFields: [],
  });

  const contractService = PluginRegistry.extension("contracts.service");

  const fetchContracts = () => {
    if (contractService) {
      dispatch(setIsLoading(true));
      contractService
        .fetchContracts(match.params.orgUnitId)
        .then((contractsDatas) => {
          setContractsDatas({
            ...contractsDatas,
          });

          dispatch(setIsLoading(false));
        });
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    // TO-DO: this can be clearly optimized !!!
    const newFilters = decodeFiltersQueryParams(location, [
      activeToday,
      ...filtersConfig(contractFields),
    ]);

    const filterActiveTodayIndex = newFilters.findIndex(
      (f) => f.id === "active_today",
    );
    const filterActiveAtIndex = newFilters.findIndex(
      (f) => f.id === "active_at",
    );
    if (
      newFilters[filterActiveTodayIndex] &&
      newFilters[filterActiveTodayIndex].value
    ) {
      if (newFilters[filterActiveAtIndex]) {
        newFilters[filterActiveAtIndex].value = moment().format("MM/DD/YYYY");
      }
    }
    if (
      newFilters[filterActiveAtIndex] &&
      newFilters[filterActiveAtIndex].value &&
      moment(newFilters[filterActiveAtIndex].value, "MM/DD/YYYY").isSame(
        moment(),
        "day",
      )
    ) {
      newFilters[filterActiveTodayIndex].value = true;
    }
    if (
      newFilters[filterActiveAtIndex] &&
      (!newFilters[filterActiveAtIndex].value ||
        newFilters[filterActiveAtIndex].value === "")
    ) {
      newFilters[filterActiveTodayIndex].value = false;
    }
    setFilters(newFilters);
    const newContractData = {
      ...contractService.computeContracts(
        filterItems(
          newFilters,
          contractsDatas.allContracts,
          contractsDatas.allContractsOverlaps,
        ),
        match.params.orgUnitId,
      ),
      allContracts: contractsDatas.allContracts,
      allContractsOverlaps: contractsDatas.allContractsOverlaps,
    };
    setContractsDatas(newContractData);
  }, [contractsDatas.allContracts]);

  const {
    allContracts,
    subContracts,
    mainContracts,
    contractFields,
  } = contractsDatas;

  const mainContractProps = getContractTableProps(
    t,
    classes,
    mainContracts,
    allContracts,
    fetchContracts,
    location,
    contractFields,
    ["orgUnit.name", "fieldValues.contract_main_orgunit"],
    false,
    false,
  );

  const subContractProps = getContractTableProps(
    t,
    classes,
    subContracts,
    allContracts,
    fetchContracts,
    location,
    contractFields,
    ["fieldValues.contract_main_orgunit"],
    true,
    false,
    true,
  );
  let mainOrgUnit;
  const tempContract = allContracts.find(
    (c) => c.orgUnit.id === match.params.orgUnitId,
  );
  if (tempContract) {
    mainOrgUnit = tempContract.orgUnit;
  }

  const setFilterValue = (filterId, value) => {
    const newFilters = [...filters];
    const filterIndex = newFilters.findIndex((f) => f.id === filterId);
    if (filterId === "active_today") {
      const filterActiveAtIndex = newFilters.findIndex(
        (f) => f.id === "active_at",
      );
      newFilters[filterActiveAtIndex].value = value
        ? moment().format("MM/DD/YYYY")
        : null;
    }
    if (filterId === "active_at") {
      const filterActiveTodayIndex = newFilters.findIndex(
        (f) => f.id === "active_today",
      );
      newFilters[filterActiveTodayIndex].value = !!(
        value && moment(value, "MM/DD/YYYY").isSame(moment(), "day")
      );
    }
    const filter = newFilters[filterIndex];
    if (filterIndex !== -1 && filter && filter.value !== value) {
      filter.value = value;
      setFilters(newFilters);
      const newContractData = {
        ...contractService.computeContracts(
          filterItems(
            newFilters,
            contractsDatas.allContracts,
            contractsDatas.allContractsOverlaps,
          ),
          match.params.orgUnitId,
        ),
        allContracts: contractsDatas.allContracts,
        allContractsOverlaps: contractsDatas.allContractsOverlaps,
      };
      setContractsDatas(newContractData);

      history.push({
        pathname: location.pathname,
        search: encodeFiltersQueryParams(location, filters),
      });
    }
  };
  return (
    <>
      <Grid container item xs={12} spacing={4}>
        <Grid container item xs={12} md={8}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link className={classes.link} to={`/contracts${location.search}`}>
              {t("contracts.title")}
            </Link>

            <Typography color="textPrimary">
              {mainOrgUnit ? mainOrgUnit.name : "..."}
            </Typography>
          </Breadcrumbs>
        </Grid>
      </Grid>
      <Box mb={3}>
        <Grid container item xs={12} spacing={4}>
          <Grid container item xs={12} md={3}>
            <Filter filter={filters[2]} setFilterValue={setFilterValue} />
          </Grid>
          <Grid container item xs={12} md={3}>
            <Filter filter={filters[0]} setFilterValue={setFilterValue} />
          </Grid>
        </Grid>
      </Box>
      <Box mb={4} mt={4}>
        <Typography variant="h5" component="h5" gutterBottom>
          {t("contracts.mainContracts")}
        </Typography>
        <Table
          isLoading={isLoading}
          title={
            <ContractsResume
              filteredContracts={mainContracts.contracts}
              contracts={mainContracts.contracts}
              overlapsTotal={mainContractProps.overlapsTotal}
            />
          }
          data={mainContracts.contracts}
          columns={mainContractProps.columns}
          options={mainContractProps.options}
        />

        <Box mt={4} pr={4} justifyContent="flex-end" display="flex">
          <ContractsDialog
            contract={{
              id: 0,
              orgUnit: mainOrgUnit,
              codes: [],
              fieldValues: { orgUnit: mainOrgUnit },
              children: null,
            }}
            contracts={allContracts}
            contractFields={contractFields}
            onSavedSuccessfull={fetchContracts}
            displayOrgUnit={false}
            displayMainOrgUnit={false}
          >
            <Button
              color="primary"
              variant="contained"
              startIcon={<Add />}
              className={classes.createButton}
            >
              {t("create")}
            </Button>
          </ContractsDialog>
        </Box>
      </Box>
      {subContracts.contracts.length > 0 && (
        <>
          <Divider />
          <Box mb={4} mt={2}>
            <Typography variant="h5" component="h5" gutterBottom>
              {t("contracts.subContracts")}
            </Typography>
            <Table
              isLoading={isLoading}
              title={
                <ContractsResume
                  filteredContracts={subContracts.contracts}
                  contracts={subContracts.contracts}
                  overlapsTotal={subContractProps.overlapsTotal}
                />
              }
              data={subContracts.contracts}
              columns={subContractProps.columns}
              options={subContractProps.options}
            />
            <Box mt={4} pr={4} justifyContent="flex-end" display="flex">
              <ContractsDialog
                contract={{
                  id: 0,
                  orgUnit: null,
                  codes: [],
                  fieldValues: {
                    contract_main_orgunit: mainOrgUnit
                      ? mainOrgUnit.id
                      : undefined,
                  },
                  children: null,
                }}
                contracts={allContracts}
                contractFields={contractFields}
                onSavedSuccessfull={fetchContracts}
                displayMainOrgUnit={false}
              >
                <Button
                  color="primary"
                  variant="contained"
                  startIcon={<Add />}
                  className={classes.createButton}
                >
                  {t("create")}
                </Button>
              </ContractsDialog>
            </Box>
          </Box>
        </>
      )}
    </>
  );
};

ContractPage.propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(withNamespaces()(ContractPage));
