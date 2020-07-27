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
import { withNamespaces } from 'react-i18next';
import isEqual from "lodash/isEqual";

import PluginRegistry from "../core/PluginRegistry";
import ContractFilters from "./ContractFilters";
import { contractsColumns, contractsOptions } from "./config";
import tablesStyles from "../styles/tables";
import containersStyles from "../styles/containers";
import LoadingSpinner from "../shared/LoadingSpinner";
import { toContractsById, toOverlappings } from "./utils";

const styles = theme => ({
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
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(nextState.filteredContracts, this.state.filteredContracts)
      || (nextState.isLoading !== this.state.isLoading)
  }

  setIsLoading(isLoading) {
    this.setState({
      isLoading,
    })
  }

  setContracts(data) {
    this.setState({
      ...data,
    })
  }

  async fetchData() {
    const { contractService } = this.state;
    if (contractService) {
      this.setIsLoading(true);
      const contracts = await contractService.findAll();
      this.setContracts({
        contracts,
        filteredContracts: contracts,
        contractsById: toContractsById(contracts),
        contractsOverlaps: toOverlappings(contracts),
      })
      this.setIsLoading(false);
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const { t, classes } = this.props;
    const { contracts, contractsOverlaps, isLoading, contractsById, filteredContracts } = this.state;
    const overlapsTotal = Object.keys(contractsOverlaps).length;
    const tableTitle = (
      <span className={classes.tableTitle}>
        {
        filteredContracts.length === contracts.length
        && t("contracts.results", { total: contracts.length })
      }
        {
        filteredContracts.length < contracts.length
        && t(
          "contracts.resultsFiltered",
          {
            filtered: filteredContracts.length,
            total: contracts.length,
          },
        )
      }
        {
        overlapsTotal > 0
        && t("contracts.overlaps", { overlap: overlapsTotal })
      }.
      </span>
    )
    console.log('filteredContracts', filteredContracts)
    return (
      <>
        {
            isLoading
            && <LoadingSpinner />
        }
        <Paper square className={classes.rootContainer}>
          <Breadcrumbs aria-label="breadcrumb">
            <Box mb={2}>
              <Typography variant="h5" component="h5" gutterBottom  color="textPrimary">
                {t("contracts.title")}
              </Typography>
            </Box>
          </Breadcrumbs>
          <ContractFilters
            contracts={contracts}
            contractsOverlaps={contractsOverlaps}
            setFilteredContracts={newFilteredContracts => this.setState({filteredContracts: newFilteredContracts})}
            />
          <Divider />
          {
              !isLoading
              && (
                <MUIDataTable
                  selectableRows="none"
                  selectableRowsHideCheckboxes={true}
                  classes={{
                      paper: classes.tableContainer,
                  }}
                  title={contracts.length > 0 ? tableTitle : ''}
                  data={filteredContracts}
                  columns={contractsColumns(t, classes, contracts)}
                  options={contractsOptions(t, contracts, contractsById, contractsOverlaps, classes)}
                  />
              )
          }
        </Paper>
      </>
    );
  };
};

ContractsPage.propTypes = {
  t: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withNamespaces()(withStyles(styles)(ContractsPage));
