import React, { Component } from "react";
import Loader from "../shared/Loader";
import Warning from "../shared/Warning";
import PageOrientation from "../shared/PageOrientation";
import InvoiceService from "./support/InvoiceService";

import Orbf2 from "../../support/Orbf2";

import InvoiceToolBar from "./InvoiceToolBar";

class InvoiceContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.recalculate = this.recalculate.bind(this);
    this.loadData = this.loadData.bind(this);
    this.fetchInvoicingJobs = this.fetchInvoicingJobs.bind(this);
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
      invoice: undefined
    });
    this.loadData();
  }

  async fetchInvoicingJobs() {
    if (
      this.state.invoice === undefined ||
      this.state.invoice.calculations.length === 0
    ) {
      this.nextReq(5000);
      return;
    }
    let invoicingJobs;
    try {
      invoicingJobs = await Orbf2.invoicingJobs(
        this.state.invoice.calculations,
        this.props.currentUser.id
      );
    } catch (error) {
      this.setState({
        warning: "Sorry was not able to contact ORBF2 backend: " + error.message
      });
      throw error;
    }

    const runningCount = invoicingJobs.data.filter(invoicingJob => {
      return invoicingJob.attributes.isAlive;
    });

    const wasRunning =
      this.state.calculateState && this.state.calculateState.running > 0;

    this.setState({
      invoicingJobs: invoicingJobs.data,
      calculateState: {
        running: runningCount.length,
        total: this.state.invoice.calculations.length
      }
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
      const invoiceType = this.props.invoices.getInvoiceType(invoiceTypeCode);
      const dhis2 = this.props.dhis2;

      const invoice = await new InvoiceService().fetchInvoiceData(
        dhis2,
        orgUnitId,
        period,
        invoiceType,
        this.props.invoices.mapper(invoiceTypeCode)
      );
      invoice.currentUser = this.props.currentUser;

      const calculations = this.props.invoices.getOrbfCalculations(
        invoice,
        this.props.currentUser
      );
      invoice.calculations = calculations;
      this.setState({
        invoice: invoice
      });
      document.title =
        invoiceTypeCode +
        "-" +
        period +
        "-" +
        (invoice.orgUnit ? invoice.orgUnit.name : "");
    } catch (error) {
      this.setState({
        error:
          "Sorry something went wrong, try refreshing or contact the support : " +
          error.message
      });
      throw error;
    }
  }

  async recalculate() {
    try {
      const calculations = this.state.invoice.calculations;
      calculations.forEach(calculation => {
        Orbf2.calculate(calculation);
      });
      this.nextReq(100);
    } catch (error) {
      this.setState({
        error:
          "Sorry something went wrong, when triggering calculation try refreshing or contact the support : " +
            error.message || error
      });
      throw error;
    }
  }

  render() {
    if (this.state.error !== undefined) {
      return <Warning message={this.state.error} />;
    }
    if (
      this.state.invoice === undefined ||
      this.props.currentUser === undefined
    ) {
      return (
        <div>
          <Loader />
        </div>
      );
    }
    const SelectedInvoice = this.props.invoices.component(
      this.state.invoice.invoiceType.code
    );

    const calculable = this.props.invoices.isCalculable(
      this.state.invoice,
      this.props.currentUser
    );

    return (
      <div className="invoicePage">
        <PageOrientation
          orientation={this.state.invoice.invoiceType.orientation}
        />
        <InvoiceToolBar
          linkPrefix={"invoices"}
          period={this.props.period}
          orgUnitId={this.props.orgUnitId}
          invoiceCode={this.props.invoiceCode}
          onRecalculate={calculable && this.recalculate}
          calculateState={this.state.calculateState}
          warning={this.state.warning}
          periodFormat={this.props.periodFormat}
          invoices={this.props.invoices}
          invoice={this.state.invoice}
        />

        <SelectedInvoice
          invoice={this.state.invoice}
          orgUnitId={this.props.orgUnitId}
          period={this.props.period}
        />

        <InvoiceToolBar
          linkPrefix={"invoices"}
          period={this.props.period}
          orgUnitId={this.props.orgUnitId}
          invoiceCode={this.props.invoiceCode}
          onRecalculate={calculable && this.recalculate}
          calculateState={this.state.calculateState}
          warning={this.state.warning}
          periodFormat={this.props.periodFormat}
          invoices={this.props.invoices}
          invoice={this.state.invoice}
        />
      </div>
    );
  }
}

export default InvoiceContainer;
