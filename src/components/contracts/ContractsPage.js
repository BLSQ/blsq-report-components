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
import { withNamespaces } from "react-i18next";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import PluginRegistry from "../core/PluginRegistry";

import ContractFilters from "./ContractFilters";
import ContractsResume from "./ContractsResume";

import { contractsTableColumns, contractsTableOptions } from "./config";
import { encodeTableQueryParams, decodeTableQueryParams } from "./utils";

import Table from "../shared/Table";

import tablesStyles from "../styles/tables";
import mainStyles from "../styles/main";
import containersStyles from "../styles/containers";

import { setIsLoading } from "../redux/actions/load";

const styles = (theme) => ({
  ...tablesStyles(theme),
  ...containersStyles(theme),
  ...mainStyles(theme),
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

  async fetchContracts() {
    const { contractService } = this.state;
    const { dispatch } = this.props;
    if (contractService) {
      dispatch(setIsLoading(true));
      contractService.fetchContracts().then((contracts) => {
        this.setContracts({
          ...contracts,
        });
        dispatch(setIsLoading(false));
      });
    }
  }

  componentDidMount() {
    this.fetchContracts();
  }

  render() {
    const { t, classes, location, isLoading } = this.props;
    const {
      contracts,
      contractsOverlaps,
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
          <ContractFilters
            contractFields={contractFields}
            contracts={contracts}
            fetchContracts={() => this.fetchContracts()}
            changeTable={(key, value) => this.onTableChange(key, value)}
            contractsOverlaps={contractsOverlaps}
            setFilteredContracts={(newFilteredContracts) =>
              this.setState({ filteredContracts: newFilteredContracts })
            }
          />
          <Divider />
          <Table
            isLoading={isLoading}
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
              () => this.fetchContracts(),
              false,
              contracts,
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
  isLoading: PropTypes.bool.isRequired,
};

const MapStateToProps = (state) => ({
  currentUser: state.currentUser.profile,
  isLoading: state.load.isLoading,
  drawerOpen: state.drawer.isOpen,
  period: state.period.current,
});

const MapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default withRouter(
  withNamespaces()(
    withStyles(styles)(
      connect(MapStateToProps, MapDispatchToProps)(ContractsPage),
    ),
  ),
);
