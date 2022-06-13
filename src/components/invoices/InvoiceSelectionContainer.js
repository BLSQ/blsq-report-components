import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Paper, Typography } from "@material-ui/core";
import CachedIcon from "@material-ui/icons/Cached";

import { makeStyles } from "@material-ui/styles";
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
  headerButtons: {
    display: "flex",
    justifyContent: "space-between",
  },
});

const useStyles = makeStyles(styles);

const updateHistory = (history, parent, period, searchValue, defaultPathName, viewType) => {
  const parentParam = parent ? "&parent=" + parent : "";
  const path = defaultPathName || `/select/${viewType}`;
  history.replace({
    pathname: path,
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
    match,
  } = props;
  const [orgUnits, setOrgUnits] = useState();
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(ouSearchValue);
  const [searchPeriod, setSearchPeriod] = useState(period);
  const [debouncedSearchValue, setDebouncedSearchValue] = useDebounce(ouSearchValue);

  const [viewType, setViewType] = useState(match.params.viewType);
  const [useTraditionalView, setUseTraditionalView] = useState(viewType === "traditional");

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
          updateHistory(history, parent, period, debouncedSearchValue, defaultPathName, viewType);
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
    viewType,
  ]);

  const onOuSearchChange = async (event) => {
    setDebouncedSearchValue(event.target.value);
    setSearchValue(event.target.value);
  };

  const onPeriodChange = (newPeriod) => {
    setSearchPeriod(newPeriod);
    updateHistory(history, parent, newPeriod, debouncedSearchValue, defaultPathName, viewType);
  };

  const onParentOrganisationUnit = (orgUnitId) => {
    updateHistory(history, orgUnitId, period, debouncedSearchValue, defaultPathName, viewType);
  };

  const classes = useStyles();
  const { t } = useTranslation();
  const toggleView = (useTraditionalView) => {
    setUseTraditionalView(useTraditionalView);
    const viewToUse = useTraditionalView ? "traditional" : "tree";
    setViewType(viewToUse);
    const newUrl = window.location.href.replace(`/${viewType}`, `/${viewToUse}`);
    window.history.replaceState({}, "", newUrl);
  };

  const switchToTreeView = "Switch to orgunit tree view";
  const switchToTraditionalView = "Switch to traditional view";
  const viewLabel = useTraditionalView ? switchToTreeView : switchToTraditionalView;

  return (
    <Paper className={classes.paper} square>
      <div className={classes.headerButtons}>
        <Typography variant="h6" component="h6" gutterBottom>
          {t("invoices.search.title")}
        </Typography>
        <Button onClick={() => toggleView(!useTraditionalView)} startIcon={<CachedIcon />}>
          {viewLabel}
        </Button>
      </div>
      <br />
      <br />
      <br />
      <div className={classes.filters}>
        {!useTraditionalView && (
          <InvoiceTreeView
            invoiceLinksProps={props}
            searchPeriod={searchPeriod}
            t={t}
            classes={classes}
            onPeriodChange={onPeriodChange}
            periodFormat={periodFormat}
          />
        )}
        {useTraditionalView && (
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
