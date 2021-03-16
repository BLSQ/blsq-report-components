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
import { List, ListItem, ListItemText } from "@material-ui/core";
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
      <span>
        This rely on dataApproval workflows, generally lock/unlock data at parent orgunits level (region, province,
        district) and so <br />
        <b>will lock/unlock all orgunits within that parent orgunit</b>.
      </span>
      <br />
      <br />
      <span>
        The button is displayed also on individual invoices and we wanted to show that the Lock/Unlock has a broader
        effect than the current invoice
      </span>
      <br />
      <br />
      <span>
        If the button is disabled, you probably don't have sufficient access rights (on the pyramid or not access write
        to the data approval)
      </span>
      <br />
      <br />
      <span>Some statistics : </span>
      <br />
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

const LockingConfirmDialog = ({ label, stats, disabled, onConfirm, running, invoice, periodFormat }) => {
  const [confirming, setConfirming] = React.useState(false);
  const [error, setError] = React.useState(undefined);
  const confirm = () => {
    try {
      onConfirm();
    } catch (error) {
      setError(error.message);
    }
  };
  const [orgUnits, setOrgUnits] = React.useState();
  React.useEffect(() => {
    const orgUnitIds = Array.from(new Set(invoice.currentApprovals.map((approvals) => approvals.orgUnit)));
    const loadOrgUnits = async () => {
      //TODO look in invoice.orgUnits and call dhis2 if not found ?
      const ous = orgUnitIds.map((id) => {
        return { name: id };
      });
      setOrgUnits(ous);
    };
    loadOrgUnits();
  }, [invoice]);

  return (
    <React.Fragment>
      <Tooltip title={asTooltip(stats)}>
        <span>
          <Button onClick={() => setConfirming(true)} disabled={disabled}>
            {label}
            {running && <CircularProgress size={15} />}
          </Button>
        </span>
      </Tooltip>
      {confirming && (
        <Dialog
          open={confirming}
          onClose={() => setConfirming(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{label}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This will {label} Data within <b>do you confirm ? </b>
            </DialogContentText>
            <DialogTitle id="simple-dialog-title">
              Below is the list for{" "}
              {DatePeriods.displayName(invoice.period, periodFormat[DatePeriods.detect(invoice.period)])}
            </DialogTitle>
            <List>{orgUnits && orgUnits.map((c) => c.name).join(", ")}</List>
            {error}
          </DialogContent>
          <DialogActions>
            {orgUnits && (
              <React.Fragment>
                <Button disabled={running} onClick={() => setConfirming(false)} color="primary">
                  Cancel
                </Button>
                <Button disabled={running} onClick={confirm} color="primary" autoFocus>
                  Confirm
                </Button>
              </React.Fragment>
            )}
          </DialogActions>
        </Dialog>
      )}
    </React.Fragment>
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
    <CustomTooltip title={<ErrorsTable errors={errors} indexedOrgUnits={indexedOrgUnits} />}>
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
      locked: false,
    };
  }

  handleLock = () => {
    console.info("OUs ...:", this.props.invoice.orgUnits);
    this.setState({ locked: true });
  };
  handleUnLock = () => {
    this.setState({ locked: false });
  };

  confirmApproval = () => {
    this.setState({ locked: false });
    this.lockData();
  };
  checkState = () => {
    const action =
      this.props.lockState &&
      this.props.lockState.stats &&
      (this.props.lockState.stats.UNAPPROVED_READY ? "LOCK" : this.props.lockState.stats.APPROVED_HERE ? "UNLOCK" : "");
    return action;
  };
  async lockData() {
    const mode = this.checkState();
    this.props.onToggleLock(mode);
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
      ? DatePeriods.monthlyPeriods(this.props.invoice.year, this.props.invoice.quarter)
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
    const previousStep = DatePeriods.previousPeriods(period, periodPreviousNumber);
    const actionState =
      this.checkState() === "LOCK"
        ? this.props.t("lock")
        : this.checkState() === "UNLOCK"
        ? this.props.t("unlock")
        : "";
    const running = this.props.calculateState && this.props.calculateState.running > 0;
    const message = running
      ? this.props.calculateState.running + " / " + this.props.calculateState.total
      : this.props.t("re_calculate");
    const recalculateButton = this.props.onRecalculate && (
      <Button onClick={this.handleClickOpen} disabled={running || this.props.calculateState === undefined}>
        {message}
        {running && <CircularProgress size={15} />}
      </Button>
    );
    const next =
      "/" +
      linkPrefix +
      "/" +
      (this.props.invoice.invoiceType.periodStep ? nextStep[nextStep.length - 1] : nextPeriod) +
      "/" +
      orgUnitId +
      "/" +
      invoiceCode;
    const previous =
      "/" +
      linkPrefix +
      "/" +
      (this.props.invoice.invoiceType.periodStep ? previousStep[0] : previousPeriod) +
      "/" +
      orgUnitId +
      "/" +
      invoiceCode;

    const invoicesCodes = this.props.invoices.getInvoiceTypeCodes(this.props.invoice.orgUnit, period);
    const indexedOrgUnits = {};
    if (this.props.invoice.orgUnits) {
      this.props.invoice.orgUnits.forEach((ou) => (indexedOrgUnits[ou.id] = ou));
    }
    return (
      <div className={classes.center + " no-print"}>
        <Button component={Link} to={previous}>
          <ArrowBack />
        </Button>
        &nbsp;
        <span title={period}>
          {DatePeriods.displayName(period, this.props.periodFormat[DatePeriods.detect(period)])}
        </span>
        &nbsp;
        <Button component={Link} to={next}>
          <ArrowForward />
        </Button>
        {invoicesCodes.length > 1 && invoicesCodes.includes(this.props.invoice.invoiceType.code) && (
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
              <LockingConfirmDialog
                key={"lock"}
                label="Lock"
                stats={this.props.lockState.stats}
                onConfirm={() => this.props.onToggleLock("LOCK")}
                disabled={this.props.lockState.running || !this.props.lockState.canApproveUnapprove}
                running={this.props.lockState.running}
                invoice={this.props.invoice}
                periodFormat={this.props.periodFormat}
              />
            )}
            {this.props.lockState.stats.APPROVED_HERE && (
              <LockingConfirmDialog
                key={"unlock"}
                label="Unlock"
                stats={this.props.lockState.stats}
                onConfirm={() => this.props.onToggleLock("UNLOCK")}
                disabled={this.props.lockState.running || !this.props.lockState.canApproveUnapprove}
                running={this.props.lockState.running}
                invoice={this.props.invoice}
                periodFormat={this.props.periodFormat}
              />
            )}
          </React.Fragment>
        )}
        <ExtensionsComponent extensionKey="invoices.actions" invoice={this.props.invoice} />
        {this.props.calculateState &&
          this.state.showErrors &&
          this.props.calculateState.errors &&
          this.props.calculateState.errors.length > 0 && (
            <ErrorsTable errors={this.props.calculateState.errors} indexedOrgUnits={indexedOrgUnits} />
          )}
        {this.props.warning && <Typography color="error">{this.props.warning}</Typography>}
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
