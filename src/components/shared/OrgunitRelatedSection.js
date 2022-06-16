import React from "react";
import { useTranslation } from "react-i18next";

const OrgunitRelatedSection = ({ messageKey, children }) => {
  const { t } = useTranslation();
  return (
    <div style={{ marginLeft: "20px" }}>
      <h3>{t(messageKey)}</h3>
      {children}
    </div>
  );
};

export default OrgunitRelatedSection;
