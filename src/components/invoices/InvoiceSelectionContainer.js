import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import PeriodPicker from "./PeriodPicker";
import InvoiceLink from "./InvoiceLink";
import Dhis2 from "../../support/Dhis2";

const styles = theme => ({
  paper: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3
  }),
  table: {
    minWidth: "100%"
  }
});

class InvoiceSelectionContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { orgUnits: [] };
    this.searchOrgunit = this.searchOrgunit.bind(this);
    this.searchOrgunitEvent = this.searchOrgunitEvent.bind(this);
    debugger;
  }

  async componentWillReceiveProps(nextProps) {
    this.props = nextProps;
    const user = this.props.currentUser;
    if (
      this.state.orgUnits.length === 0 &&
      user &&
      user.organisationUnits.length > 0
    ) {
      this.searchOrgunit(this.props.currentUser.organisationUnits[0].name);
    }
  }

  render() {
    const classes = this.props.classes;
    return (
      <Paper className={classes.paper} square>
        <PeriodPicker
          period={this.props.period}
          onPeriodChange={this.props.onPeriodChange}
        />
        <TextField
          label="Organisation Unit"
          onChange={this.searchOrgunitEvent}
          placeholder="Search by Organisation Unit name"
          style={{ width: 400 }}
          margin="normal"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>County</TableCell>
              <TableCell>District</TableCell>
              <TableCell>Invoice</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.orgUnits &&
              this.state.orgUnits.map(orgUnit => (
                <TableRow key={orgUnit.id + this.props.period}>
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
                    <InvoiceLink
                      orgUnit={orgUnit}
                      period={this.props.period}
                      invoices={this.props.invoices}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }
  async searchOrgunitEvent(event) {
    var searchvalue = event.target.value.trim();
    this.searchOrgunit(searchvalue);
  }
  async searchOrgunit(searchvalue) {
    if (searchvalue && searchvalue.length > 0 && this.props.currentUser) {
      const orgUnitsResp = await Dhis2.searchOrgunits(
        searchvalue,
        this.props.ouLevel,
        this.props.currentUser.dataViewOrganisationUnits
      );
      this.setState({
        orgUnits: orgUnitsResp.organisationUnits
      });
    }
  }
}

InvoiceSelectionContainer.propTypes = {
  classes: PropTypes.object.isRequired,
  invoices: PropTypes.object.isRequired
};

export default withStyles(styles)(InvoiceSelectionContainer);
