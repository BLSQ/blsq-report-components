import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import ArrowForward from "@material-ui/icons/ArrowForward";
import ArrowBack from "@material-ui/icons/ArrowBack";
import DatePeriods from "../../support/DatePeriods";

import Typography from "@material-ui/core/Typography";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import ExtensionsComponent from "../core/ExtensionsComponent";

const styles = {
  center: {
    textAlign: "center"
  }
};

class InvoiceToolBar extends Component {
  constructor(props) {
    super(props);
    this.recalculateInvoice = this.recalculateInvoice.bind(this);
    this.state = {
      open: false
    };
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleConfirm = () => {
    this.setState({ open: false });
    this.recalculateInvoice();
  };

  async recalculateInvoice() {
    this.props.onRecalculate();
  }

  render() {
    const classes = this.props.classes;
    const period = this.props.period;
    const orgUnitId = this.props.orgUnitId;
    const invoiceCode = this.props.invoiceCode;
    const linkPrefix = this.props.linkPrefix;
    const running =
      this.props.calculateState && this.props.calculateState.running > 0;
    const message = running
      ? this.props.calculateState.running +
        " / " +
        this.props.calculateState.total
      : "Calculate";
    const recalculateButton = this.props.onRecalculate && (
      <Button
        onClick={this.handleClickOpen}
        disabled={running || this.props.calculateState === undefined}
      >
        {message}
        {running && <CircularProgress size={15} />}
      </Button>
    );
    const next =
      "/" +
      linkPrefix +
      "/" +
      DatePeriods.next(period) +
      "/" +
      orgUnitId +
      "/" +
      invoiceCode;
    const previous =
      "/" +
      linkPrefix +
      "/" +
      DatePeriods.previous(period) +
      "/" +
      orgUnitId +
      "/" +
      invoiceCode;

    return (
      <div className={classes.center + " no-print"}>
        <Button component={Link} to={previous}>
          <ArrowBack />
        </Button>
        &nbsp;
        <span title={period}>
          {DatePeriods.displayName(
            period,
            this.props.periodFormat[DatePeriods.detect(period)]
          )}
        </span>
        &nbsp;
        <Button component={Link} to={next}>
          <ArrowForward />
        </Button>
        <Button onClick={() => window.print()}>Print</Button>
        {recalculateButton}
        {this.props.warning && (
          <Typography color="error">{this.props.warning}</Typography>
        )}
        <ExtensionsComponent
          extensionKey="invoices.actions"
          invoice={this.props.invoice}
        />
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Calculate"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              this might override already generated data do you confirm ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleConfirm} color="primary" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(InvoiceToolBar);
