import React from "react";
import moment from "moment";
import { Tooltip } from "@material-ui/core";

import { Link } from "react-router-dom";

import ContractsDialog from "./ContractsDialog";
import { defaultOptions } from "../../support/table";
import { getOverlaps, getOrgUnitAncestors, getOptionFromField } from "./utils";

export const contractsTableColumns = (
  t,
  classes,
  contracts,
  contractFields,
  location,
) => {
  const columns = [
    {
      name: "orgUnit.name",
      label: t("orgUnit_name"),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (orgUnitName, tableMeta) => {
          return (
            <Tooltip
              arrow
              title={getOrgUnitAncestors(contracts[tableMeta.rowIndex].orgUnit)}
            >
              <Link
                to={`/contracts/${contracts[tableMeta.rowIndex].orgUnit.id}${
                  location.search
                }`}
                className={classes.iconLink}
              >
                <span>{orgUnitName}</span>
              </Link>
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
        customBodyRender: (contractStartDate) => {
          return (
            <Tooltip arrow title={contractStartDate}>
              <span>{moment(contractStartDate).format("DD/MM/YYYY")}</span>
            </Tooltip>
          );
        },
      },
    },
    {
      name: "fieldValues.contract_end_date",
      label: t("end_period"),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (contractEndDate) => {
          return (
            <Tooltip arrow title={contractEndDate}>
              <span>{moment(contractEndDate).format("DD/MM/YYYY")}</span>
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
    label: (
      <span className={classes.cellCentered}>{t("table.actions.title")}</span>
    ),
    options: {
      filter: false,
      sort: false,
      setCellProps: () => ({
        align: "center",
      }),
      customBodyRender: (id, tableMeta) => (
        <ContractsDialog contract={contracts[tableMeta.rowIndex]} />
      ),
    },
  });
  return columns;
};

export const contractsTableOptions = (
  t,
  contracts,
  contractsById,
  contractsOverlaps,
  classes,
  onTableChange,
  tableParams,
) => ({
  ...defaultOptions(t),
  search: false,
  filter: false,
  print: false,
  rowsPerPage: tableParams.rowsPerPage,
  page: tableParams.page,
  sortOrder: {
    name: tableParams.sort.column,
    direction: tableParams.sort.direction,
  },
  selectableRowsHideCheckboxes: false,
  selectableRows: "none",
  rowsPerPageOptions: [10, 25, 50, 100],
  onChangeRowsPerPage: (numberOfRows) => {
    onTableChange("page", 0);
    onTableChange("rowsPerPage", numberOfRows);
  },
  onChangePage: (currentPage) => onTableChange("page", currentPage),
  onColumnSortChange: (column, direction) =>
    onTableChange("sort", { column, direction }),
  setRowProps: (row, dataIndex, rowIndex) => {
    const contract = contracts[dataIndex];
    const isOverlaping =
      getOverlaps(contract.id, contractsOverlaps, contractsById).length > 0;
    return {
      className: isOverlaping ? classes.rowError : "",
    };
  },
});