import React from "react";
import { useTranslation } from "react-i18next";
import OrgunitRelatedSection from "../shared/OrgunitRelatedSection";
import InvoiceLinks from "./InvoiceLinks";

const InvoiceLinksSection = ({ invoiceLinksProps, orgUnit, period, orgUnitSectionStyle }) => {
  const { t } = useTranslation();
  return (
    <OrgunitRelatedSection messageKey="dataEntry.invoices" orgUnitSectionStyle={orgUnitSectionStyle}>
        <InvoiceLinks {...invoiceLinksProps} t={t} orgUnit={orgUnit} period={period} maxInvoiceLength={100} />
    </OrgunitRelatedSection>
  );
};

export default InvoiceLinksSection;
