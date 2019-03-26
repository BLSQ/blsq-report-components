import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";
import Paper from "@material-ui/core/Paper";

import OuSelectionContainer from "./OuSelectionContainer";
import OrgUnitsGroupsForm from "./OrgUnitsGroupsForm";

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
  }
});

class MainContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedOrgUnit: undefined, groupsetInitVals: undefined };
    this.loadData = this.loadData.bind(this);
  }

  loadData = async () => {
    const rawGroupSets = await this.props.dhis2.organisationUnitGroupSets();
    const rawGroups = await this.props.dhis2.organisationUnitGroups();

    this.setState({
      organisationUnitGroupSets: rawGroupSets.organisationUnitGroupSets,
      organisationUnitGroups: rawGroups.organisationUnitGroups
    });
  };

  async componentDidMount() {
    this.loadData();
  }

  setSelectedOrgUnitGroups = selectedOrgUnit => {
    let groupsetInitVals = {};
    let orgUnitGroups = selectedOrgUnit.organisationUnitGroups.map(
      group => group.id
    );

    this.state.organisationUnitGroupSets.forEach(groupset => {
      groupsetInitVals[
        `${groupset.id}`
      ] = groupset.organisationUnitGroups
        .filter(group => orgUnitGroups.includes(group.id))
        .map(group => group.id);
    });

    this.setState({
      selectedOrgUnit: selectedOrgUnit,
      groupsetInitVals: groupsetInitVals
    });
  };

  render() {
    const { classes } = this.props;

    if (this.state.organisationUnitGroupSets === undefined) {
      return "Show loader";
    }
    return (
      <React.Fragment>
        <Paper key="main-paper" className={classes.paper}>
          <React.Fragment>
            <OuSelectionContainer
              organisationUnitGroupSets={this.state.organisationUnitGroupSets}
              organisationUnitGroups={this.state.organisationUnitGroups}
              selectedOrgUnit={this.state.selectedOrgUnit}
              setSelectedOrgUnitGroups={this.setSelectedOrgUnitGroups}
              groupsetInitVals={this.state.groupsetInitVals}
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
