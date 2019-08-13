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

    return (
        invoiceTypes.map(invoiceType => (
          <React.Fragment key={this.linkTo(invoiceType)}>
            <React.Fragment>
              <span className={this.props.classes.buttonLike}>
                {invoiceType.name}
              </span>

              {DatePeriods.split(quarterPeriod, invoiceType.frequency).map(subPeriod => (
                  const period = DatePeriods.displayName(subPeriod, invoiceType.periodFormat || (invoiceType.frequency == "quarterly" ? "quarter" : invoiceType.frequency == "sixMonthly" ? "sixMonth" : "monthYear"));
                  const splittedPeriod = period.split(" ");
                  const linkPeriod = this.linkTo(invoiceType, subPeriod);
                  const translatedPeriod = this.translatePeriod(splittedPeriod[0]) + " " + splittedPeriod[1];

                  return (<Button
                    key={invoiceType.code + "-" + subPeriod + "-" + orgUnit.id}
                    variant="text"
                    color="primary"
                    size="small"
                    component={Link}
                    to={linkPeriod}
                    title={subPeriod}
                  >
                    {translatedPeriod}
                  </Button>);
                ))
              }
            </React.Fragment>

            <br />
          </React.Fragment>
        ))
    );
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
