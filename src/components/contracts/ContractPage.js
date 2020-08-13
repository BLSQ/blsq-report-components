import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import { withNamespaces } from "react-i18next";
import { Breadcrumbs, Grid, makeStyles } from "@material-ui/core";
import { Link, withRouter } from "react-router-dom";
import { useDispatch } from "react-redux";

import PluginRegistry from "../core/PluginRegistry";
import ContractsResume from "./ContractsResume";
import ContractCard from "./ContractCard";
import linksStyles from "../styles/links";
import { setIsLoading } from "../redux/actions/load";

const styles = (theme) => ({
  ...linksStyles(theme),
});

const useStyles = makeStyles((theme) => styles(theme));
const ContractPage = ({ match, location, t }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [contractsDatas, setContractsDatas] = useState({
    contracts: [],
    contractsById: null,
    contractsOverlaps: {},
    contractFields: [],
  });

  const contractService = PluginRegistry.extension("contracts.service");
  useEffect(() => {
    if (contractService) {
      dispatch(setIsLoading(true));
      contractService
        .fetchContracts(match.params.orgUnitId, true)
        .then((contractsDatas) => {
          setContractsDatas({
            ...contractsDatas,
          });

          dispatch(setIsLoading(false));
        });
    }
  }, [setContractsDatas, contractService, match.params.orgUnitId, dispatch]);
  const overlapsTotal = Object.keys(contractsDatas.contractsOverlaps).length;

  return (
    <>
      <Grid container item xs={12} spacing={4}>
        <Grid container item xs={12} md={8}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link className={classes.link} to={`/contracts${location.search}`}>
              {t("contracts.title")}
            </Link>

            <Typography color="textPrimary">
              {contractsDatas.contracts && contractsDatas.contracts.length > 0
                ? contractsDatas.contracts[0].orgUnit.name
                : "..."}
            </Typography>
          </Breadcrumbs>
        </Grid>
        <Grid container item xs={12} md={4} justify="flex-end">
          <ContractsResume
            filteredContracts={contractsDatas.contracts}
            contracts={contractsDatas.contracts}
            overlapsTotal={overlapsTotal}
          />
        </Grid>
      </Grid>

      <Grid container item xs={12} spacing={4}>
        {contractsDatas.contracts.map((contract) => (
          <Grid container item xs={12} md={4} key={contract.id}>
            <ContractCard
              contract={contract}
              contractsById={contractsDatas.contractsById}
              contractsOverlaps={contractsDatas.contractsOverlaps}
              contractFields={contractsDatas.contractFields}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

ContractPage.propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withRouter(withNamespaces()(ContractPage));
