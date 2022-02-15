import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormControl, LinearProgress, Paper, Typography } from "@material-ui/core";

import { makeStyles } from "@material-ui/styles";
import OrgUnitAutoComplete from "./OrgUnitAutoComplete";
import OuPicker from "./OuPicker";

import PeriodPicker from "../shared/PeriodPicker";
import searchOrgunit from "./searchOrgunit";
import SelectionResultsContainer from "./SelectionResultsContainer";

import useDebounce from "../shared/useDebounce";

const styles = (theme) => ({
  paper: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    minHeight: "600px",
  }),
  table: {
    minWidth: "100%",
  },
  filters: {
    marginLeft: "30px",
  },
  periodContainer: {
    margin: theme.spacing(2, 1, 1, 1),
    width: 300,
  },
});

const useStyles = makeStyles(styles);

const updateHistory = (history, parent, period, searchValue, defaultPathName) => {
  const parentParam = parent ? "&parent=" + parent : "";
  history.replace({
    pathname: defaultPathName,
    search: "?q=" + searchValue + "&period=" + period + parentParam,
  });
};

const InvoiceSelectionContainer = (props) => {
  const {
    ouSearchValue,
    currentUser,
    period,
    parent,
    contractedOrgUnitGroupId,
    dhis2,
    defaultPathName,
    history,
    topLevelsOrgUnits,
    periodFormat,
    resultsElements,
  } = props;
  const [orgUnits, setOrgUnits] = useState();
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(ouSearchValue);
  const [searchPeriod, setSearchPeriod] = useState(period);
  const [debouncedSearchValue, setDebouncedSearchValue] = useDebounce(ouSearchValue);

  useEffect(() => {
    const search = async () => {
      if (!currentUser) {
        return;
      }
      setLoading(true);
      try {
        const newOrgUnits = await searchOrgunit({
          searchValue: debouncedSearchValue,
          user: currentUser,
          period,
          parent,
          contractedOrgUnitGroupId,
          dhis2,
        });

        setOrgUnits(newOrgUnits);
        if (debouncedSearchValue !== ouSearchValue) {
          updateHistory(history, parent, period, debouncedSearchValue, defaultPathName);
        }
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedSearchValue, currentUser, period, parent, contractedOrgUnitGroupId, dhis2, defaultPathName, history]);

  const onOuSearchChange = async (event) => {
    setDebouncedSearchValue(event.target.value);
    setSearchValue(event.target.value);
  };

  const onPeriodChange = (newPeriod) => {
    setSearchPeriod(newPeriod);
    updateHistory(history, parent, newPeriod, debouncedSearchValue, defaultPathName);
  };

  const onParentOrganisationUnit = (orgUnitId) => {
    updateHistory(history, orgUnitId, period, debouncedSearchValue, defaultPathName);
  };
  const classes = useStyles();
  const { t } = useTranslation();
  const SelectionResults = resultsElements || SelectionResultsContainer;

  return (
    <Paper className={classes.paper} square>
      <Typography variant="h6" component="h6" gutterBottom>
        {t("invoices.search.title")}
      </Typography>
      <div className={classes.filters}>
        <OrgUnitAutoComplete
          organisationUnits={topLevelsOrgUnits}
          onChange={onParentOrganisationUnit}
          selected={parent}
        />
        <br />
        <OuPicker onOuSearchChange={onOuSearchChange} ouSearchValue={searchValue} />{" "}
        <FormControl className={classes.periodContainer}>
          <PeriodPicker period={searchPeriod} onPeriodChange={onPeriodChange} periodFormat={periodFormat} />
        </FormControl>
        <br />
        {loading ? <LinearProgress variant="query" /> : ""}
      </div>
      <br />
      <br />
      <br />
      <SelectionResults {...props} orgUnits={orgUnits?.organisationUnits} pager={orgUnits?.pager}/>
    </Paper>
  );
};

export default InvoiceSelectionContainer;
