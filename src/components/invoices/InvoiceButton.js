import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import { List, DialogContent, DialogTitle, Divider } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import InvoiceAnchors from "./InvoiceAnchors";

const InvoiceButton = ({ orgUnit, invoiceDataLinks }) => {
  const { t } = useTranslation();
  const [invoiceSelectionOpen, setInvoiceSelectionOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setInvoiceSelectionOpen(true)} color="primary">
        {t("show_avalaible_invoices")}
      </Button>
      <Dialog
        open={invoiceSelectionOpen}
        onClose={() => setInvoiceSelectionOpen(false)}
        aria-labelledby="invoice-selection-dialog"
      >
        <DialogTitle>{orgUnit && orgUnit.name}</DialogTitle>
        <DialogContent>
          {invoiceDataLinks.map((link, linkIndex) => (
            <List key={link.invoiceName + "-" + linkIndex}>
              <li >
                <InvoiceAnchors invoiceDataLink={link} />
                {invoiceDataLinks.length - 1 !== linkIndex && <Divider />}
              </li>
            </List>
          ))}
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default InvoiceButton;
