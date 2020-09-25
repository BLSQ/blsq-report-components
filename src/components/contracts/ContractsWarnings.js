import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { withNamespaces } from "react-i18next";
import moment from "moment";

import containers from "../styles/containers";
import icons from "../styles/icons";

import ContractsNotVisibleOverlaps from "./ContractsNotVisibleOverlaps";

const styles = (theme) => ({
  ...containers(theme),
  ...icons(theme),
});

//  ! attention !
// - le contrat 4 est plus large que le contrat principal
const checkSubContractCoverage = (subContracts, mainContracts) => {
  if (mainContracts.length === 0) return "";
  let mainContractStartDate;
  let mainContractEndDate;
  mainContracts.contracts.forEach((c) => {
    if (
      !mainContractStartDate ||
      (mainContractStartDate &&
        moment(mainContractStartDate).isAfter(
          moment(c.fieldValues.contract_start_date),
        ))
    ) {
      mainContractStartDate = c.fieldValues.contract_start_date;
    }
    if (
      !mainContractEndDate ||
      (mainContractEndDate &&
        moment(mainContractEndDate).isBefore(
          moment(c.fieldValues.contract_end_date),
        ))
    ) {
      mainContractEndDate = c.fieldValues.contract_end_date;
    }
  });
  const warnings = [];
  subContracts.contracts.forEach((c) => {
    if (
      moment(mainContractStartDate).isAfter(
        moment(c.fieldValues.contract_start_date),
      ) ||
      moment(mainContractEndDate).isBefore(
        moment(c.fieldValues.contract_end_date),
      )
    ) {
      warnings.push(c);
    }
  });
  return warnings;
};

const useStyles = makeStyles((theme) => styles(theme));

const ContractsWarnings = ({
  subContracts,
  mainContracts,
  t,
  allContracts,
  allContractsOverlaps,
}) => {
  const classes = useStyles();
  const subWarnings = checkSubContractCoverage(subContracts, mainContracts);
  return (
    <Box display="flex" justifyContent="center">
      <Box className={classes.warningBox}>
        {subWarnings.length > 0 && (
          <Box>
            <span className={classes.warningIcon}>⚠️</span>
            {subWarnings.length === 1 &&
              t("contracts.subContractCoveragesWarningSingle", {
                rowIndex: subWarnings[0].rowIndex,
              })}
            {subWarnings.length > 1 &&
              t("contracts.subContractCoveragesWarningPlural", {
                rowIndexes: subWarnings.map((sw) => sw.rowIndex).join(", "),
              })}
          </Box>
        )}
        <ContractsNotVisibleOverlaps
          allContracts={allContracts}
          mainContracts={mainContracts}
          subContracts={subContracts}
          allContractsOverlaps={allContractsOverlaps}
        />
      </Box>
    </Box>
  );
};

ContractsWarnings.propTypes = {
  subContracts: PropTypes.object.isRequired,
  mainContracts: PropTypes.object.isRequired,
  allContracts: PropTypes.array.isRequired,
  allContractsOverlaps: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withNamespaces()(ContractsWarnings);
