import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Typography,
  Breadcrumbs,
  Paper,
  Divider,
  Box,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import MUIDataTable from "mui-datatables";
import { withNamespaces } from "react-i18next";
import isEqual from "lodash/isEqual";
import { withRouter } from "react-router-dom";

import PluginRegistry from "../core/PluginRegistry";
import ContractFilters from "./ContractFilters";
import { contractsTableColumns, contractsTableOptions } from "./config";
import tablesStyles from "../styles/tables";
import containersStyles from "../styles/containers";
import LoadingSpinner from "../shared/LoadingSpinner";
import {
  toContractFields,
  toContractsById,
  toOverlappings,
  encodeTableQueryParams,
  decodeTableQueryParams,
} from "./utils";

const styles = (theme) => ({
  ...tablesStyles(theme),
  ...containersStyles(theme),
});

class ContractsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      contracts: [],
      filteredContracts: [],
      contractsById: null,
      contractsOverlaps: {},
      contractService: PluginRegistry.extension("contracts.service"),
      program: PluginRegistry.extension("contracts.program"),
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextState.filteredContracts, this.state.filteredContracts) ||
      nextState.isLoading !== this.state.isLoading
    );
  }

  setIsLoading(isLoading) {
    this.setState({
      isLoading,
    });
  }

  setContracts(data) {
    this.setState({
      ...data,
    });
  }

  onTableChange(key, value) {
    const { location, history } = this.props;
    history.push({
      pathname: location.pathname,
      search: encodeTableQueryParams(location, key, value),
    });
  }

  async fetchData() {
    const { contractService, program } = this.state;
    if (contractService && program) {
      this.setIsLoading(true);
      const contracts = await contractService.findAll();
      this.setContracts({
        contracts,
        filteredContracts: contracts,
        contractsById: toContractsById(contracts),
        contractsOverlaps: toOverlappings(contracts),
        contractFields: toContractFields(program),
      });
      this.setIsLoading(false);
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const { t, classes, location } = this.props;
    const {
      contracts,
      contractsOverlaps,
      isLoading,
      contractsById,
      filteredContracts,
    } = this.state;
    const overlapsTotal = Object.keys(contractsOverlaps).length;
    const tableTitle = (
      <span className={classes.tableTitle}>
        {filteredContracts.length === contracts.length &&
          t("contracts.results", { total: contracts.length })}
        {filteredContracts.length < contracts.length &&
          t("contracts.resultsFiltered", {
            filtered: filteredContracts.length,
            total: contracts.length,
          })}
        {overlapsTotal > 0 &&
          t("contracts.overlaps", { overlap: overlapsTotal })}
        .
      </span>
    );
    return (
      <>
        {isLoading && <LoadingSpinner />}

        <Paper square className={classes.rootContainer}>
          <Breadcrumbs aria-label="breadcrumb">
            <Box mb={2}>
              <Typography
                variant="h5"
                component="h5"
                gutterBottom
                color="textPrimary"
              >
                {t("contracts.title")}
              </Typography>
            </Box>
          </Breadcrumbs>
          {!isLoading && (
            <>
              {this.state.contractFields && (
                <ContractFilters
                  contractFields={this.state.contractFields}
                  contracts={contracts}
                  changeTable={(key, value) => this.onTableChange(key, value)}
                  contractsOverlaps={contractsOverlaps}
                  setFilteredContracts={(newFilteredContracts) =>
                    this.setState({ filteredContracts: newFilteredContracts })
                  }
                />
              )}
              <Divider />
              <MUIDataTable
                classes={{
                  paper: classes.tableContainer,
                }}
                title={contracts.length > 0 ? tableTitle : ""}
                data={filteredContracts}
                columns={contractsTableColumns(t, classes, contracts)}
                options={contractsTableOptions(
                  t,
                  contracts,
                  contractsById,
                  contractsOverlaps,
                  classes,
                  (key, value) => this.onTableChange(key, value),
                  decodeTableQueryParams(location),
                )}
              />
            </>
          )}
        </Paper>
      </>
    );
  }
}

ContractsPage.propTypes = {
  t: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(withNamespaces()(withStyles(styles)(ContractsPage)));
