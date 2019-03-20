import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import LinearProgress from "@material-ui/core/LinearProgress";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Radio from "@material-ui/core/Radio";
import Button from "@material-ui/core/Button";
import OrgUnitAutoComplete from "../invoices/OrgUnitAutoComplete";
import OuPicker from "../invoices/OuPicker";
import OuFormLink from "./OuFormLink";

import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { Formik, Field, Form } from "formik";
import { TextField, Checkbox, RadioGroup } from "formik-material-ui";

import debounce from "lodash/debounce";

const styles = theme => ({
  filters: {
    marginLeft: "30px"
  }
});

class OuSelectionContainer extends Component {
  constructor(props) {
    super(props);
    this.searchOrgunit = debounce(this.searchOrgunit.bind(this), 1500);
    this.onOuSearchChange = this.onOuSearchChange.bind(this);
    this.synchronizeUrl = debounce(this.synchronizeUrl.bind(this), 200);
    this.onParentOrganisationUnit = this.onParentOrganisationUnit.bind(this);
    this.state = {};
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

  async searchOrgunit() {
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
  }

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

  setSelectedOrgUnitGroups(selectedOrgUnit) {
    let orgUnitGroups = selectedOrgUnit.organisationUnitGroups.map(
      group => group.id
    );

    if (orgUnitGroups.length > 0) {
      this.props.organisationUnitGroupSets.forEach(groupset => {
        let intersection = groupset.organisationUnitGroups
          .filter(group => orgUnitGroups.includes(group.id))
          .map(group => group.id);

        this.props.setFieldValue("groupsets." + groupset.id, intersection);
      });
    }
  }

  render() {
    const { classes, t, values, setFieldValue } = this.props;
    const { activeStep } = this.state;

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

        <Field
          id="orgUnitId"
          type="hidden"
          name="orgUnitId"
          value={values.orgUnitId}
          component={TextField}
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("org_unit_name")}</TableCell>
              <TableCell>{this.props.levels[1]}</TableCell>
              <TableCell>{this.props.levels[2]}</TableCell>
              <TableCell>{t("org_unit_operation")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {this.state.orgUnits &&
              this.state.orgUnits.map((orgUnit, index) => (
                <TableRow key={orgUnit.id + index}>
                  <TableCell
                    component="th"
                    scope="row"
                    title={orgUnit.organisationUnitGroups
                      .map(g => g.name)
                      .join(", ")}
                  >
                    {orgUnit.name}
                  </TableCell>
                  <TableCell>
                    {orgUnit.ancestors[1] && orgUnit.ancestors[1].name}
                  </TableCell>
                  <TableCell>
                    {orgUnit.ancestors[2] && orgUnit.ancestors[2].name}
                  </TableCell>
                  <TableCell>
                    <Button
                      color="primary"
                      onClick={() => {
                        setFieldValue("orgUnitId", orgUnit.id);
                        this.setSelectedOrgUnitGroups(orgUnit);
                        this.props.nextStepFn();
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

export default withStyles(styles)(withNamespaces()(OuSelectionContainer));
