import React, { useState, useEffect } from "react";
import AssignmentIcon from "@material-ui/icons/Assignment";
import DatePeriods from "../../support/DatePeriods";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import { withTranslation } from "react-i18next";
import { Breadcrumbs, Grid, makeStyles, Divider, Box, Button } from "@material-ui/core";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import Add from "@material-ui/icons/Add";
import { Link, withRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import PluginRegistry from "../core/PluginRegistry";
import ContractsResume from "./ContractsResume";
import { setIsLoading } from "../redux/actions/load";
import ContractsDialog from "./ContractsDialog";
import _ from "lodash";
import {
  getContractTableProps,
  detailInitialState,
  getMainOrgUnit,
  defaultContract,
  findLastContract,
} from "./utils/index";
import {
  filterItems,
  encodeFiltersQueryParams,
  decodeFiltersQueryParams,
  updateFilters,
  getFilterValueById,
  checkFilters,
} from "./utils/filtersUtils";
import { isToday } from "./utils/periodsUtils";
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
  wrapIcon: {
    fontFamily: "monospace",
    color: "#266696",
  },
});
const useStyles = makeStyles((theme) => styles(theme));

const ContractPage = ({ match, location, t, history }) => {
  const classes = useStyles();
  const isLoading = useSelector((state) => state.load.isLoading);
  const dispatch = useDispatch();
  const dhis2 = useSelector((state) => state.dhis2.support);
  const [orgUnit, setOrgUnit] = useState(undefined);
  const [filters, setFilters] = useState([activeToday, ...filtersConfig([])]);
  const [contractsDatas, setContractsDatas] = useState(detailInitialState);
  const contractService = PluginRegistry.extension("contracts.service");
  let [previousDefaultMainContract, setPreviousDefaultMainContract] = useState(undefined);

  const fetchContracts = () => {
    if (contractService) {
      dispatch(setIsLoading(true));
      contractService.fetchContracts(match.params.orgUnitId).then((contractsDatas) => {
        setContractsDatas({
          ...contractsDatas,
        });
        const previous = findLastContract(contractsDatas.mainContracts.contracts);
        if (previous) {
          setPreviousDefaultMainContract({ ...previous });
        }
        dispatch(setIsLoading(false));
      });
    }
  };

  const fetchOrgUnit = () => {
    dhis2
      .api()
      .then((api) =>
        api.get("organisationUnits/" + match.params.orgUnitId, {
          fields: "[*],ancestors[id,name],organisationUnitGroups[id,name,code]",
        }),
      )
      .then((org) => setOrgUnit(org));
  };
  const { allContracts, subContracts, mainContracts, contractFields } = contractsDatas;
  const subcontractField = contractFields.find((f) => f.code == "contract_main_orgunit");
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
  const mainOrgUnit = getMainOrgUnit(allContracts, match.params.orgUnitId);

  useEffect(() => {
    fetchOrgUnit();
    fetchContracts();
  }, []);

  useEffect(() => {
    let newFilters = decodeFiltersQueryParams(location, [activeToday, ...filtersConfig(contractFields)]);
    newFilters = checkFilters(newFilters);
    setFilters(newFilters);
    const newContractData = {
      ...contractService.computeContracts(
        filterItems(newFilters, contractsDatas.allContracts, contractsDatas.allContractsOverlaps),
        match.params.orgUnitId,
      ),
      allContracts: contractsDatas.allContracts,
      allContractsOverlaps: contractsDatas.allContractsOverlaps,
    };
    setContractsDatas(newContractData);
  }, [contractsDatas.allContracts]);

  const setFilterValue = (filterId, value) => {
    let newFilters = [...filters];
    if (filterId === "active_today") {
      newFilters = updateFilters(value ? moment().format("MM/DD/YYYY") : null, "active_at", newFilters);
    }
    if (filterId === "active_at") {
      newFilters = updateFilters(!!(value && isToday(value)), "active_today", newFilters);
    }
    const filterValue = getFilterValueById(filterId, newFilters);
    if ((filterValue && filterValue !== value) || !filterValue) {
      newFilters = updateFilters(value, filterId, newFilters);
      setFilters(newFilters);
      const newContractData = {
        ...contractService.computeContracts(
          filterItems(newFilters, contractsDatas.allContracts, contractsDatas.allContractsOverlaps),
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

            <Typography color="textPrimary" variant="h5" component="h5" gutterBottom>{orgUnit ? orgUnit.name : "..."}</Typography>
          </Breadcrumbs>
        </Grid>
      </Grid>
      <Box mb={3}>
        <br />
        <Grid container direction="row" alignItems="center">
          <LocationOnIcon color="secondary" />
          &nbsp;
          <Typography className={classes.wrapIcon} color="secondary">
            {orgUnit &&
              orgUnit.ancestors.slice(1).map((a, index) => (
                <span>
                  <a href={"./index.html#/contracts?under_orgunit=" + a.id}>{a.name}</a>
                  {index + 1 < orgUnit.ancestors.length - 1 && " > "}
                </span>
              ))}
          </Typography>
          {orgUnit && (
            <Button
              color="primary"
              startIcon={<AssignmentIcon />}
              title={t("dataEntry.dataEntries")}
              href={"./index.html#/dataEntry/" + orgUnit.id + "/" + DatePeriods.currentQuarter()}
            />
          )}
        </Grid>
      </Box>
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

        {orgUnit && (
          <Box mt={4} pr={4} justifyContent="flex-end" display="flex">
            <ContractsDialog
              contract={previousDefaultMainContract || defaultContract({ orgUnit: orgUnit })}
              contracts={allContracts}
              contractFields={contractFields}
              onSavedSuccessfull={fetchContracts}
              displayOrgUnit={false}
              displayMainOrgUnit={false}
            >
              <Button color="primary" variant="contained" startIcon={<Add />} className={classes.createButton}>
                {t("create")}
              </Button>
            </ContractsDialog>
          </Box>
        )}
      </Box>
      {/* show the sub contract create button if orgunit has at least one contract */}
      {subcontractField && mainContracts.contracts.length > 0 && (
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
                contract={defaultContract({
                  contract_main_orgunit: mainOrgUnit || undefined,
                })}
                contracts={allContracts}
                contractFields={contractFields}
                onSavedSuccessfull={fetchContracts}
                displayMainOrgUnit={false}
              >
                <Button color="primary" variant="contained" startIcon={<Add />} className={classes.createButton}>
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

export default withRouter(withTranslation()(ContractPage));
