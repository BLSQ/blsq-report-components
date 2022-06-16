import React from "react";
import { useTranslation } from "react-i18next";
import OrgunitRelatedSection from "../shared/OrgunitRelatedSection";
import InvoiceLinks from "./InvoiceLinks";

const InvoiceLinksSection = ({ invoiceLinksProps, orgUnit, period }) => {
  const { t } = useTranslation();
  return (
    <OrgunitRelatedSection messageKey="dataEntry.invoices">
      <div style={{ marginLeft: "20px", marginTop: "-10px" }}>
        <InvoiceLinks {...invoiceLinksProps} t={t} orgUnit={orgUnit} period={period} maxInvoiceLength={100} />
      </div>
    </OrgunitRelatedSection>
  );
};

export default InvoiceLinksSection;
