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
              <Cell variant="text" value="dataElement" field="self" />
              <Cell variant="text" value="Value" field="self" />
            </tr>
          </thead>
          <tbody>
            {this.props.invoice.totals.map((de, index) => {
              console.log(de);
              return (
                <tr key={index}>
                  <Cell variant="order" value={index} field="self" />
                  <Cell
                    variant="text"
                    value={de.total.name}
                    field="self"
                    bold
                  />
                  <Cell variant="money" value={de} field="total" decimals={0} />
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
