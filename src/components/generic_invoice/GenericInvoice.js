import React, { Component } from "react";

import { Cell, DatePeriods } from "@blsq/blsq-report-components";
import { withStyles } from "@material-ui/core/styles";
const styles = theme => ({
  root: {
    width: "100%",
    marginTop: theme.spacing.unit * 3,
    overflowX: "auto"
  },
  invoiceTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "11px",
    border: "0.5pt solid black"
  },
  invoiceTotals: {
    width: "250px",
    borderCollapse: "collapse",
    fontSize: "13px",
    border: "0.5pt solid black"
  },
  row: {
    "&:nth-of-type(odd)": {
      backgroundColor: "#ececec"
    }
  },
  cellCenter: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "0.7500rem",
    padding: "5px !important",
    border: "0.5pt solid black"
  },
  cellLeft: {
    textAlign: "left",
    fontSize: "0.7500rem",
    padding: "5px !important",
    border: "0.5pt solid black"
  }
});

const humanize = string => {
  const stringWithoutUnderscore = string.split("_").join(" ");
  return (
    stringWithoutUnderscore.charAt(0).toUpperCase() +
    stringWithoutUnderscore.slice(1)
  );
};

const guessCellVariant = (activity, key) => {
  if (activity[key].value == undefined) {
    return "quantity";
  }
  if (parseInt(activity[key].value, 10) > 1000) {
    return "money";
  }
  if (
    activity[key].value instanceof String &&
    activity[key].value.includes(".")
  ) {
    return "percentage";
  }

  return "roundedAmountOrInteger";
};

const ActivityLine = props => {
  const { index, activity, classes, columns } = props;
  return (
    <tr key={index} className={classes.row}>
      <Cell
        variant="order"
        field="self"
        value={index + 1}
        key={"order" + index}
      />
      <Cell
        variant="text"
        field="descriptor.name"
        value={activity}
        key={"name" + index}
      />
      {columns.map(key => (
        <Cell
          field={key}
          value={activity}
          variant={guessCellVariant(activity, key)}
          decimals={0}
          key={key + "-" + index + "-" + activity.descriptor.code}
          width="5%"
        />
      ))}
    </tr>
  );
};

const PackageInvoice = props => {
  const { invoice, classes, columns } = props;
  return (
    <div>
      <h3>
        {invoice.orbfPackage.name} :{" "}
        {DatePeriods.displayName(invoice.period, "monthYear")}
      </h3>
      <table className={classes.invoiceTable} id="invoiceTable">
        <thead>
          <tr>
            <th className={classes.cellCenter}>#</th>
            <th className={classes.cellCenter}>Name</th>
            {columns.map((column, index) => (
              <th className={classes.cellCenter}>{humanize(column)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoice.activities.map((activity, index) => (
            <ActivityLine
              activity={activity}
              index={index}
              columns={columns}
              classes={classes}
            />
          ))}
        </tbody>
      </table>
      <br />
      <table className={classes.invoiceTotals}>
        {Object.keys(invoice.totals).map(totalCode => (
          <tr>
            <td className={classes.cellLeft} width="50%">
              {humanize(totalCode)}{" "}
            </td>
            <Cell
              value={invoice.totals}
              field={totalCode}
              variant={guessCellVariant(invoice.totals, totalCode)}
              decimals={0}
              width="50%"
              bold
            />
          </tr>
        ))}
      </table>
    </div>
  );
};

const InvoiceHeader = props => {
  const { orgUnit, period } = props;
  return (
    <table>
      <tbody>
        <tr>
          <td width="10%">Level 2</td>
          <td width="10%">Level 3</td>
          <td width="10%">Facility</td>
          <td width="10%">Period</td>
        </tr>
        <tr>
          <td>
            <b>{orgUnit.ancestors[1] && orgUnit.ancestors[1].name}</b>
          </td>
          <td>
            <b>{orgUnit.ancestors[2] && orgUnit.ancestors[2].name}</b>
          </td>
          <td>
            <b>{orgUnit.name}</b>
          </td>
          <td>
            <b>{DatePeriods.displayName(period, "monthYear")}</b>
            <br />
            <b>{DatePeriods.displayName(period, "quarter")}</b>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

class GenericInvoice extends Component {
  render() {
    const classes = this.props.classes;

    return (
      <div>
        <InvoiceHeader
          orgUnit={this.props.invoice.orgUnit}
          period={this.props.invoice.period}
        />

        {this.props.invoice.invoices.map(invoice => {
          const columns = Object.keys(invoice.activities[0]).filter(
            key => key !== "descriptor" && key !== "code" && key !== "name"
          );
          return (
            <PackageInvoice
              columns={columns}
              invoice={invoice}
              classes={classes}
            />
          );
        })}
      </div>
    );
  }
}

export default withStyles(styles)(GenericInvoice);
