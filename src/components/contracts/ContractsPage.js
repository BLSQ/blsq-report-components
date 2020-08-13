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
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import PluginRegistry from "../core/PluginRegistry";

import ContractFilters from "./ContractFilters";
import ContractsResume from "./ContractsResume";

import { contractsTableColumns, contractsTableOptions } from "./config";
import { encodeTableQueryParams, decodeTableQueryParams } from "./utils";

import tablesStyles from "../styles/tables";
import containersStyles from "../styles/containers";

import { setIsLoading } from "../redux/actions/load";

const styles = (theme) => ({
  ...tablesStyles(theme),
  ...containersStyles(theme),
});

class ContractsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: [],
      filteredContracts: [],
      contractsById: null,
      contractsOverlaps: {},
      contractService: PluginRegistry.extension("contracts.service"),
      contractFields: [],
    };
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
    const { contractService } = this.state;
    const { dispatch } = this.props;
    if (contractService) {
      dispatch(setIsLoading(true));
      contractService.fetchContracts().then((contracts) => {
        dispatch(setIsLoading(false));
        this.setContracts({
          ...contracts,
        });
      });
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
      contractFields,
    } = this.state;
    const overlapsTotal = Object.keys(contractsOverlaps).length;
    return (
      <>
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
              <ContractFilters
                contractFields={contractFields}
                contracts={contracts}
                changeTable={(key, value) => this.onTableChange(key, value)}
                contractsOverlaps={contractsOverlaps}
                setFilteredContracts={(newFilteredContracts) =>
                  this.setState({ filteredContracts: newFilteredContracts })
                }
              />
              <Divider />
              <MUIDataTable
                classes={{
                  paper: classes.tableContainer,
                }}
                title={
                  <ContractsResume
                    filteredContracts={filteredContracts}
                    contracts={contracts}
                    overlapsTotal={overlapsTotal}
                  />
                }
                data={filteredContracts}
                columns={contractsTableColumns(
                  t,
                  classes,
                  filteredContracts,
                  contractFields,
                  location,
                )}
                options={contractsTableOptions(
                  t,
                  filteredContracts,
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
  dispatch: PropTypes.func.isRequired,
};

const MapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default withRouter(
  withNamespaces()(
    withStyles(styles)(connect(() => ({}), MapDispatchToProps)(ContractsPage)),
  ),
);
