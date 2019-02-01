import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { withNamespaces } from "react-i18next";
import InputLabel from "@material-ui/core/InputLabel";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";

import PeriodPicker from "./PeriodPicker";
import InvoiceLink from "./InvoiceLink";
import Dhis2 from "../../support/Dhis2";
import { FormControl } from "@material-ui/core";

const styles = theme => ({
  paper: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3
  }),
  table: {
    minWidth: "100%"
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  ouSearch: {
    width: 400
  }
});

class InvoiceSelectionContainer extends Component {
  static defaultProps = {
    periodFormat: {
      quarterly: "quarter",
      monthly: "yearMonth"
    }
  };

  constructor(props) {
    super(props);
    this.state = { orgUnits: [] };
    this.searchOrgunit = this.searchOrgunit.bind(this);
    this.searchOrgunitEvent = this.searchOrgunitEvent.bind(this);
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
    const {classes, t} = this.props;
    return (
      <Paper className={classes.paper} square>
        <Typography variant="title" component="h5" gutterBottom>
          {t('report_and_invoices')}
        </Typography>
        <FormControl className={classes.formControl}>
          <PeriodPicker
            period={this.props.period}
            onPeriodChange={this.props.onPeriodChange}
            periodFormat={this.props.periodFormat}
          />
        </FormControl>

        <TextField
          label="Organisation Unit name"
          onChange={this.searchOrgunitEvent}
          className={classes.ouSearch}
          margin="normal"
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>{this.props.levels[1]}</TableCell>
              <TableCell>{this.props.levels[2]}</TableCell>
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
      const orgUnitsResp = await this.props.dhis2.searchOrgunits(
        searchvalue,
        this.props.currentUser.dataViewOrganisationUnits,
        this.props.contractedOrgUnitGroupId
      );
      this.setState({
        orgUnits: orgUnitsResp.organisationUnits
      });
    }
  }
}

InvoiceSelectionContainer.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(withNamespaces()(InvoiceSelectionContainer));
