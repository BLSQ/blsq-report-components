import React, { Component } from "react";

class Invoice extends Component {
  render() {
    const orgUnits = this.props.invoice.orgUnits;

    return (
      <div id="invoiceFrame">
        <h1>
          Demo : {orgUnits.length} at {this.props.invoice.period}
        </h1>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Savings</th>
            </tr>
          </thead>
          <tbody>
            {orgUnits.map(orgUnit => (
              <tr>
                <td>{orgUnit.name}</td>
                <td>{orgUnit.ancestors.map(a => a.name).join(" ")}</td>
                <td>{orgUnit.codes.join(" ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Invoice;
