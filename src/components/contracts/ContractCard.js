import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography, makeStyles, Grid, Divider } from "@material-ui/core";
import moment from "moment";
import { withNamespaces } from "react-i18next";

import {
  getOverlaps,
  getOrgUnitAncestors,
  getNonStandartContractFieldValue,
  getNonStandartContractFields,
} from "./utils";
import ContractsDialog from "./ContractsDialog";
import ContractField from "./ContractField";
import ContractShort from "./ContractShort";
import WarningBox from "../shared/WarningBox";

const styles = (theme) => ({
  root: {
    width: "100%",
  },
  path: {
    fontSize: 11,
    width: "100%",
  },
  overlapsList: {
    width: "100%",
    margin: 0,
  },
});

const useStyles = makeStyles((theme) => styles(theme));

const ContractCard = ({ contract, contractsOverlaps, contractsById, contractFields, fetchContracts, contracts, t }) => {
  const classes = useStyles();
  return (
    <Card
      classes={{
        root: classes.root,
      }}
    >
      <CardContent>
        <Grid container spacing={4}>
          <Grid container item xs={10}>
            <Typography color="textPrimary">{contract.orgUnit.name}</Typography>
            <Typography className={classes.path} color="textSecondary" title={contract.orgUnit.path}>
              {getOrgUnitAncestors(contract.orgUnit)}
            </Typography>
          </Grid>
          <Grid container item xs={2} justify="flex-end" alignContent="center">
            <ContractsDialog
              contract={contract}
              contracts={contracts}
              contractFields={contractFields}
              onSavedSuccessfull={fetchContracts}
            />
          </Grid>
        </Grid>
      </CardContent>
      <Divider mb={2} />
      <CardContent>
        <ContractField
          label={t("start_period")}
          value={moment(contract.fieldValues.contract_start_date).format("DD/MM/YYYY")}
        />
        <ContractField
          label={t("end_period")}
          value={moment(contract.fieldValues.contract_end_date).format("DD/MM/YYYY")}
        />
        {getNonStandartContractFields(contractFields).map((field) => (
          <ContractField key={field.id} label={field.name} value={getNonStandartContractFieldValue(contract, field)} />
        ))}
      </CardContent>
      {contractsOverlaps[contract.id] && (
        <WarningBox>
          <>
            {t("contracts.overlappingWith")} :
            <ul className={classes.overlapsList}>
              {getOverlaps(contract.id, contractsOverlaps, contractsById).map((c) => (
                <li key={c.id}>
                  <ContractShort contract={c} contractFields={contractFields} />
                </li>
              ))}
            </ul>
          </>
        </WarningBox>
      )}
    </Card>
  );
};

ContractCard.defaultProps = {
  contractsById: null,
};

ContractCard.propTypes = {
  contract: PropTypes.object.isRequired,
  contractsOverlaps: PropTypes.object.isRequired,
  contractFields: PropTypes.array.isRequired,
  contractsById: PropTypes.object,
  t: PropTypes.func.isRequired,
  fetchContracts: PropTypes.func.isRequired,
  contracts: PropTypes.array.isRequired,
};

export default withNamespaces()(ContractCard);
