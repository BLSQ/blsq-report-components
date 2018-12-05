import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Cell } from "blsq-report-components";

const styles = {
  invoiceFrame: {
    backgroundColor: "#ffffff",
    padding: "5px"
  },
  hLine: {
    borderBottom: "1px solid black"
  }
};

const activity = {
  total: {
    code: "code",
    value: 4565.45698921323,
    name: "my super element",
    period:"2016Q4"
  },
  score: {
    code: "code",
    value: 94.45698921323,
    name: "my super element",
    period:"2016Q4"
  }
};

class Invoice extends Component {
  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.invoiceFrame} id="invoiceFrame">
        <h1>Demo</h1>
        <p>{this.props.invoice.orgUnit.name}</p>
        <p>Generated at: {this.props.invoice.generatedAt.toLocaleString()}</p>

        <h2>Cell show case</h2>
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
              <Cell variant="text" value="Variant" field="self" />
              <Cell variant="text" value="default decimals" field="self" />
              <Cell variant="text" value="4 decimals" field="self" />
              <Cell variant="text" value="0 decimals" field="self" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <Cell variant="order" value="1" field="self" />
              <Cell variant="text" value="money" field="self" bold />
              <Cell variant="money" value={activity} field="total" />
              <Cell
                variant="money"
                value={activity}
                field="total"
                decimals={4}
              />
              <Cell
                variant="money"
                value={activity}
                field="total"
                decimals={0}
              />
            </tr>
            <tr>
              <Cell variant="order" value="1" field="self" />
              <Cell variant="text" value="percentage" field="self" bold />
              <Cell variant="percentage" value={activity} field="score" />
              <Cell
                variant="percentage"
                value={activity}
                field="score"
                decimals={4}
              />
              <Cell
                variant="percentage"
                value={activity}
                field="score"
                decimals={0}
              />
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default withStyles(styles)(Invoice);
