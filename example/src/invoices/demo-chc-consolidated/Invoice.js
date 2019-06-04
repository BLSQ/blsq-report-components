import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Cell } from "@blsq/blsq-report-components";
const styles = {
  invoiceFrame: {
    backgroundColor: "#ffffff",
    padding: "5px"
  },
  hLine: {
    borderBottom: "1px solid black"
  }
};

class Invoice extends Component {
  render() {
    const classes = this.props.classes;
    const totals = this.props.invoice.totals;
    return (
      <div className={classes.invoiceFrame} id="invoiceFrame">
        <h1>Demo</h1>
        <p>{this.props.invoice.orgUnit.name}</p>

        <table
          style={{
            borderCollapse: "collapse",
            fontSize: "11px",
            border: "0.5pt solid black"
          }}
        >
          <thead>
            <tr>
              <Cell variant="text" value="Order" field="self" />
              <Cell variant="text" value="National" field="self" />
              <Cell variant="text" value="District" field="self" />
              <Cell variant="text" value="Chiefdom" field="self" />
              <Cell variant="text" value="Facility" field="self" />
              <Cell variant="text" value="Value" field="self" />
            </tr>
          </thead>
          <tbody>
            {totals.map((orgUnit, index) => {
              return (
                <tr key={index}>
                  <Cell variant="order" value={index + 1} field="self" />
                  <Cell
                    variant="text"
                    value={orgUnit.orgUnit.ancestors[0].name}
                    field="self"
                  />
                  <Cell
                    variant="text"
                    value={orgUnit.orgUnit.ancestors[1].name}
                    field="self"
                  />
                  <Cell
                    variant="text"
                    value={orgUnit.orgUnit.ancestors[2].name}
                    field="self"
                  />
                  <Cell
                    variant="text"
                    value={orgUnit.orgUnit.name}
                    field="self"
                    bold
                  />
                  <Cell
                    variant="money"
                    value={orgUnit}
                    field="total"
                    decimals={0}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default withStyles(styles)(Invoice);
