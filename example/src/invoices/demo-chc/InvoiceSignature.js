import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  signature: {
    border: "1px solid black",
    padding: "10px",
    fontSize: "11px"
  },
  row_val: {height: "45px"}
});

class InvoiceSignature extends Component {
  render() {
    const classes = this.props.classes;

    return (
      <div className={classes.signature}>
        {this.props.mainLabel}

        <table width="50%">
          <tbody>
            <tr>
              <td nowrap="true">Name</td>
              <td> :</td>
              <td nowrap="true">-----------------------------------------</td>
            </tr>
            <tr>
              <td className={classes.row_val} nowrap="true">
                Signature
              </td>
              <td className={classes.row_val}>:</td>
              {
                this.props.signature ? (<td className={classes.row_val} nowrap="true">
                    <img src={this.props.signature} width="160px" height="45px" alt=""/>
                </td>) : (<td className={classes.row_val} nowrap="true">
                    -----------------------------------------
                </td>)
              }
            </tr>
            <tr>
              <td nowrap="true">Date (dd/mm/yyyy): </td>
              <td> :</td>
              <td nowrap="true">-------------/-------------/-------------</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default withStyles(styles)(InvoiceSignature);
