import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import PeriodPicker from "./PeriodPicker";
import OuPicker from "./OuPicker";
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
  }

  componentWillReceiveProps(nextProps) {
    this.props = nextProps;
    const user = this.props.currentUser;
    if (
      this.props.orgUnits.length === 0 &&
      user &&
      user.organisationUnits.length > 0
    ) {
      this.props.searchOrgunit(
        this.props.currentUser.organisationUnits[0].name
      );
    }
  }

  render() {
    const classes = this.props.classes;

    return (
      <Paper className={classes.paper} square>
        <Typography variant="title" component="h5" gutterBottom>
          Invoices & Reports
        </Typography>

        <OuPicker
          ouSearchValue={this.props.ouSearchValue}
          onOuSearchChange={this.props.onOuSearchChange}
        />

        <PeriodPicker
          period={this.props.period}
          onPeriodChange={this.props.onPeriodChange}
          periodFormat={this.props.periodFormat}
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
            {this.props.orgUnits &&
              this.props.orgUnits.map((orgUnit, index) => (
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
}

InvoiceSelectionContainer.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(InvoiceSelectionContainer);
