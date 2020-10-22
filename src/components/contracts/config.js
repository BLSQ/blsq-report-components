import React from "react";
import moment from "moment";
import { Tooltip, IconButton } from "@material-ui/core";
import classNames from "classnames";
import { Link } from "react-router-dom";
import ContractsDialog from "./ContractsDialog";
import { defaultOptions } from "../../support/table";
import OrgUnitIcon from "../shared/icons/OrgUnitIcon";
import ContractStatus from "./ContractStatus";
import { getOrgUnitAncestors, getOptionFromField, getContractByOrgUnit } from "./utils/index";

export const contractsTableColumns = (
  t,
  classes,
  filteredContracts,
  contractFields,
  location,
  fetchContracts,
  isDetail = false,
  contracts,
  displayOrgUnit,
  displayMainOrgUnit,
  withIndex,
) => {
  const columns = [
    {
      name: "status",
      label: t("status"),
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({
          align: "center",
        }),
        setCellHeaderProps: () => ({
          className: classNames(classes.cellCentered, classes.headerCell),
        }),
        customBodyRenderLite: (dataIndex) => <ContractStatus contract={filteredContracts[dataIndex]} />,
      },
    },
    {
      name: "orgUnit.name",
      label: t("orgUnit_name"),
      options: {
        filter: false,
        sort: true,
        setCellHeaderProps: () => ({
          className: classes.headerCell,
        }),
        customBodyRenderLite: (dataIndex) => {
          const { orgUnit } = filteredContracts[dataIndex];
          return (
            <Tooltip arrow title={getOrgUnitAncestors(orgUnit)}>
              <span>{orgUnit.name}</span>
            </Tooltip>
          );
        },
      },
    },
    {
      name: "fieldValues.contract_start_date",
      label: t("start_period"),
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({
          align: "center",
        }),
        setCellHeaderProps: () => ({
          className: classNames(classes.cellCentered, classes.headerCell),
        }),
        customBodyRender: (contractStartDate) => {
          return <span>{moment(contractStartDate).format("DD/MM/YYYY")}</span>;
        },
      },
    },
    {
      name: "fieldValues.contract_end_date",
      label: t("end_period"),
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({
          align: "center",
        }),
        setCellHeaderProps: () => ({
          className: classNames(classes.cellCentered, classes.headerCell),
        }),
        customBodyRender: (contractEndDate) => {
          return <span>{moment(contractEndDate).format("DD/MM/YYYY")}</span>;
        },
      },
    },
    {
      name: "fieldValues.contract_main_orgunit",
      label: t("contracts.contract_main_orgunit"),
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({
          align: "center",
        }),
        setCellHeaderProps: () => ({
          className: classNames(classes.cellCentered, classes.headerCell),
        }),
        customBodyRender: (contractMainOrgunitId) => {
          if (!contractMainOrgunitId) return "";
          const mainContract = getContractByOrgUnit(contracts, contractMainOrgunitId);
          if (!mainContract) return "";
          return (
            <Tooltip arrow title={getOrgUnitAncestors(mainContract.orgUnit)}>
              <span>{mainContract.orgUnit.name}</span>
            </Tooltip>
          );
        },
      },
    },
  ];
  contractFields.forEach((field) => {
    if (!field.standardField) {
      columns.push({
        name: `fieldValues.${field.code}`,
        label: field.name,
        options: {
          filter: false,
          sort: true,
          setCellProps: () => ({
            align: "center",
          }),
          setCellHeaderProps: () => ({
            className: classNames(classes.cellCentered, classes.headerCell),
          }),
          sortCompare: (order) => (a, b) => {
            const aLabel = getOptionFromField(field, a.data).label;
            const bLabel = getOptionFromField(field, b.data).label;
            return (aLabel < bLabel ? -1 : 1) * (order === "desc" ? 1 : -1);
          },
          customBodyRender: (code) => getOptionFromField(field, code).label,
        },
      });
    }
  });
  columns.push({
    name: "id",
    label: t("table.actions.title"),
    options: {
      filter: false,
      sort: false,
      setCellProps: () => ({
        align: "center",
      }),
      setCellHeaderProps: () => ({
        className: classNames(classes.cellCentered, classes.headerCell),
      }),
      customBodyRender: (contractId) => {
        const contract = filteredContracts.find((c) => c.id === contractId);
        if (!contract) return null;
        return (
          <>
            <ContractsDialog
              contract={contract}
              contracts={contracts}
              contractFields={contractFields}
              onSavedSuccessfull={fetchContracts}
              displayOrgUnit={displayOrgUnit}
              displayMainOrgUnit={displayMainOrgUnit}
            />
            {!isDetail && (
              <Tooltip placement="bottom" title={t("contracts.seeOrgUnit")} arrow>
                <Link
                  to={`/contracts/${
                    contract.fieldValues.contract_main_orgunit
                      ? contract.fieldValues.contract_main_orgunit
                      : contract.orgUnit.id
                  }${location.search}`}
                  className={classes.marginLeft}
                >
                  <IconButton size="small">
                    <OrgUnitIcon />
                  </IconButton>
                </Link>
              </Tooltip>
            )}
          </>
        );
      },
    },
  });
  if (withIndex) {
    columns.unshift({
      name: "rowIndex",
      label: " ",
      options: {
        filter: false,
        sort: true,
        setCellHeaderProps: () => ({
          className: classes.headerCell,
        }),
      },
    });
  }
  return columns;
};

export const contractsTableOptions = (t, contracts, onTableChange, tableParams) => {
  let page;
  if (tableParams.page && contracts.length > 0) {
    page = parseInt(tableParams.page, 10);
  }
  return {
    ...defaultOptions(t),
    search: false,
    filter: false,
    print: false,
    rowsPerPage: tableParams.rowsPerPage,
    page,
    sortOrder: {
      name: tableParams.sort.column || "fieldValues.contract_end_date",
      direction: tableParams.sort.direction || "desc",
    },
    selectableRowsHideCheckboxes: false,
    selectableRows: "none",
    rowsPerPageOptions: [10, 25, 50, 100],
    onChangeRowsPerPage: (numberOfRows) => {
      onTableChange("page", 0);
      onTableChange("rowsPerPage", numberOfRows);
    },
    onChangePage: (currentPage) => onTableChange("page", currentPage),
    onColumnSortChange: (column, direction) => onTableChange("sort", { column, direction }),
  };
};

export const orgUnitContractTableOptions = (t) => {
  return {
    ...defaultOptions(t),
    search: false,
    filter: false,
    print: false,
    sortOrder: {
      name: "fieldValues.contract_end_date",
      direction: "desc",
    },
    selectableRowsHideCheckboxes: false,
    selectableRows: "none",
    rowsPerPageOptions: [10, 25, 50, 100],
  };
};
