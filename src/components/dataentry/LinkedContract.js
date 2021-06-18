import React, { useState } from "react";
import { InputLabel, FormControl, Select, MenuItem, Button, makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";
import DatePeriods from "../../support/DatePeriods";
import { useTranslation, withTranslation } from "react-i18next";

const styles = (theme) => ({
  formControl: {
    width: "10%",
    verticalAlign: "bottom",
  },
});
const useStyles = makeStyles((theme) => styles(theme));
const LinkedContract = ({ linkedContracts, period }) => {
  const { t, i18n } = useTranslation();
  const classes = useStyles();
  let [selectedContract, setSelectedContract] = useState(undefined);
  let handleLinkedContractChange = (event) => {
    if (selectedContract === undefined || event.target.value.id !== selectedContract.id) {
      setSelectedContract(event.target.value);
    }
  };

  return (
    <div>
    <FormControl color="inherit" className={classes.formControl}>
      <InputLabel color="inherit">{t("dataEntry.otherRelatedContracts")} : </InputLabel>
      <Select color="inherit" value={selectedContract && selectedContract.name} onChange={handleLinkedContractChange}>
        {linkedContracts &&
          linkedContracts.map((contract) => {
            return (
              <MenuItem key={contract.orgUnit.id} value={contract.orgUnit}>
                {contract.orgUnit.name || "Select"}
              </MenuItem>
            );
          })}
      </Select>
    </FormControl>
    {selectedContract &&
    <Button
      variant="text"
      color="primary"
      size="small"
      component={Link}
      to={"/dataEntry/" + selectedContract.id + "/" + period}
      title={period}
    >
      {DatePeriods.displayName(period, "quarter")}
    </Button>
  }
    </div>
  );
};

export default withTranslation()(LinkedContract);
