import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, FormControl, LinearProgress, Paper, Typography } from "@material-ui/core";
import CachedIcon from "@material-ui/icons/Cached";

import { makeStyles } from "@material-ui/styles";
import OrgUnitAutoComplete from "./OrgUnitAutoComplete";
import OuPicker from "./OuPicker";

import PeriodPicker from "../shared/PeriodPicker";
import searchOrgunit from "./searchOrgunit";
import SelectionResultsContainer from "./SelectionResultsContainer";

import useDebounce from "../shared/useDebounce";
import InvoiceTreeView from "./InvoiceTreeView";
import InvoiceTraditionalView from "./InvoiceTraditionalView";

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
  const [traditionalView, setTraditionalView] = useState(true);

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
  }, [
    debouncedSearchValue,
    currentUser,
    period,
    parent,
    contractedOrgUnitGroupId,
    dhis2,
    defaultPathName,
    history,
    traditionalView,
  ]);

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

  const toggleView = (useTraditionalView) => {
    setTraditionalView(useTraditionalView);
  };

  const switchToTreeView = "Switch to orgunit tree view";
  const switchToTraditionalView = "Switch to traditional view";
  const viewLabel = traditionalView ? switchToTreeView : switchToTraditionalView;

  return (
    <Paper className={classes.paper} square>
      <Typography variant="h6" component="h6" gutterBottom>
        {t("invoices.search.title")}
      </Typography>
      <Button onClick={() => toggleView(!traditionalView)} startIcon={<CachedIcon />}>
        {viewLabel}
      </Button>
      <br />
      <br />
      <br />
      <div className={classes.filters}>
        {!traditionalView && <InvoiceTreeView invoiceLinksProps={props} searchPeriod={searchPeriod} t={t} />}
        {traditionalView && (
          // topLevelsOrgUnits,
          // onParentOrganisationUnit,
          // parent,
          // onOuSearchChange,
          // searchValue,
          // classes,
          // searchPeriod,
          // onPeriodChange,
          // periodFormat,
          // loading,
          // orgUnits,
          // selectionResultsProps,

          <InvoiceTraditionalView
            topLevelsOrgUnits={topLevelsOrgUnits}
            onParentOrganisationUnit={onParentOrganisationUnit}
            parent={parent}
            onOuSearchChange={onOuSearchChange}
            searchValue={searchValue}
            classes={classes}
            searchPeriod={searchPeriod}
            onPeriodChange={onPeriodChange}
            periodFormat={periodFormat}
            loading={loading}
            orgUnits={orgUnits}
            selectionResultsProps={props}
            resultsElements={resultsElements}
          />
        )}
      </div>
    </Paper>
  );
};

export default InvoiceSelectionContainer;
