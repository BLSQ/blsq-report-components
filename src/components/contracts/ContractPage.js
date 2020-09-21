import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import { withNamespaces } from "react-i18next";
import MUIDataTable from "mui-datatables";
import { Breadcrumbs, Grid, makeStyles } from "@material-ui/core";
import { Link, withRouter } from "react-router-dom";
import { useDispatch } from "react-redux";

import PluginRegistry from "../core/PluginRegistry";
import ContractsResume from "./ContractsResume";
import ContractCard from "./ContractCard";
import linksStyles from "../styles/links";
import { setIsLoading } from "../redux/actions/load";
import { contractsTableColumns, contractsTableOptions } from "./config";
import { encodeTableQueryParams, decodeTableQueryParams } from "./utils";
import tablesStyles from "../styles/tables";
import containersStyles from "../styles/containers";

const styles = (theme) => ({
  ...linksStyles(theme),
  ...tablesStyles(theme),
  ...containersStyles(theme),
});

const useStyles = makeStyles((theme) => styles(theme));
const ContractPage = ({ match, location, t }) => {
  const classes = useStyles();
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
        <Grid container item xs={12} md={4} justify="flex-end">
          <ContractsResume
            filteredContracts={contractsDatas.contracts}
            contracts={contractsDatas.contracts}
            overlapsTotal={overlapsTotal}
          />
        </Grid>
      </Grid>

      <MUIDataTable
        classes={{
          paper: classes.tableContainer,
        }}
        title={
          <ContractsResume
            filteredContracts={contractsDatas.contracts}
            contracts={contractsDatas.contracts}
            overlapsTotal={overlapsTotal}
          />
        }
        data={contractsDatas.contracts}
        columns={contractsTableColumns(
          t,
          classes,
          contractsDatas.contracts,
          contractsDatas.contractFields,
          location,
          () => this.fetchContracts(),
        )}
        options={contractsTableOptions(
          t,
          contractsDatas.contracts,
          contractsDatas.contractsById,
          contractsDatas.contractsOverlaps,
          classes,
          (key, value) => this.onTableChange(key, value),
          decodeTableQueryParams(location),
        )}
      />
      <MUIDataTable
        classes={{
          paper: classes.tableContainer,
        }}
        title={
          <ContractsResume
            filteredContracts={contractsDatas.subContracts}
            contracts={contractsDatas.subContracts}
            overlapsTotal={overlapsTotal}
          />
        }
        data={contractsDatas.subContracts}
        columns={contractsTableColumns(
          t,
          classes,
          contractsDatas.subContracts,
          contractsDatas.contractFields,
          location,
          () => this.fetchContracts(),
        )}
        options={contractsTableOptions(
          t,
          contractsDatas.subContracts,
          contractsDatas.contractsById,
          contractsDatas.contractsOverlaps,
          classes,
          (key, value) => this.onTableChange(key, value),
          decodeTableQueryParams(location),
        )}
      />
    </>
  );
};

ContractPage.propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withRouter(withNamespaces()(ContractPage));
