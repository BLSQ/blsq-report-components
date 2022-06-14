import React from "react";
import { Link } from "react-router-dom";
import { Chip, IconButton } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";

const ActiveContractContainer = ({ orgUnit, contract, t }) => {
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
        <Chip key={c + "_" + index} label={c} style={{ margin: "5px" }} />
      ))}
    </div>
  );
};

export default ActiveContractContainer;
