import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import InvoiceSignature from "./InvoiceSignature";
import Grid from "@material-ui/core/Grid";

const styles = theme => ({
  invoiceFrame: {
    backgroundColor: "#ffffff",
    padding: "5px",
    "page-break-inside": "avoid",
    "font-size": "10pt"
  },
  total: {
    fontWeight: "bold",
    fontSize: "0.9000rem"
  }
});

class InvoiceSignatures extends Component {
  render() {
    const classes = this.props.classes;
    console.info("PROPS :", this.props);

    return (
      <div className={classes.invoiceFrame} id="invoiceFrame">
        <Grid container className={classes.root} spacing={16}>
          <Grid item xs={12}>
            <Grid
              container
              className={classes.demo}
              justify="center"
              spacing={24}
            >
              <Grid item>
                <InvoiceSignature mainLabel="Checked by PRBFO" signature={this.props.invoice.signatures.sign1}/>
              </Grid>

              <Grid item>
                <InvoiceSignature mainLabel="Approved By Data Analyst" signature={this.props.invoice.signatures.sign2}/>
              </Grid>

              <Grid item>
                <InvoiceSignature mainLabel="Passed for payment Accountant" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(InvoiceSignatures);
