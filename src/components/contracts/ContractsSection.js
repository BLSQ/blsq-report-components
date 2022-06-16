import React from "react";
import { useTranslation } from "react-i18next";
import OrgunitRelatedSection from "../shared/OrgunitRelatedSection";
import ContractSummary from "../shared/contracts/ContractSummary";

const ContractsSection = ({ orgUnit }) => {
  const { t } = useTranslation();
  return (
    <OrgunitRelatedSection messageKey={"dataEntry.activeContracts"}>
      {orgUnit.activeContracts &&
        orgUnit.activeContracts.map((c) => (
          <div style={{ marginLeft: "20px", marginTop: "-10px" }}>
            <ContractSummary orgUnit={orgUnit} contract={c} />
          </div>
        ))}
      {(orgUnit.activeContracts === undefined || orgUnit.activeContracts.length === 0) && (
        <div style={{ marginLeft: "20px" }}>{t("noActiveContracts")}</div>
      )}
    </OrgunitRelatedSection>
  );
};

export default ContractsSection;
