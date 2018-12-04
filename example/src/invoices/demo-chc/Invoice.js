import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
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
        <p>Generated at: {this.props.invoice.generatedAt.toLocaleString()}</p>
      </div>
    );
  }
}

export default withStyles(styles)(Invoice);
