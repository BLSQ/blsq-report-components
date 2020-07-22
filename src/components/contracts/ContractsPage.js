import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Typography,
  Breadcrumbs,
  Paper,
  Divider,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import MUIDataTable from "mui-datatables";
import { withNamespaces } from 'react-i18next';

import PluginRegistry from "../core/PluginRegistry";
import ContractFilters from "./ContractFilters";
import { contractsColumns, contractsOptions } from "./config";
import tablesStyles from "../styles/tables";
import containersStyles from "../styles/containers";
import LoadingSpinner from "../shared/LoadingSpinner";
import { toContractsById, toOverlappings, getFilteredContracts } from "./utils";

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
      contractsById: null,
      contractsOverlaps: {},
      filter: undefined,
      contractService: PluginRegistry.extension("contracts.service"),
    };
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
    const { contracts, filter, contractsOverlaps, isLoading, contractsById } = this.state;
    const filteredContracts = getFilteredContracts(filter, contracts, contractsOverlaps);
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
    return (
      <>
        {
            isLoading
            && <LoadingSpinner />
        }
        <Paper square className={classes.rootContainer}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography variant="h5" component="h5" gutterBottom  color="textPrimary">
              {t("contracts.title")}
            </Typography>
          </Breadcrumbs>
          <ContractFilters
            filter={filter}
            setFilter={(filter) => this.setState({filter})}
            />
          <Divider />
          {
              !isLoading
              && (
                <MUIDataTable
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
