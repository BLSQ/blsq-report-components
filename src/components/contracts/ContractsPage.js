import React, { useState, useEffect, useMemo } from "react";
import MassContractUpdate from "./MassContractUpdate";
import { Typography, Breadcrumbs, Paper, Divider, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { useQuery } from "react-query";

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
  const [mode, setMode] = useState("list");

  const computeOverlapsTotal = () => {
    if (contractsOverlaps) {
      return Object.keys(contractsOverlaps).filter((ouId) => contracts.find((fc) => fc.id === ouId)).length;
    }
  };

  const handleModeChange = () => {
    setMode(mode === "list" ? "mass_update" : "list");
  };

  const fetchContractsQuery = useQuery("fetchContracts", async () => {
    if (contractService) {
      const response = await contractService.fetchContracts();
      const { contracts, contractsOverlaps, contractFields } = response;
      setContractFields(contractFields);
      setContractsOverlaps(contractsOverlaps);
      setContracts(contracts);
    }
  });

  const onTableChange = (key, value) => {
    history.push({
      pathname: location.pathname,
      search: encodeTableQueryParams(location, key, value),
    });
  };

  const isLoading = fetchContractsQuery.isLoading;
  console.log("render", contracts && contracts.length);
  const tableOptions = useMemo(() => {
    console.log("contractsTableOptions")
    return contractsTableOptions(
      t,
      finalFilteredContracts,
      (key, value) => onTableChange(key, value),
      decodeTableQueryParams(location),
    );
  }, [finalFilteredContracts]);
  const cols = useMemo(() => {
    console.log("contractsTableColumns")
    return contractsTableColumns(
      t,
      classes,
      finalFilteredContracts,
      contractFields,
      location,
      () => {
        fetchContractsQuery.refetch();
      },
      false,
      false,
      contracts,
    );
  }, [contracts, finalFilteredContracts, contractFields]);
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
          fetchContracts={() => {
            fetchContractsQuery.refetch();
          }}
          changeTable={(key, value) => onTableChange(key, value)}
          contractsOverlaps={contractsOverlaps}
          setFilteredContracts={(newFilteredContracts) => setFinalFilteredContracts(newFilteredContracts)}
          onModeChange={handleModeChange}
          currentUser={currentUser}
          automaticSearch={true}
        />
        {isLoading && "Loading..."}
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
            columns={cols}
            options={tableOptions}
          />
        )}

        {mode === "mass_update" && (
          <MassContractUpdate
            filteredContracts={finalFilteredContracts}
            onUpdate={() => {
              fetchContractsQuery.refetch();
            }}
          />
        )}
      </Paper>
    </>
  );
};

export default withRouter(withTranslation()(ContractsPage));
