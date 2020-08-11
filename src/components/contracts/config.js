import React from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";

import { Link } from "react-router-dom";
import { defaultOptions } from "../../support/table";
import {
  getOverlaps,
  getOrgUnitAncestors,
  getStartDateFromPeriod,
  getEndDateFromPeriod,
  getOptionFromField,
} from "./utils";

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
              <span>{orgUnitName}</span>
            </Tooltip>
          );
        },
      },
    },
    {
      name: "startPeriod",
      label: t("start_period"),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (startPeriod) => {
          return (
            <Tooltip arrow title={startPeriod}>
              <span>
                {getStartDateFromPeriod(startPeriod).format("DD/MM/YYYY")}
              </span>
            </Tooltip>
          );
        },
      },
    },
    {
      name: "endPeriod",
      label: t("end_period"),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (endPeriod) => {
          return (
            <Tooltip arrow title={endPeriod}>
              <span>
                {getEndDateFromPeriod(endPeriod).format("DD/MM/YYYY")}
              </span>
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
    name: "orgUnit.id",
    label: t("table.actions.title"),
    options: {
      filter: false,
      sort: false,
      customBodyRender: (orgUnitId) => (
        <Tooltip placement="bottom" title={t("table.actions.see")} arrow>
          <span>
            <IconButton size="small">
              <Link
                to={`/contracts/${orgUnitId}${location.search}`}
                className={classes.iconLink}
              >
                <Visibility />
              </Link>
            </IconButton>
          </span>
        </Tooltip>
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
