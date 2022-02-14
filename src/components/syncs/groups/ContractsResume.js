import React from "react";
import { useTranslation } from "react-i18next";

const ContractsResume = ({ contractInfos, progress }) => {
  const { t } = useTranslation();
  return (
    <div>
      {contractInfos && (
        <span>
          {contractInfos.length} orgunits, {contractInfos.filter((c) => c.synchronized).length}{" "}
          {t("groupSync.alreadySynchronized")}
        </span>
      )}
    </div>
  );
};

export default ContractsResume;
