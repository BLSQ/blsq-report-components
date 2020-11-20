import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import moment from "moment";
import { makeStyles } from "@material-ui/core";
import { getOptionFromField } from "./utils";
const styles = (theme) => ({
  root: {
    width: "100%",
    margin: 0,
  },
});

const useStyles = makeStyles((theme) => styles(theme));
const ContractShort = ({ contract, contractFields }) => {
  const classes = useStyles();
  if (!contract) return null;
  return (
    <p className={classes.root}>
      {moment(contract.fieldValues.contract_start_date).format("DD/MM/YYYY")}
      {" - "}
      {moment(contract.fieldValues.contract_end_date).format("DD/MM/YYYY")}
      {": "}
      {contractFields
        .filter((f) => contract.codes.includes(contract.fieldValues[f.code]))
        .map((f, i) => {
          if (!contract.fieldValues || !contract.fieldValues[f.code]) return "";
          return (
            <span key={f.id}>
              {i > 0 && ", "}
              {getOptionFromField(f, contract.fieldValues[f.code]).label}
            </span>
          );
        })}
    </p>
  );
};

ContractShort.defaultProps = {
  contract: null,
  contractFields: [],
};

ContractShort.propTypes = {
  contract: PropTypes.object,
  contractFields: PropTypes.array,
};

export default withTranslation()(ContractShort);
