import React, { Component } from "react";
import InvoiceContainer from "../components/invoices/InvoiceContainer";

class InvoicePage extends Component {
  componentWillReceiveProps(props) {
    if (props.onPeriodChange) {
      props.onPeriodChange(props.match.params.period);
    }
  }

  render() {
    return (
      <InvoiceContainer
        period={this.props.match.params.period}
        orgUnitId={this.props.match.params.orgUnitId}
        invoiceCode={this.props.match.params.invoiceCode}
        currentUser={this.props.currentUser}
        invoices={this.props.invoices}
      />
    );
  }
}

export default InvoicePage;
