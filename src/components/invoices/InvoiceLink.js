import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

import DatePeriods from "../../support/DatePeriods";
import { withNamespaces } from "react-i18next";

const styles = theme => ({
  buttonLike: {
    ...theme.typography.button,
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing.unit,
    fontSize: "0.8125rem"
  }
});

class InvoiceLink extends Component {
  render() {
    const orgUnit = this.props.orgUnit;

    const codes = this.props.invoices.getInvoiceTypeCodes(orgUnit);

    if (codes === undefined || codes.length === 0) {
      return null;
    }

    const invoiceTypes = this.props.invoices.getInvoiceTypes(codes);

    const quarterPeriod = DatePeriods.split(this.props.period, "quarterly")[0];
    const invoiceTypesData = invoiceTypes.map(invoiceType => (
      <React.Fragment key={invoiceType.name}>
        <React.Fragment>
          <span className={this.props.classes.buttonLike}>
            {invoiceType.name}
          </span>

          {DatePeriods.split(quarterPeriod, invoiceType.frequency).map(function
            (subPeriod){
              var period = DatePeriods.displayName(subPeriod, invoiceType.periodFormat || (invoiceType.frequency == "quarterly" ? "quarter" : invoiceType.frequency == "sixMonthly" ? "sixMonth" : "monthYear"));
              console.info("Splitted period:", period.split(" "));
              var splittedPeriod = period.split(" ");
              console.info("Splitted period:", splittedPeriod[0]);
              console.info("This....:", this.translatePeriod(splittedPeriod[0]));

              return <Button
                key={invoiceType.code + "-" + subPeriod + "-" + orgUnit.id}
                variant="text"
                color="primary"
                size="small"
                component={Link}
                to={this.linkTo(invoiceType, subPeriod)}
                title={subPeriod}
              >
                {this.translatePeriod(splittedPeriod[0])+" "+splittedPeriod[1]}
              </Button>
            })
          }
        </React.Fragment>

        <br />
      </React.Fragment>
    ));

    return invoiceTypesData;
  }

  linkTo(invoiceType, period) {
    return (
      "/invoices/" +
      period +
      "/" +
      this.props.orgUnit.id +
      "/" +
      invoiceType.code
    );
  }

  translatePeriod(period){
    return (this.props.t(period));
  }
}

InvoiceLink.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(withNamespaces()(InvoiceLink));
