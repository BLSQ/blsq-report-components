import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Cell } from "@blsq/blsq-report-components";
import DoneIcon from "@material-ui/icons/Done";
import CloseIcon from "@material-ui/icons/Close";
import InvoiceSignatures from "./InvoiceSignatures";
import { withTranslation } from "react-i18next";
import { DatePeriods } from "@blsq/blsq-report-components";

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
    period: "2016Q4"
  },
  score: {
    code: "code",
    value: 94.45698921323,
    name: "my super element",
    period: "2016Q4"
  },
  amount: {
    code: "code",
    value: 4565.45698921323,
    name: "Total amount to pay",
    period: "2019Q4"
  },
  advance: {
    code: "code",
    value: 0,
    name: "Avance à payer",
    period: "2019Q4"
  },
  reliquat: {
    code: "code",
    value: -2795.806989213,
    name: "Reliquat à payer",
    period: "2019Q4"
  }
};

const renderer = (value, raw_value) => {
  if (raw_value === 1) {
    return <DoneIcon style={{ color: "green" }} />;
  }
  return <CloseIcon style={{ color: "red" }} />;
};

class Invoice extends Component {
  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.invoiceFrame} id="invoiceFrame">
        <h1>Demo</h1>
        <p>{this.props.invoice.orgUnit.name}</p>
        <p>
          {this.props.t("generated_at")}:{" "}
          {this.props.invoice.generatedAt.toLocaleString()}
        </p>
        <p>
          {this.props.t("period")}:{" "}
          {DatePeriods.monthNameYear(this.props.period, "month")}
        </p>

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
                unit=" $"
              />
            </tr>
            <tr>
              <Cell variant="order" value="2" field="self" />
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
            <tr>
              <Cell variant="order" value="3" field="self" />
              <Cell variant="text" value="AmountToPay" field="self" bold />
              <Cell variant="AmountToPay" value={activity} field="amount" />
              <Cell
                variant="AmountToPay"
                value={activity}
                field="amount"
                decimals={4}
              />
              <Cell
                variant="AmountToPay"
                value={activity}
                field="amount"
                decimals={0}
              />
            </tr>
            <tr>
              <Cell variant="order" value="4" field="self" />
              <Cell variant="text" value="AmountToPay" field="self" bold />
              <Cell variant="AmountToPay" value={activity} field="advance" />
              <Cell
                variant="AmountToPay"
                value={activity}
                field="advance"
                decimals={4}
              />
              <Cell
                variant="AmountToPay"
                value={activity}
                field="advance"
                decimals={0}
              />
            </tr>
            <tr>
              <Cell variant="order" value="5" field="self" />
              <Cell variant="text" value="AmountToPay" field="self" bold />
              <Cell variant="AmountToPay" value={activity} field="reliquat" />
              <Cell
                variant="AmountToPay"
                value={activity}
                field="reliquat"
                decimals={4}
              />
              <Cell
                variant="AmountToPay"
                value={activity}
                field="reliquat"
                decimals={0}
              />
            </tr>
            <tr>
              <Cell
                variant="text"
                field="self"
                value={"link to google"}
                href="https://google.com"
                bold
                colSpan={4}
              />
              <Cell
                variant="text"
                field="self"
                value={"link to to invoice"}
                href="./index.html#/invoices/2017Q1/cDw53Ej8rju/demo-chc"
                bold
                colSpan={4}
              />
            </tr>
            <tr>
              <Cell
                variant="quantity"
                field="self"
                value={1}
                href="https://google.com"
                renderer={renderer}
                colSpan={4}
              />
              <Cell
                variant="quantity"
                field="self"
                value={0}
                href="https://google.com"
                renderer={renderer}
                colSpan={4}
              />
            </tr>
          </tbody>
        </table>

        <br />
        <InvoiceSignatures invoice={this.props.invoice} />
      </div>
    );
  }
}

export default withStyles(styles)(withTranslation()(Invoice));
