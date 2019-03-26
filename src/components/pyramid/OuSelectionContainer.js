import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";
import Table from "@material-ui/core/Table";
import LinearProgress from "@material-ui/core/LinearProgress";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import OrgUnitAutoComplete from "../invoices/OrgUnitAutoComplete";
import OuPicker from "../invoices/OuPicker";
import OrgUnitsGroupsForm from "./OrgUnitsGroupsForm";

import debounce from "lodash/debounce";

class OuSelectionContainer extends Component {
  constructor(props) {
    super(props);
    this.searchOrgunit = debounce(this.searchOrgunit.bind(this), 1500);
    this.onOuSearchChange = this.onOuSearchChange.bind(this);
    this.synchronizeUrl = debounce(this.synchronizeUrl.bind(this), 200);
    this.onParentOrganisationUnit = this.onParentOrganisationUnit.bind(this);
    this.state = {
      open: false
    };
  }

  componentDidMount() {
    this.searchOrgunit();
  }

  onOuSearchChange(event) {
    let ouSearchValue = event.target.value;
    this.synchronizeHistory(
      this.props.parent,
      ouSearchValue,
      this.props.period
    );
  }

  synchronizeUrl() {
    this.setState({ loading: true });
    synchronizeHistory(
      this.props.parent,
      this.props.ouSearchValue,
      this.props.period
    );
  }

  synchronizeHistory(parent, ouSearchValue, period) {
    if (!ouSearchValue) {
      ouSearchValue = "";
    }
    const parentParam = parent ? "&parent=" + parent : "";
    this.props.history.replace({
      pathname: "/pyramid",
      search: "?q=" + ouSearchValue + parentParam
    });
  }

  onParentOrganisationUnit(orgUnit) {
    this.synchronizeHistory(
      orgUnit,
      this.props.ouSearchValue,
      this.props.period
    );
  }

  searchOrgunit = async () => {
    let searchvalue = this.props.ouSearchValue
      ? this.props.ouSearchValue.trim()
      : "";
    if (this.props.currentUser) {
      this.setState({ loading: true });
      const user = this.props.currentUser;
      const orgUnitsResp = await this.props.dhis2.searchOrgunits(
        searchvalue,
        user.dataViewOrganisationUnits,
        this.props.contractedOrgUnitGroupId,
        this.props.parent
      );
      console.log(
        "Searching for " +
          searchvalue +
          " => " +
          orgUnitsResp.organisationUnits.length
      );
      this.setState({
        orgUnits: orgUnitsResp.organisationUnits,
        loading: false
      });
    }
  };

  componentWillReceiveProps(nextProps) {
    const dirty =
      nextProps.ouSearchValue !== this.props.ouSearchValue ||
      nextProps.parent != this.props.parent;
    this.props = nextProps;

    const user = this.props.currentUser;
    if (user && dirty) {
      this.searchOrgunit();
    }
  }

  handleDialogFormOpen = () => {
    this.setState({ open: true });
  };

  handleDialogFormClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes, t } = this.props;

    return (
      <React.Fragment>
        <Typography variant="title" component="h5" gutterBottom>
          {t("select_org_unit")}
        </Typography>
        <div className={classes.filters}>
          <OrgUnitAutoComplete
            organisationUnits={this.props.topLevelsOrgUnits}
            onChange={this.onParentOrganisationUnit}
            selected={this.props.parent}
          />
          <br />

          <OuPicker
            onOuSearchChange={this.onOuSearchChange}
            ouSearchValue={this.props.ouSearchValue}
          />

          <br />
          {this.state.loading ? <LinearProgress variant="query" /> : ""}
        </div>

        <br />
        <OrgUnitsGroupsForm
          open={this.state.open}
          handleDialogFormClose={this.handleDialogFormClose}
          organisationUnitGroupSets={this.props.organisationUnitGroupSets}
          organisationUnitGroups={this.props.organisationUnitGroups}
          selectedOrgUnit={this.props.selectedOrgUnit}
          groupsetInitVals={this.props.groupsetInitVals}
          searchOrgunit={this.searchOrgunit}
          {...this.props}
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("org_unit_name")}</TableCell>
              <TableCell>Levels</TableCell>
              <TableCell>organisation unit groups</TableCell>
              <TableCell align="right">{t("org_unit_operation")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {this.state.orgUnits &&
              this.state.orgUnits.map((orgUnit, index) => (
                <TableRow key={orgUnit.id + index}>
                  <TableCell component="th" scope="row">
                    {orgUnit.name}
                  </TableCell>
                  <TableCell>
                    <b>{this.props.levels[1]}: </b>
                    {orgUnit.ancestors[1] && orgUnit.ancestors[1].name}
                    <br />
                    <b>{this.props.levels[2]}: </b>
                    {orgUnit.ancestors[2] && orgUnit.ancestors[2].name}
                  </TableCell>
                  <TableCell>
                    {orgUnit.organisationUnitGroups.map(g => g.name).join(", ")}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      color="primary"
                      onClick={() => {
                        this.props.setSelectedOrgUnitGroups(orgUnit);
                        this.handleDialogFormOpen();
                      }}
                    >
                      {t("edit_org_unit_groups")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </React.Fragment>
    );
  }
}

OuSelectionContainer.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withNamespaces()(OuSelectionContainer);
