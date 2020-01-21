import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import { Link } from "react-router-dom";
import DatePeriods from "../../support/DatePeriods";
import InvoiceLinks from "./InvoiceLinks";

const styles = theme => ({});

class SelectionResultsContainer extends Component {
  render() {
    const { classes, t } = this.props;
    return (
      <React.Fragment>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{this.props.t("name")}</TableCell>
              <TableCell>{this.props.levels[1]}</TableCell>
              <TableCell>{this.props.levels[2]}</TableCell>
              <TableCell>{this.props.t("invoice")}</TableCell>
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
                    <InvoiceLinks
                      orgUnit={orgUnit}
                      hideCurrentInvoice={false}
                      {...this.props}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </React.Fragment>
    );
  }
}

SelectionResultsContainer.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(withNamespaces()(SelectionResultsContainer));
