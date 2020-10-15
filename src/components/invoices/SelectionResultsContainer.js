import React, { Component } from "react";
import Box from "@material-ui/core/Box";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import PropTypes from "prop-types";
import InvoiceLinks from "./InvoiceLinks";
import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";
import { Typography } from "@material-ui/core";

const styles = (theme) => ({});

const contractsToTooltip = (orgUnit, period) => {
  if (orgUnit.contracts === undefined) {
    return "";
  }
  return orgUnit.contracts.map((c, index) => (
    <div key={index}>
      {c.codes.join(",") +
        " : " +
        c.startPeriod +
        " " +
        c.endPeriod +
        " " +
        (c.matchPeriod(period) ? "**" : "")}
    </div>
  ));
};

class SelectionResultsContainer extends Component {
  render() {
    const { classes, t } = this.props;
    return (
      <React.Fragment>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{this.props.levels.slice(1).join(" > ")}</TableCell>
              <TableCell>{this.props.t("name")}</TableCell>
              <TableCell>{this.props.t("invoice")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.orgUnits &&
              this.props.orgUnits.map((orgUnit, index) => (
                <TableRow key={orgUnit.id + index}>

                  <TableCell >
                    <Box >
                      <Typography>
                        {orgUnit.ancestors
                          .slice(1)
                          .map((a) => a.name)
                          .join(" > ")}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Tooltip
                      title={
                        <div>
                          {orgUnit.organisationUnitGroups
                            .map((g) => g.name)
                            .join(", ")}
                          <br></br>
                          {contractsToTooltip(orgUnit, this.props.period)}
                        </div>
                      }
                    >
                      <Box fontWeight="fontWeightBold">{orgUnit.name}</Box>
                    </Tooltip>
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
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(withNamespaces()(SelectionResultsContainer));
