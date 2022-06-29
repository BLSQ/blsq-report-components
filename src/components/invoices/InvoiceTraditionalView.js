import React from "react";
import { FormControl, LinearProgress } from "@material-ui/core";
import OrgUnitAutoComplete from "./OrgUnitAutoComplete";
import OuPicker from "./OuPicker";
import PeriodPicker from "../shared/PeriodPicker";
import SelectionResultsContainer from "./SelectionResultsContainer";

const InvoiceTraditionalView = ({
  topLevelsOrgUnits,
  onParentOrganisationUnit,
  parent,
  onOuSearchChange,
  searchValue,
  classes,
  searchPeriod,
  onPeriodChange,
  periodFormat,
  loading,
  orgUnits,
  selectionResultsProps,
  resultsElements
}) => {
  const SelectionResults = resultsElements || SelectionResultsContainer;

  return (
    <>
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
      <br />
      <br />
      <br />
      <SelectionResults {...selectionResultsProps} orgUnits={orgUnits?.organisationUnits} pager={orgUnits?.pager} />
    </>
  )
};

export default InvoiceTraditionalView;
