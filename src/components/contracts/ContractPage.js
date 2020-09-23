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

import PluginRegistry from "../core/PluginRegistry";
import ContractsResume from "./ContractsResume";
import linksStyles from "../styles/links";
import { setIsLoading } from "../redux/actions/load";
import ContractsDialog from "./ContractsDialog";
import { getContractTableProps } from "./utils";
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
    allContracts: [],
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
  );
  const mainOrgUnit =
    mainContracts.contracts.length > 0
      ? mainContracts.contracts[0].orgUnit
      : null;
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
};

export default withRouter(withNamespaces()(ContractPage));
