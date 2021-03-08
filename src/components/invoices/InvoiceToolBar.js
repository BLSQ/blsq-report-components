import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import ArrowForward from "@material-ui/icons/ArrowForward";
import ArrowBack from "@material-ui/icons/ArrowBack";
import DatePeriods from "../../support/DatePeriods";
import { withTranslation } from "react-i18next";
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import InvoiceLinks from "./InvoiceLinks";
import Tooltip from "@material-ui/core/Tooltip";
import ReportProblemIcon from "@material-ui/icons/ReportProblem";
import ExtensionsComponent from "../core/ExtensionsComponent";
import ErrorsTable from "./ErrorsTable";

const styles = {
  center: {
    textAlign: "center",
  },
};

const asTooltip = (stats) => {
  return (
    <div>
      <span>This rely on dataApproval workflows, generally lock/unlock data at parent orgunits level (region, province, district)</span>
      <br></br>
      {Object.keys(stats).map((k, index) => (
        <span key={index}>
          <>
            {k} : {stats[k]} <br />
          </>
        </span>
      ))}
    </div>
  );
};

const tooltipStyles = {
  tooltip: {
    maxWidth: "600px",
  },
};

const CustomTooltip = withStyles(tooltipStyles)(Tooltip);

const InvoiceAlert = ({ errors, indexedOrgUnits, onToggleErrors }) => {
  return (
    <CustomTooltip
      title={<ErrorsTable errors={errors} indexedOrgUnits={indexedOrgUnits} />}
    >
      <Button onClick={onToggleErrors}>
        <ReportProblemIcon style={{ fill: "orange" }} />
      </Button>
    </CustomTooltip>
  );
};

class InvoiceToolBar extends Component {
  constructor(props) {
    super(props);
    this.recalculateInvoice = this.recalculateInvoice.bind(this);
    this.state = {
      open: false,
      showErrors: false,
    };
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleToggleErrors = () => {
    this.setState({ showErrors: !this.state.showErrors });
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
    const { classes, period, orgUnitId, invoiceCode, linkPrefix } = this.props;

    const nextPeriod = DatePeriods.next(period);
    const previousPeriod = DatePeriods.previous(period);

    const monthlyPeriods = this.props.invoice.quarter
      ? DatePeriods.monthlyPeriods(
          this.props.invoice.year,
          this.props.invoice.quarter
        )
      : [];
    const periodPreviousNumber = this.props.invoice.invoiceType.periodStep
      ? this.props.period === monthlyPeriods[monthlyPeriods.length - 1]
        ? "1"
        : this.props.period === monthlyPeriods[0]
        ? this.props.invoice.invoiceType.periodStep
        : "2"
      : 0;
    const periodStepNumber =
      this.props.period === monthlyPeriods[monthlyPeriods.length - 1]
        ? "2"
        : this.props.invoice.invoiceType.periodStep
        ? this.props.invoice.invoiceType.periodStep
        : 0;
    const nextStep = DatePeriods.nextPeriods(period, periodStepNumber);
    const previousStep = DatePeriods.previousPeriods(
      period,
      periodPreviousNumber
    );

    const running =
      this.props.calculateState && this.props.calculateState.running > 0;
    const message = running
      ? this.props.calculateState.running +
        " / " +
        this.props.calculateState.total
      : this.props.t("re_calculate");
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
      (this.props.invoice.invoiceType.periodStep
        ? nextStep[nextStep.length - 1]
        : nextPeriod) +
      "/" +
      orgUnitId +
      "/" +
      invoiceCode;
    const previous =
      "/" +
      linkPrefix +
      "/" +
      (this.props.invoice.invoiceType.periodStep
        ? previousStep[0]
        : previousPeriod) +
      "/" +
      orgUnitId +
      "/" +
      invoiceCode;
    const invoicesCodes = this.props.invoices.getInvoiceTypeCodes(
      this.props.invoice.orgUnit,
      period
    );
    const indexedOrgUnits = {};
    if (this.props.invoice.orgUnits) {
      this.props.invoice.orgUnits.forEach(
        (ou) => (indexedOrgUnits[ou.id] = ou)
      );
    }
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
        {invoicesCodes.length > 1 &&
          invoicesCodes.includes(this.props.invoice.invoiceType.code) && (
            <InvoiceLinks
              orgUnit={this.props.invoice.orgUnit}
              period={this.props.invoice.period}
              hideCurrentInvoice={true}
              {...this.props}
            />
          )}
        <Button onClick={() => window.print()}>{this.props.t("print")}</Button>
        {recalculateButton}
        {this.props.calculateState &&
          this.props.calculateState.errors &&
          this.props.calculateState.errors.length > 0 && (
            <InvoiceAlert
              errors={this.props.calculateState.errors}
              indexedOrgUnits={indexedOrgUnits}
              onToggleErrors={this.handleToggleErrors}
            />
          )}
        {this.props.lockState && this.props.lockState.stats && (
          <React.Fragment>
            {this.props.lockState.stats.UNAPPROVED_READY && (
              <Tooltip title={asTooltip(this.props.lockState.stats)}>
                <Button
                  onClick={() => this.props.onToggleLock("LOCK")}
                  disabled={this.props.lockState.running || !this.props.lockState.canApproveUnapprove}
                >
                  Lock
                  {this.props.lockState.running && (
                    <CircularProgress size={15} />
                  )}
                </Button>
              </Tooltip>
            )}
            {this.props.lockState.stats.APPROVED_HERE && (
              <Tooltip title={asTooltip(this.props.lockState.stats)}>
                <Button
                  onClick={() => this.props.onToggleLock("UNLOCK")}
                  disabled={this.props.lockState.running || !this.props.lockState.canApproveUnapprove}
                >
                  Unlock
                  {this.props.lockState.running && (
                    <CircularProgress size={15} />
                  )}
                </Button>
              </Tooltip>
            )}
          </React.Fragment>
        )}
        <ExtensionsComponent
          extensionKey="invoices.actions"
          invoice={this.props.invoice}
        />
        {this.props.calculateState &&
          this.state.showErrors &&
          this.props.calculateState.errors &&
          this.props.calculateState.errors.length > 0 && (
            <ErrorsTable
              errors={this.props.calculateState.errors}
              indexedOrgUnits={indexedOrgUnits}
            />
          )}
        {this.props.warning && (
          <Typography color="error">{this.props.warning}</Typography>
        )}
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

export default withStyles(styles)(withTranslation()(InvoiceToolBar));
