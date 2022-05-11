import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import { List, DialogContent } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import Anchors from "./InvoiceAnchors";

const InvoiceButton = ({ invoiceDataLinks }) => {
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
        <DialogContent>
          {invoiceDataLinks.map((link, linkIndex) => (
            <List>
              <li key={link.invoiceName + "-" + linkIndex}>
                <Anchors invoiceDataLink={link} />
              </li>
            </List>
          ))}
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default InvoiceButton;
