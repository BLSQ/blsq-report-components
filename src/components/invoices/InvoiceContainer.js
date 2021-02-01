import React, { Component } from "react";
import Loader from "../shared/Loader";
import Warning from "../shared/Warning";
import PageOrientation from "../shared/PageOrientation";
import InvoiceService from "./support/InvoiceService";

import PluginRegistry from "../core/PluginRegistry";

import InvoiceToolBar from "./InvoiceToolBar";

class InvoiceContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.recalculate = this.recalculate.bind(this);
    this.toggleLock = this.toggleLock.bind(this);
    this.loadLockState = this.loadLockState.bind(this);
    this.loadData = this.loadData.bind(this);
    this.fetchInvoicingJobs = this.fetchInvoicingJobs.bind(this);
    this.orbf2 = PluginRegistry.extension("invoices.hesabu");
  }

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.timeout);
  }

  async componentDidMount() {
    this.loadData();
    this.mounted = true;
    this.nextReq(10);
  }

  async componentWillReceiveProps(nextProps) {
    this.props = nextProps;
    this.setState({
      invoice: undefined,
    });
    this.loadData();
  }

  async fetchInvoicingJobs() {
    if (this.state.invoice === undefined || this.state.invoice.calculations.length === 0) {
      this.nextReq(5000);
      return;
    }

    await this.loadLockState();

    // Calculations ususally have this signature:
    // {
    //   orgUnitId: "some_org_unit",
    //   period: "2020Q4",
    //   currentUserId: "a-user-id"
    // }
    //
    // But they can also have a `then` key which contains an array of
    // calculations that are dependent on that one.
    //
    // What this does, is take those nested ones and flatten it into
    // one array of invoices that need to be calculated.
    const calculations = this.state.invoice.calculations;
    const all = calculations.flatMap(({currentUserId, orgUnitId, period, then}) => {
      const parent =  [{currentUserId: currentUserId, orgUnitId: orgUnitId, period: period}]
      if (then) {
        return parent.concat(then);
      } else {
        return parent;
      }
    })

    let invoicingJobs;
    try {
      // Get the status of all possible invoicing jobs
      invoicingJobs = await this.orbf2.invoicingJobs(all, this.props.currentUser.id);
    } catch (error) {
      this.setState({
        warning: "Sorry was not able to contact ORBF2 backend: " + error.message,
      });
      throw error;
    }

    let runningCount = invoicingJobs.data.filter((invoicingJob) => {
      return invoicingJob.attributes.isAlive;
    });

    // See if any of the child jobs, need to be enqueued
    invoicingJobs.data.forEach((invoicingJob) => {
      const calculation = calculations.find(({currentUserId, orgUnitId, period}) => {
        return invoicingJob.attributes.orgUnit == orgUnitId &&
          invoicingJob.attributes.dhis2Period == period;
      })
      if (calculation && invoicingJob.attributes.status == "processed") {
        (calculation.then || []).forEach(dependentCalculation => {
          const job = invoicingJobs.data.find((childJob) => {
            return childJob.attributes.orgUnit == dependentCalculation.orgUnitId &&
              childJob.attributes.dhis2Period == dependentCalculation.period;
          })
          if (job) {
            // "Child already existed, nothing to do here"
          } else {
            // `Will queue new one: ${dependentCalculation.orgUnitId} ${dependentCalculation.period}`);
            // Update runningCount because this is a new job, not already in `invoicingJobs`
            runningCount = runningCount + 1;
            this.orbf2.calculate(dependentCalculation);
          }
        });
      }
    });


    const errors = invoicingJobs.data.filter((invoicingJob) => {
      return invoicingJob.attributes.lastError;
    });

    const wasRunning = this.state.calculateState && this.state.calculateState.running > 0;

    this.setState({
      invoicingJobs: invoicingJobs.data,
      calculateState: {
        running: runningCount.length,
        total: all.length,
        errors: errors,
      },
    });

    if (runningCount.length > 0) {
      this.nextReq(10000);
    } else {
      if (wasRunning) {
        this.loadData();
      }
      this.nextReq(60000);
    }
  }

  nextReq(interval) {
    if (this.mounted) {
      this.timeout = setTimeout(this.fetchInvoicingJobs, interval);
    }
  }

  async loadData() {
    if (this.props.currentUser === undefined) {
      return;
    }
    try {
      const period = this.props.period;

      const orgUnitId = this.props.orgUnitId;
      const invoiceTypeCode = this.props.invoiceCode;
      const invoiceType = this.props.invoices.getInvoiceType(invoiceTypeCode, period);
      const dhis2 = this.props.dhis2;

      const invoice = await new InvoiceService().fetchInvoiceData(
        dhis2,
        orgUnitId,
        period,
        invoiceType,
        this.props.invoices.mapper(invoiceTypeCode, period),
      );
      invoice.currentUser = this.props.currentUser;

      const calculations = this.props.invoices.getOrbfCalculations(invoice, this.props.currentUser);
      invoice.calculations = calculations;
      this.setState({
        invoice: invoice,
      });
      document.title = invoiceTypeCode + "-" + period + "-" + (invoice.orgUnit ? invoice.orgUnit.name : "");
    } catch (error) {
      this.setState({
        error: "Sorry something went wrong, try refreshing or contact the support : " + error.message,
      });
      throw error;
    }
  }

  async loadLockState() {
    const api = await this.props.dhis2.api();

    const approvals = this.props.invoices.getDataApprovals
      ? this.props.invoices.getDataApprovals(this.state.invoice, this.props.currentUser)
      : [];
    const currentApprovals = [];
    for (let approval of approvals) {
      const approvalStatus = await api.get("dataApprovals", {
        wf: approval.wf.id,
        pe: approval.period,
        ou: approval.orgUnit,
      });
      approvalStatus.orgUnit = approval.orgUnit;
      approvalStatus.period = approval.period;
      approvalStatus.wf = approval.wf;

      currentApprovals.push(approvalStatus);
    }

    const stats = {};
    for (let a of currentApprovals) {
      if (stats[a.state] === undefined) {
        stats[a.state] = 1;
      } else {
        stats[a.state] = stats[a.state] + 1;
      }
    }

    console.log("orgunits to approve " + new Set(approvals.map((a) => a.orgUnit)).size);
    console.log("approval stats", stats);
    console.log(
      currentApprovals.length +
        " approvals  : mayApprove " +
        currentApprovals.filter((a) => a.mayApprove == true).length,
    );
    this.state.invoice.approvals = approvals;
    this.state.invoice.currentApprovals = currentApprovals;
    this.state.invoice.approvalStats = stats;

    this.setState({
      lockState: {
        approvals: approvals,
        currentApprovals: currentApprovals,
        stats: stats,
      },
    });
  }

  async recalculate() {
    try {
      const invoice = this.state.invoice;
      const calculations = invoice.calculations;
      const orgUnitsById = {};
      invoice.orgUnits.forEach((ou) => (orgUnitsById[ou.id] = ou));
      let allowedCalculations = calculations
      if (this.props.invoices.getDataApprovals) {
          const approvableOrgUnitIds = new Set(
            invoice.currentApprovals.filter((approval) => approval.mayApprove).map((approval) => approval.orgUnit),
          );

          allowedCalculations = calculations.filter((calculation) => {
            const orgUnit = orgUnitsById[calculation.orgUnitId];
            return orgUnit.ancestors.some((ou) => approvableOrgUnitIds.has(ou.id));
          });
          console.log(
            "will schedule " +
              allowedCalculations.length +
              " out of " +
              calculations.length +
              " due to already approved data",
          );
      }
      allowedCalculations.forEach((calculation) => {
        this.orbf2.calculate(calculation);
      });
      this.nextReq(100);
    } catch (error) {
      this.setState({
        error:
          "Sorry something went wrong, when triggering calculation try refreshing or contact the support : " +
            error.message || error,
      });
      throw error;
    }
  }

  async toggleLock(mode) {
    const api = await this.props.dhis2.api();
    const approvals = this.state.lockState.approvals;
    this.setState({ lockState: { running: true, ...this.state.lockState } });

    for (let approval of approvals) {
      if (mode === "UNLOCK") {
        await api.delete("dataApprovals?pe=" + approval.period + "&ou=" + approval.orgUnit + "&wf=" + approval.wf.id);
      } else if (mode === "LOCK") {
        await api.post("dataApprovals?pe=" + approval.period + "&ou=" + approval.orgUnit + "&wf=" + approval.wf.id);
      }
    }
    await this.loadLockState();
  }

  toolBarButtons = () => {
    const calculable = this.props.invoices.isCalculable(this.state.invoice, this.props.currentUser);
    return (
      <InvoiceToolBar
        linkPrefix={"reports"}
        period={this.props.period}
        orgUnitId={this.props.orgUnitId}
        invoiceCode={this.props.invoiceCode}
        onRecalculate={calculable && this.recalculate}
        calculateState={this.state.calculateState}
        onToggleLock={this.toggleLock}
        lockState={this.state.lockState}
        warning={this.state.warning}
        periodFormat={this.props.periodFormat}
        invoices={this.props.invoices}
        invoice={this.state.invoice}
      />
    );
  };

  render() {
    if (this.state.error !== undefined) {
      return <Warning message={this.state.error} />;
    }
    if (this.state.invoice === undefined || this.props.currentUser === undefined) {
      return (
        <div>
          <Loader />
        </div>
      );
    }
    const SelectedInvoice = this.props.invoices.component(this.state.invoice.invoiceType.code, this.props.period);

    return (
      <div className="invoicePage">
        <PageOrientation orientation={this.state.invoice.invoiceType.orientation} />
        {this.toolBarButtons()}
        <SelectedInvoice invoice={this.state.invoice} orgUnitId={this.props.orgUnitId} period={this.props.period} />
        {this.toolBarButtons()}
      </div>
    );
  }
}

export default InvoiceContainer;
