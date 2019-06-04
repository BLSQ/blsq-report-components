import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";
import Paper from "@material-ui/core/Paper";
import Loader from "../shared/Loader";
import OuSelectionContainer from "./OuSelectionContainer";

const styles = theme => ({
  paper: {
    marginBottom: theme.spacing.unit * 3,
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
      marginBottom: theme.spacing.unit * 6,
      padding: theme.spacing.unit * 3
    }
  },
  filters: {
    marginLeft: "30px"
  },
  error: {
    color: "red"
  }
});

class MainContainer extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      organisationUnitGroupSets: undefined,
      organisationUnitGroups: undefined,
      otherOrgUnitGroups: undefined,
      selectedOrgUnit: undefined,
      groupsetInitVals: undefined
    };
    this.reloadGroups = this.reloadGroups.bind(this);
  }

  async reloadGroups() {
    const rawGroupSets = await this.props.dhis2.organisationUnitGroupSets();
    const rawGroups = await this.props.dhis2.organisationUnitGroups();
    const otherOrgUnitGroups = rawGroups.organisationUnitGroups.filter(
      group => group.groupSets.length === 0
    );

    this.setState({
      organisationUnitGroupSets: rawGroupSets.organisationUnitGroupSets,
      organisationUnitGroups: rawGroups.organisationUnitGroups,
      otherOrgUnitGroups: otherOrgUnitGroups
    });
  }

  async componentDidMount() {
    this._isMounted = true;

    const rawGroupSets = await this.props.dhis2.organisationUnitGroupSets();
    const rawGroups = await this.props.dhis2.organisationUnitGroups();
    const otherOrgUnitGroups = rawGroups.organisationUnitGroups.filter(
      group => group.groupSets.length === 0
    );

    this._isMounted &&
      this.setState({
        organisationUnitGroupSets: rawGroupSets.organisationUnitGroupSets,
        organisationUnitGroups: rawGroups.organisationUnitGroups,
        otherOrgUnitGroups: otherOrgUnitGroups
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  setSelectedOrgUnitGroups = selectedOrgUnit => {
    let groupsetInitVals = {};
    let orgUnitGroups = selectedOrgUnit.organisationUnitGroups.map(
      group => group.id
    );

    this.state.organisationUnitGroupSets.forEach(groupset => {
      groupset.id !== this.props.contractSettings.primaryFlagGroupSet &&
        (groupsetInitVals[groupset.id] = groupset.organisationUnitGroups
          .filter(group => orgUnitGroups.includes(group.id))
          .map(group => group.id));
    });
    groupsetInitVals["othergroups"] = this.state.otherOrgUnitGroups
      .filter(group => orgUnitGroups.includes(group.id))
      .map(group => group.id);

    this.setState({
      selectedOrgUnit: selectedOrgUnit,
      groupsetInitVals: groupsetInitVals
    });
  };

  render() {
    const { classes } = this.props;

    if (this.state.organisationUnitGroupSets === undefined) {
      return <Loader />;
    }

    return (
      <React.Fragment>
        <Paper key="main-paper" className={classes.paper}>
          <React.Fragment>
            <OuSelectionContainer
              organisationUnitGroupSets={this.state.organisationUnitGroupSets}
              organisationUnitGroups={this.state.organisationUnitGroups}
              otherOrgUnitGroups={this.state.otherOrgUnitGroups}
              selectedOrgUnit={this.state.selectedOrgUnit}
              setSelectedOrgUnitGroups={this.setSelectedOrgUnitGroups}
              groupsetInitVals={this.state.groupsetInitVals}
              reloadGroupsFn={this.reloadGroups}
              {...this.props}
            />
          </React.Fragment>
        </Paper>
      </React.Fragment>
    );
  }
}

MainContainer.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(withNamespaces()(MainContainer));
