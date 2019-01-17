import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

import DatePeriods from "../../support/DatePeriods";

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

    return invoiceTypes.map(invoiceType => (
      <React.Fragment key={this.linkTo(invoiceType)}>
        <React.Fragment>
          <span className={this.props.classes.buttonLike}>
            {invoiceType.name}
          </span>

          {DatePeriods.split(quarterPeriod, invoiceType.frequency).map(
            subPeriod => (
              <Button
                key={invoiceType.code + "-" + subPeriod + "-" + orgUnit.id}
                variant="text"
                color="primary"
                size="small"
                component={Link}
                to={this.linkTo(invoiceType, subPeriod)}
                title={subPeriod}
              >
                {DatePeriods.displayName(
                  subPeriod,
                  invoiceType.frequency == "quarterly"
                    ? "quarter"
                    : invoiceType.frequency == "sixMonthly"
                    ? "sixMonth"
                    : "monthYear"
                )}
              </Button>
            )
          )}
        </React.Fragment>

        <br />
      </React.Fragment>
    ));
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
}

InvoiceLink.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(InvoiceLink);
