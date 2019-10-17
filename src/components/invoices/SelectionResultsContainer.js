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

const styles = theme => ({});

class SelectionResultsContainer extends Component {
  static defaultProps = {
    periodFormat: {
      quarterly: "quarter",
      monthly: "yearMonth"
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      invoiceDialogOpen: false,
      invoiceLinks: undefined,
      invoiceOrgUnitName: undefined
    };
  }

  handleInvoiceDialogClose = () => {
    this.setState({ invoiceDialogOpen: false, invoiceLinks: undefined });
  };

  buildInvoiceLink = (orgUnit, quarterPeriod, invoiceType) => {
    return {
      invoiceName: invoiceType.name,
      links: DatePeriods.split(quarterPeriod, invoiceType.frequency).map(
        subPeriod => ({
          key: invoiceType.code + "-" + subPeriod + "-" + orgUnit.id,
          to:
            "/invoices/" +
            subPeriod +
            "/" +
            orgUnit.id +
            "/" +
            invoiceType.code,
          title: subPeriod,
          label: DatePeriods.displayName(
            subPeriod,
            invoiceType.periodFormat ||
              (invoiceType.frequency == "quarterly"
                ? "quarter"
                : invoiceType.frequency == "sixMonthly"
                ? "sixMonth"
                : "monthYear")
          )
        })
      )
    };
  };

  buildInvoiceAnchors = linkObj => {
    return (
      <React.Fragment>
        <Typography variant="overline" gutterBottom>
          {linkObj.invoiceName}{" "}
        </Typography>
        {linkObj.links.map(link => (
          <Button
            key={link.key}
            variant="text"
            color="primary"
            size="small"
            component={Link}
            to={link.to}
            title={link.title}
          >
            {link.label}
          </Button>
        ))}
      </React.Fragment>
    );
  };

  buildInvoiceTypes = (invoices, orgUnit) => {
    const codes = invoices.getInvoiceTypeCodes(orgUnit);

    if (codes === undefined || codes.length === 0) {
      return null;
    }

    return invoices.getInvoiceTypes(codes);
  };

  buildInvoiceLinks(orgUnit, period, invoices) {
    const invoiceTypes = this.buildInvoiceTypes(invoices, orgUnit);
    const quarterPeriod = DatePeriods.split(period, "quarterly")[0];

    var invoiceLinks = invoiceTypes.map(invoiceType =>
      this.buildInvoiceLink(orgUnit, quarterPeriod, invoiceType)
    );

    this.setState({
      invoiceOrgUnitName: orgUnit.name,
      invoiceLinks: invoiceLinks,
      invoiceDialogOpen: true
    });
  }

  evalInvoice = (orgUnit, period, invoices) => {
    const invoiceTypes = this.buildInvoiceTypes(invoices, orgUnit);
    const quarterPeriod = DatePeriods.split(period, "quarterly")[0];

    return invoiceTypes !== null ? (
      invoiceTypes.length > 1 ? (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={() =>
            this.buildInvoiceLinks(
              orgUnit,
              this.props.period,
              this.props.invoices
            )
          }
        >
          {this.props.t("show_avalaible_invoices")}
        </Button>
      ) : (
        this.buildInvoiceAnchors(
          this.buildInvoiceLink(orgUnit, quarterPeriod, invoiceTypes[0])
        )
      )
    ) : (
      this.props.t("missing_invoice_types")
    );
  };

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
                    {this.evalInvoice(
                      orgUnit,
                      this.props.period,
                      this.props.invoices
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {this.state.invoiceLinks && (
          <Dialog
            fullWidth={true}
            maxWidth="md"
            open={this.state.invoiceDialogOpen}
            onClose={this.handleInvoiceDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="simple-dialog-title">
              {this.state.invoiceOrgUnitName}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                <List>
                  {this.state.invoiceLinks.map((link, linkIndex) => (
                    <li key={link.invoiceName + "-" + linkIndex}>
                      {this.buildInvoiceAnchors(link)}
                      {this.state.invoiceLinks.length - 1 !== linkIndex && (
                        <Divider />
                      )}
                    </li>
                  ))}
                </List>
              </DialogContentText>
            </DialogContent>
          </Dialog>
        )}
      </React.Fragment>
    );
  }
}

SelectionResultsContainer.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(withNamespaces()(SelectionResultsContainer));
