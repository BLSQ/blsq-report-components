import { Button, Grid, Typography } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";
import PluginRegistry from "../core/PluginRegistry";
import ContractsStats from "./ContractsStats";
import PeriodPicker from "./PeriodPicker";
import { getEndDateFromPeriod } from "./utils/periodsUtils";

const MassContractUpdate = ({ filteredContracts, onUpdate }) => {
  const { t } = useTranslation();
  const contractService = PluginRegistry.extension("contracts.service");

  const [progress, setProgress] = React.useState(undefined);
  const [updating, setUpdating] = React.useState(false);
  const [currentContract, setCurrentContract] = React.useState({
    endPeriod: "202112",
    fieldValues: { contract_end_date: "2021-12-31" },
  });

  const updateAll = async () => {
    setUpdating(true);
    let index = 1;
    for (let contract of filteredContracts) {
      setProgress(
        "updating  " +
          contract.orgUnit.name +
          " with " +
          currentContract.fieldValues.contract_end_date +
          "    " +
          index +
          "/" +
          filteredContracts.length,
      );

      contract.fieldValues.contract_end_date = currentContract.fieldValues.contract_end_date;
      await contractService.updateContract(contract);
      index = index + 1;
    }
    setUpdating(false);
    onUpdate();
  };

  const handleChange = (key, value, subKey) => {
    const updatedContract = {
      ...currentContract,
      [key]: !subKey
        ? value
        : {
            ...currentContract[key],
            [subKey]: value,
          },
    };
    setCurrentContract(updatedContract);
  };

  return (
    <Grid container direction="column" justify="flex-start" alignItems="flex-start">
      <Grid item>
        <Typography variant="h4">This mass update will impact these contracts</Typography>
        <br></br>
        <ContractsStats filteredContracts={filteredContracts}></ContractsStats>
      </Grid>
      <Grid item>
        <Typography variant="h4">Select the fields to udpate and the value</Typography>
        <br></br>
        <PeriodPicker
          contract={currentContract}
          currentPeriod={currentContract.endPeriod}
          min={currentContract.startPeriod}
          fieldName={t("end_period")}
          mode="end"
          onPeriodChange={(endPeriod) =>
            handleChange("fieldValues", getEndDateFromPeriod(endPeriod), "contract_end_date")
          }
        />
      </Grid>
      <Grid item>
        <br></br>
        {progress} <br></br>
        <Button color="primary" variant="contained" onClick={updateAll} disabled={updating}>
          Update all {filteredContracts.length} contracts
        </Button>
      </Grid>
    </Grid>
  );
};

export default MassContractUpdate;
