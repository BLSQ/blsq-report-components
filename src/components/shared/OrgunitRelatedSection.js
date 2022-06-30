import React from "react";
import { useTranslation } from "react-i18next";

const OrgunitRelatedSection = ({ messageKey, children, orgUnitSectionStyle }) => {
  const { t } = useTranslation();
  return (
    <div style={orgUnitSectionStyle ? orgUnitSectionStyle : { margin: "inherit" }}>
      <h3>{t(messageKey)}</h3>
      <div style={{ margin: "inherit" }}>{children}</div>
    </div>
  );
};

export default OrgunitRelatedSection;
