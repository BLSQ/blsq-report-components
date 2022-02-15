import React, { useState, useEffect } from "react";
import MassContractUpdate from "./MassContractUpdate";
import PropTypes from "prop-types";
import { Typography, Breadcrumbs, Paper, Divider, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import PluginRegistry from "../core/PluginRegistry";

import ContractFilters from "./ContractFilters";
import ContractsResume from "./ContractsResume";

import { contractsTableColumns, contractsTableOptions } from "./config";
import { encodeTableQueryParams, decodeTableQueryParams } from "./utils/index";

import Table from "../shared/Table";

import tablesStyles from "../styles/tables";
import mainStyles from "../styles/main";
import containersStyles from "../styles/containers";
import icons from "../styles/icons";

const styles = (theme) => ({
  ...tablesStyles(theme),
  ...containersStyles(theme),
  ...mainStyles(theme),
  ...icons(theme),
});
const useStyles = makeStyles((theme) => styles(theme));

const ContractsPage = ({ t, location, history, currentUser }) => {
  const classes = useStyles();
  const contractService = PluginRegistry.extension("contracts.service");
  const [contracts, setContracts] = useState([]);
  const [finalFilteredContracts, setFinalFilteredContracts] = useState([]);
  const [contractsOverlaps, setContractsOverlaps] = useState({});
  const [contractFields, setContractFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("list");

  const computeOverlapsTotal = () => {
    return Object.keys(contractsOverlaps).filter((ouId) => contracts.find((fc) => fc.id === ouId)).length;
  };

  const handleModeChange = () => {
    setMode(mode === "list" ? "mass_update" : "list");
  };

  const fetchContracts = async () => {
    if (contractService) {
      setIsLoading(true);
      contractService.fetchContracts().then((response) => {
        const { contracts, contractsOverlaps, contractFields } = response;
        setContracts(contracts);
        setContractsOverlaps(contractsOverlaps);
        setContractFields(contractFields);
        setIsLoading(false);
      });
    }
  };

  const onTableChange = (key, value) => {
    history.push({
      pathname: location.pathname,
      search: encodeTableQueryParams(location, key, value),
    });
  };

  useEffect(() => {
    fetchContracts();
  });

  return (
    <>
      <Paper square className={classes.rootContainer}>
        <Breadcrumbs aria-label="breadcrumb">
          <Box mb={2}>
            <Typography variant="h5" component="h5" gutterBottom color="textPrimary">
              {t("contracts.title")}
            </Typography>
          </Box>
        </Breadcrumbs>
        <ContractFilters
          contractFields={contractFields}
          contracts={contracts}
          fetchContracts={() => fetchContracts()}
          changeTable={(key, value) => onTableChange(key, value)}
          contractsOverlaps={contractsOverlaps}
          setFilteredContracts={(newFilteredContracts) => setFinalFilteredContracts(newFilteredContracts)}
          onModeChange={handleModeChange}
          currentUser={currentUser}
        />
        <Divider />
        {mode === "list" && (
          <Table
            isLoading={isLoading}
            title={
              <ContractsResume
                filteredContracts={finalFilteredContracts}
                contracts={contracts}
                overlapsTotal={computeOverlapsTotal()}
              />
            }
            data={finalFilteredContracts}
            columns={contractsTableColumns(
              t,
              classes,
              finalFilteredContracts,
              contractFields,
              location,
              () => fetchContracts(),
              false,
              contracts,
            )}
            options={contractsTableOptions(
              t,
              finalFilteredContracts,
              (key, value) => onTableChange(key, value),
              decodeTableQueryParams(location),
            )}
          />
        )}

        {mode === "mass_update" && (
          <MassContractUpdate filteredContracts={finalFilteredContracts} onUpdate={() => fetchContracts()} />
        )}
      </Paper>
    </>
  );
};

export default withRouter(withTranslation()(ContractsPage));
