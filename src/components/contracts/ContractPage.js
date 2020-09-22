import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import { withNamespaces } from "react-i18next";
import { Breadcrumbs, Grid, makeStyles, Divider, Box } from "@material-ui/core";
import { Link, withRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import PluginRegistry from "../core/PluginRegistry";
import ContractsResume from "./ContractsResume";
import linksStyles from "../styles/links";
import { setIsLoading } from "../redux/actions/load";
import { contractsTableColumns, orgUnitContractTableOptions } from "./config";
import tablesStyles from "../styles/tables";
import containersStyles from "../styles/containers";

import Table from "../shared/Table";

const styles = (theme) => ({
  ...linksStyles(theme),
  ...tablesStyles(theme),
  ...containersStyles(theme),
});

const useStyles = makeStyles((theme) => styles(theme));
const ContractPage = ({ match, location, t }) => {
  const classes = useStyles();
  const isLoading = useSelector((state) => state.load.isLoading);
  const dispatch = useDispatch();
  const [contractsDatas, setContractsDatas] = useState({
    contracts: [],
    subContracts: [],
    contractsById: null,
    contractsOverlaps: {},
    contractFields: [],
  });

  const contractService = PluginRegistry.extension("contracts.service");

  const fetchContracts = () => {
    if (contractService) {
      dispatch(setIsLoading(true));
      contractService
        .fetchContracts(match.params.orgUnitId, true)
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
  const overlapsTotal = Object.keys(contractsDatas.contractsOverlaps).length;
  const options = orgUnitContractTableOptions(
    t,
    contractsDatas.contracts,
    contractsDatas.contractsById,
    contractsDatas.contractsOverlaps,
    classes,
  );
  const { contracts, subContracts } = contractsDatas;
  const columns = contractsTableColumns(
    t,
    classes,
    contracts,
    contractsDatas.contractFields,
    location,
    () => fetchContracts(),
    true,
  ).filter(
    (c) =>
      !["orgUnit.name", "fieldValues.contract_main_orgunit"].includes(c.name),
  );
  const subColumns = contractsTableColumns(
    t,
    classes,
    subContracts,
    contractsDatas.contractFields,
    location,
    () => fetchContracts(),
    true,
  ).filter((c) => !["fieldValues.contract_main_orgunit"].includes(c.name));
  return (
    <>
      <Grid container item xs={12} spacing={4}>
        <Grid container item xs={12} md={8}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link className={classes.link} to={`/contracts${location.search}`}>
              {t("contracts.title")}
            </Link>

            <Typography color="textPrimary">
              {contractsDatas.contracts && contractsDatas.contracts.length > 0
                ? contractsDatas.contracts[0].orgUnit.name
                : "..."}
            </Typography>
          </Breadcrumbs>
        </Grid>
      </Grid>
      <Box mb={4} mt={4}>
        <Typography variant="h5" component="h5" gutterBottom>
          {t("contracts.mainContracts")}
        </Typography>
        <Table
          isLoading={isLoading}
          title={
            <ContractsResume
              filteredContracts={contracts}
              contracts={contracts}
              overlapsTotal={overlapsTotal}
            />
          }
          data={contracts}
          columns={columns}
          options={options}
        />
      </Box>
      {subContracts.length > 0 && (
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
                  filteredContracts={subContracts}
                  subContracts={subContracts}
                  overlapsTotal={overlapsTotal}
                />
              }
              data={subContracts}
              columns={subColumns}
              options={options}
            />
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
};

export default withRouter(withNamespaces()(ContractPage));
