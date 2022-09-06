import React from "react";
import { Link } from "react-router-dom";
import { Chip, IconButton } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { useTranslation } from "react-i18next";
import PluginRegistry from "../../core/PluginRegistry";

const ContractSummary = ({ orgUnit, contract }) => {
  const { t } = useTranslation();
  const program = PluginRegistry.extension("contracts.program")

  const options = program.programStages.flatMap(ps => ps.programStageDataElements).map(psde => psde.dataElement).flatMap(de => de.optionSet?.options).filter(o => o)

  const optionsByCode = _.keyBy(options, o => o.code)

  return (
    <div>
      {t("dataEntry.contractFrom")} <code>{contract.startPeriod}</code> {t("dataEntry.contractTo")}{" "}
      <code>{contract.endPeriod}</code>{" "}
      <Link
        to={
          "/contracts/" +
          ((contract && contract.fieldValues && contract.fieldValues.contract_main_orgunit) || orgUnit.id)
        }
      >
        <IconButton>
          <InfoIcon color="action" />
        </IconButton>
      </Link>{" "}
      {contract.codes.map((c, index) => (
        <Chip key={c + "_" + index} title={c} label={optionsByCode[c] ? optionsByCode[c].name : c} style={{ margin: "5px" }} />
      ))}
    </div>
  );
};

export default ContractSummary;
