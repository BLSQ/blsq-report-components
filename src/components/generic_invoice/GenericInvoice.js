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

class GenericInvoice extends Component {
  render() {
    const classes = this.props.classes;

    return (
      <div>
        {this.props.invoice.invoices.map(invoice => {
          const columns = Object.keys(invoice.activities[0]).filter(
            key => key !== "descriptor" && key !== "code" && key !== "name"
          );
          return (
            <div>
              <h1>{invoice.orbfPackage.name} : {DatePeriods.displayName(invoice.period, "monthYear")}</h1>
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
                          key={
                            key + "-" + index + "-" + activity.descriptor.code
                          }
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <br />
              <br />
              <table className={classes.invoiceTotals}>
                {Object.keys(invoice.totals).map(totalCode => (
                  <tr>
                    <td className={classes.cellLeft}>{humanize(totalCode)}</td>
                    <Cell
                      value={invoice.totals}
                      field={totalCode}
                      variant={guessCellVariant(invoice.totals, totalCode)}
                      decimals={0}
                      bold
                    />
                  </tr>
                ))}
              </table>
            </div>
          );
        })}
      </div>
    );
  }
}

export default withStyles(styles)(GenericInvoice);
