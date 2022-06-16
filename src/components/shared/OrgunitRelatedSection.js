import React from "react";
import { useTranslation } from "react-i18next";

const OrgunitRelatedSection = ({ messageKey, children, orgUnitSectionStyle }) => {
  const { t } = useTranslation();
  debugger;
  return (
    <div style={orgUnitSectionStyle ? orgUnitSectionStyle : { margin: "inherit" }}>
      <h3>{t(messageKey)}</h3>
      {children}
    </div>
  );
};

export default OrgunitRelatedSection;
