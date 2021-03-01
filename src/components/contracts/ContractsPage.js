import React, { Component } from "react";
import MassContractUpdate from "./MassContractUpdate";
import PropTypes from "prop-types";
import { Typography, Breadcrumbs, Paper, Divider, Box } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
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

import { setIsLoading } from "../redux/actions/load";

const styles = (theme) => ({
  ...tablesStyles(theme),
  ...containersStyles(theme),
  ...mainStyles(theme),
  ...icons(theme),
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
      mode: "list",
    };
    this.handleModeChange = this.handleModeChange.bind(this);
  }

  handleModeChange() {
    const newState = {
      ...this.state,
      mode: this.state.mode == "list" ? "mass_update" : "list",
    };

    this.setState(newState);
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
    const { contracts, contractsOverlaps, filteredContracts, contractFields, mode } = this.state;
    const overlapsTotal = Object.keys(contractsOverlaps).filter((ouId) =>
      filteredContracts.find((fc) => fc.id === ouId),
    ).length;
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
            fetchContracts={() => this.fetchContracts()}
            changeTable={(key, value) => this.onTableChange(key, value)}
            contractsOverlaps={contractsOverlaps}
            setFilteredContracts={(newFilteredContracts) => this.setState({ filteredContracts: newFilteredContracts })}
            onModeChange={this.handleModeChange}
          />
          <Divider />
          {mode == "list" && (
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
                (key, value) => this.onTableChange(key, value),
                decodeTableQueryParams(location),
              )}
            />
          )}

          {mode == "mass_update" && <MassContractUpdate filteredContracts={filteredContracts} onUpdate={() => this.fetchContracts()}/>}
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
  mode: PropTypes.oneOf("list", "mass_update"),
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
  withTranslation()(withStyles(styles)(connect(MapStateToProps, MapDispatchToProps)(ContractsPage))),
);
