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
import DeleteContractDialog from "./DeleteContractDialog";

export const contractsTableColumns = (
  t,
  classes,
  filteredContracts,
  contractFields,
  location,
  fetchContracts,
  isContractViewPage,
  isDetail = false,
  contracts,
  displayOrgUnit,
  displayMainOrgUnit,
  withIndex,
) => {
  const hasSubContractEnabled = !!contractFields.find((c) => c.code == "contract_main_orgunit");

  let columns = [
    {
      name: "id",
      label: t("id"),
      options: {
        filter: false,
        display: false,
        sort: true,
        setCellHeaderProps: () => ({
          className: classes.headerCell,
        }),
        customBodyRenderLite: (dataIndex) => {
          const { id } = filteredContracts[dataIndex];
          return id;
        },
      },
    },
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
      name: "statusDetail.warnings",
      label: t("contracts.warnings"),
      options: {
        filter: false,
        sort: true,
        sortDescFirst: true,
        setCellHeaderProps: () => ({
          className: classNames(classes.cellCentered, classes.headerCell),
        }),
        customBodyRenderLite: (dataIndex) => (
          <div>{filteredContracts[dataIndex].statusDetail.validationErrors.map((err) => err.message).join("\n")}</div>
        ),
      },
    },
    {
      name: "orgUnit.level1.name",
      label: t("levels.level1"),
      options: {
        sort: true,
        display: false,
      },
    },
    {
      name: "orgUnit.level2.name",
      label: t("levels.level2"),
      options: {
        sort: true,
        display: true,
      },
    },
    {
      name: "orgUnit.level3.name",
      label: t("levels.level3"),
      options: {
        sort: true,
        display: true,
      },
    },
    {
      name: "orgUnit.level4.name",
      label: t("levels.level4"),
      options: {
        sort: true,
        display: false,
      },
    },
    {
      name: "orgUnit.level5.name",
      label: t("levels.level5"),
      options: {
        sort: true,
        display: false,
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
      name: "orgUnit.id",
      label: t("orgUnit_id"),
      options: {
        filter: false,
        display: false,
        sort: true,
        setCellHeaderProps: () => ({
          className: classes.headerCell,
        }),
        customBodyRenderLite: (dataIndex) => {
          const { orgUnit } = filteredContracts[dataIndex];
          return orgUnit.id;
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
        display: hasSubContractEnabled,
        setCellProps: () => ({
          align: "center",
        }),
        setCellHeaderProps: () => ({
          className: classNames(classes.cellCentered, classes.headerCell),
        }),
        customBodyRender: (contractMainOrgunitId) => {
          if (!contractMainOrgunitId) return "";
          const mainContract = getContractByOrgUnit(contracts, contractMainOrgunitId);

          if (!mainContract) {
            // if you the orgunit hasn't a contract at least display the uid
            return contractMainOrgunitId;
          }
          return (
            <Tooltip arrow title={getOrgUnitAncestors(mainContract.orgUnit)}>
              <span>{mainContract.orgUnit.name}</span>
            </Tooltip>
          );
        },
      },
    },
    {
      name: "fieldValues.contract_main_orgunit_id",
      label: t("contracts.contract_main_orgunit_id"),
      options: {
        filter: false,
        display: false,
        sort: true,
        setCellProps: () => ({
          align: "center",
        }),
        setCellHeaderProps: () => ({
          className: classNames(classes.cellCentered, classes.headerCell),
        }),
        customBodyRender: (contractMainOrgunitId) => {
          return contractMainOrgunitId;
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

  let notStandardFields = [
    {
      name: "fieldValues.storedBy",
      label: t("contracts.created_by"),
      options: {
        filter: true,
        display: true,
        sort: true
      },
    },
    {
      name: "fieldValues.createdDate",
      label: t("contracts.created_at"),
      options: {
        filter: true,
        display: true,
        sort: true
      }
    },
    {
      name: "fieldValues.lastUpdatedBy",
      label: t("contracts.updated_by"),
      options: {
        filter: true,
        display: true,
        sort: true
      }
    },
    {
      name: "fieldValues.lastUpdatedDate",
      label: t("contracts.updated_at"),
      options: {
        filter: true,
        display: true,
        sort: true
      }
    }
  ];

  columns = columns.concat(notStandardFields);
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
              isContractViewPage={isContractViewPage}
            />
            {isDetail && <DeleteContractDialog contract={contract} onSavedSuccessfull={fetchContracts} />}

            {!isDetail && (
              <Tooltip placement="bottom" title={t("contracts.seeOrgUnit")} arrow>
                <Link
                  to={`/contracts/${contract.fieldValues.contract_main_orgunit
                    ? contract.fieldValues.contract_main_orgunit
                    : contract.orgUnit.id
                    }`}
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
    enableNestedDataAccess: ".",
    search: false,
    filter: false,
    print: false,
    rowsPerPage: tableParams.rowsPerPage,
    page,
    sortOrder: {
      name: tableParams.sort.column || "statusDetail.warnings",
      direction: tableParams.sort.direction || "desc",
    },
    selectableRowsHideCheckboxes: false,
    selectableRows: "none",
    downloadOptions: { filename: "contracts.csv", separator: "," },
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
