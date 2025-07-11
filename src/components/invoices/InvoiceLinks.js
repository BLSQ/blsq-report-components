import React from "react";
import PluginRegistry from "../core/PluginRegistry";
import DatePeriods from "../../support/DatePeriods";
import { List } from "@material-ui/core";
import InvoiceButton from "./InvoiceButton";
import InvoiceAnchors from "./InvoiceAnchors";

const buildInvoiceTypes = (invoices, orgUnit, period, hideCurrentInvoice, invoiceCode) => {
  let codes = invoices.getInvoiceTypeCodes(orgUnit, period);
  if (hideCurrentInvoice === true) {
    codes.splice(codes.indexOf(invoiceCode), 1);
  }

  if (codes === undefined || codes.length === 0) {
    return [];
  }

  return invoices.getInvoiceTypes(codes, period);
};

const buildInvoiceLink = (orgUnit, quarterPeriod, invoiceType) => {
  return {
    invoiceName: invoiceType.name,
    links: DatePeriods.split(quarterPeriod, invoiceType.frequency).map((subPeriod) => ({
      key: invoiceType.code + "-" + subPeriod + "-" + orgUnit.id,
      to: "/reports/" + subPeriod + "/" + orgUnit.id + "/" + invoiceType.code,
      title: subPeriod,
      label: DatePeriods.displayName(
        subPeriod,
        invoiceType.periodFormat ||
          (invoiceType.frequency === "quarterly"
            ? "quarter"
            : invoiceType.frequency === "sixMonthly"
            ? "sixMonth"
            : "monthYear"),
      ),
    })),
  };
};

const InvoiceLinks = ({ t, orgUnit, period, hideCurrentInvoice, invoiceCode, maxInvoiceLength }) => {
  const Invoices = PluginRegistry.extension("invoices.invoices");
  const invoiceTypes = buildInvoiceTypes(Invoices, orgUnit, period, hideCurrentInvoice, invoiceCode);
  const quarterPeriod = DatePeriods.split(period, DatePeriods.getDefaultQuarterFrequency())[0];

  const invoiceDataLinks = invoiceTypes.map((type) => {
    return buildInvoiceLink(orgUnit, quarterPeriod, type);
  });

  const determineInvoiceLength = maxInvoiceLength ? maxInvoiceLength : 1;

  const showAll = hideCurrentInvoice === true ? false : !(invoiceTypes.length > determineInvoiceLength);

  return (
    <>
      {!showAll && <InvoiceButton invoiceDataLinks={invoiceDataLinks} orgUnit={orgUnit} />}

      {showAll && (
        <List  style={{paddingTop : "0px"}}>
          {invoiceDataLinks.map((link, linkIndex) => (
            <li key={link.invoiceName + "-" + linkIndex}>
              <InvoiceAnchors invoiceDataLink={link} />
            </li>
          ))}
        </List>
      )}
    </>
  );
};

export default InvoiceLinks;
