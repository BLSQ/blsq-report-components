import React, { useState } from "react";
import { InputLabel, FormControl, Select, MenuItem, Button, makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useTranslation, withTranslation } from "react-i18next";

const styles = (theme) => ({
  formControl: {
    width: "20%",
    verticalAlign: "bottom",
  },
});

const useStyles = makeStyles((theme) => styles(theme));

const LinkedContract = ({ linkedContracts, orgUnit, period }) => {
  const { t, i18n } = useTranslation();
  const classes = useStyles();
  let [selectedContract, setSelectedContract] = useState(linkedContracts[0]);
  let handleLinkedContractChange = (event) => {
    if (selectedContract === undefined || event.target.value.id !== selectedContract.id) {
      setSelectedContract(event.target.value);
    }
  };
  const mainContractOrgunit = linkedContracts.map((c) => c.fieldValues.contract_main_orgunit).filter((v) => v)[0];
  const filteredContracts = linkedContracts.filter((c) => c.orgUnit.id != orgUnit.id);
  return (
    <div>
      <FormControl color="inherit" className={classes.formControl}>
        <InputLabel color="inherit">{t("dataEntry.otherRelatedContracts")} : </InputLabel>
        <Select
          color="inherit"
          value={selectedContract && selectedContract.name}
          onChange={handleLinkedContractChange}
          value={selectedContract}
        >
          {filteredContracts.map((contract) => {
            return (
              <MenuItem
                selected={selectedContract && selectedContract.id == contract.id}
                key={contract.orgUnit.id}
                value={contract}
                title={contract.orgUnit.ancestors
                  .slice(1)
                  .map((a) => a.name)
                  .join(" > ")}
              >
                {contract.orgUnit.name} {mainContractOrgunit == contract.orgUnit.id ? "*" : ""}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      {selectedContract && (
        <Button
          variant="text"
          color="primary"
          size="small"
          component={Link}
          to={"/dataEntry/" + selectedContract.orgUnit.id + "/" + period}
          title={period}
        >
          {t("dataEntry.seeLinkedData")}
        </Button>
      )}
    </div>
  );
};

export default withTranslation()(LinkedContract);
