import React, { useEffect } from "react";
import { TableCell, TableRow } from "@material-ui/core";
import { onTableChange, anchorQueryParams } from "./urlParams";
import CompletionInfo from "./CompletionInfo";


export const tableOptions = (quarterPeriod) => {
  const queryParams = anchorQueryParams();

  return {
    enableNestedDataAccess: ".",
    print: false,
    searchOpen: !!queryParams.get("ou.searchText"),
    filter: true,
    selectableRows: "none",
    onTableChange: onTableChange("ou."),
    rowsPerPage: 50,
    rowsPerPageOptions: [1, 5, 10, 20, 50, 100, 1000],
    downloadOptions: {
      filename: "orgunit-completeness-" + quarterPeriod + ".csv",
      separator: ",",
    },
    selectToolbarPlacement: "above",
  };
};

export const statsTableOptions = (quarterPeriod, statsByZone, setSelectedZones) => {
  const queryParams = anchorQueryParams()

  const selectIndexes = []
  const selectedZones = queryParams.get("selectedZones");
  if (statsByZone && selectedZones) {
    let selectIndex = 0;
    for (let row of statsByZone) {
      if (row && row.orgUnit && selectedZones.includes(row.orgUnit.id)) {
        selectIndexes.push(selectIndex)
      }
      selectIndex = selectIndex + 1;
    }
  }

  return {
    enableNestedDataAccess: ".",
    filter: true,
    searchOpen: !!queryParams.get("zone.searchText"),
    onTableChange: onTableChange("zone.", statsByZone),
    rowsSelected: selectIndexes,
    print: false,
    rowsPerPage: 5,
    rowsPerPageOptions: [1, 5, 10, 20, 50, 100, 1000],
    downloadOptions: {
      filename: "zone-completeness-" + quarterPeriod + ".csv",
      separator: ",",
    },
    onRowSelectionChange: (_currentRowsSelected, _allRowsSelected, rowsSelected) => {
      const selectedZones = rowsSelected.map((index) => statsByZone[index]);
      setSelectedZones(selectedZones);
    },
    customTableBodyFooterRender: function (opts) {
      const footerClasses = "";
      return (
        <TableRow>
          {opts.selectableRows !== "none" ? (
            <TableCell className={footerClasses}></TableCell>
          ) : (
            <TableCell className={footerClasses}></TableCell>
          )}
          {opts.columns
            .filter((c) => c.display != "false")
            .map((col, index) => {
              if (col.name == "orgUnit.name") {
                return (
                  <TableCell key={index} className={footerClasses} style={{ background: "#F0F0F0" }}>
                    <b>Total : </b>
                  </TableCell>
                );
              } else if (col.name.endsWith("-ratio")) {
                const colNamePrefix = col.name.slice(0, col.name.length - 6);
                const colCompletedIndex = opts.columns.findIndex((c) => c.name === colNamePrefix + "-completed");
                const colExpectedIndex = opts.columns.findIndex((c) => c.name === colNamePrefix + "-expected");

                let totalCompleted = opts.data.reduce((accu, item) => {
                  return accu + item.data[colCompletedIndex];
                }, 0);
                let totalExpected = opts.data.reduce((accu, item) => {
                  return accu + item.data[colExpectedIndex];
                }, 0);

                let ratio = undefined;
                if (totalExpected > 0) {
                  ratio = (100 * (totalCompleted / totalExpected)).toFixed(2);
                }

                return (
                  <TableCell key={index} className={footerClasses} style={{ background: "#F0F0F0" }}>
                    <i>
                      <CompletionInfo
                        completed={totalCompleted}
                        expected={totalExpected}
                        ratio={ratio}
                      ></CompletionInfo>
                    </i>
                  </TableCell>
                );
              } else {
                return <TableCell key={index} className={footerClasses}></TableCell>;
              }
            })}
        </TableRow>
      );
    },
  };
};

export const orgUnitColumns = (distinctDataEntries, filteredCompletnessInfos, t) => {
  return [
    {
      name: "contract.orgUnit.id",
      label: "id",
      options: {
        filter: true,
        sort: true,
        display: false,
      },
    },
    {
      name: "orgUnitLevel1.name",
      label: "Level 1",
      options: {
        filter: true,
        sort: true,
        display: false,
      },
    },
    {
      name: "orgUnitLevel2.name",
      label: "Level 2",
      options: {
        filter: true,
        sort: true,
        display: false,
      },
    },
    {
      name: "orgUnitLevel3.name",
      label: "Level 3",
      options: {
        filter: true,
        sort: true,
        display: false,
      },
    },
    {
      name: "orgUnitLevel4.name",
      label: "Level 4",
      options: {
        filter: true,
        sort: true,
        display: false,
      },
    },
    {
      name: "contract.orgUnit.name",
      label: "Name",
      options: {
        filter: true,
        sort: true,

        customBodyRenderLite: (dataIndex) => {
          const info = filteredCompletnessInfos[dataIndex];
          return (
            <span
              title={
                info.contract.orgUnit.ancestors
                  .slice(1)
                  .map((c) => c.name)
                  .join(" > ") +
                " " +
                info.contract.orgUnit.id
              }
            >
              {info.contract.orgUnit.name}
            </span>
          );
        },
      },
    },
    {
      name: "status",
      label: "Status",
      options: {
        filter: true,
        sort: true,
        display: true,
        customBodyRenderLite: (dataIndex) => {
          const info = filteredCompletnessInfos[dataIndex];
          return <span>{t("completeness."+info.status)}</span>;
        },
      },
    },
    {
      name: "completedCount",
      label: "Completed",
      options: {
        filter: true,
        sort: true,
        display: false,
        customBodyRenderLite: (dataIndex) => {
          const info = filteredCompletnessInfos[dataIndex];

          return <span title={JSON.stringify(info.completedDataEntries)}>{info.completedCount}</span>;
        },
      },
    },

    {
      name: "expectedDataEntries.length",
      label: "Expected",
      options: {
        filter: true,
        sort: true,
        display: false,
        customBodyRenderLite: (dataIndex) => {
          const info = filteredCompletnessInfos[dataIndex];
          return (
            <span
              title={info.expectedDataEntries
                .map(
                  (ede) =>
                    ede.dataEntryType.name +
                    " " +
                    ede.period +
                    " " +
                    ede.dataEntryType.dataSetId +
                    " " +
                    (ede.completedDataEntry ? "Y" : "N"),
                )
                .join("\n")}
            >
              {info.expectedDataEntries.length}
            </span>
          );
        },
      },
    },
    {
      name: "completionRatio",
      label: "Ratio",
      options: {
        filter: true,
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const info = filteredCompletnessInfos[dataIndex];
          if (info == undefined) {
            return "";
          }
          const completed = info.completedCount;
          const expected = info.expectedCount;
          const ratio = info.completionRatio;
          return <CompletionInfo completed={completed} expected={expected} ratio={ratio} />;
        },
      },
    },

    ...distinctDataEntries.flatMap((dataEntryPeriods) => {
      const c = dataEntryPeriods[0];
      return [
        {
          name: c.period + "-" + c.dataEntryType.category + "-completed",
          label: c.dataEntryType.category + "\n" + c.period,
          options: {
            filter: true,
            sort: true,
            customBodyRenderLite: (dataIndex) => {
              const info = filteredCompletnessInfos[dataIndex];
              if (info == undefined) {
                return "";
              }
              const ex = info[c.period + "-" + c.dataEntryType.category];
              if (ex == undefined) {
                return "";
              }
              let details = undefined;
              if (ex && ex.dataEntryType.dataSetIds) {
                details = (
                  <span>
                    {ex.completedDataEntries ? ex.completedDataEntries.length : 0}/{ex.dataEntryType.dataSetIds.length}
                  </span>
                );
              }
              return (
                <div>
                  <a
                    style={{
                      textDecoration: "none",
                      color: ex.completed ? "green" : "orange",
                    }}
                    href={
                      "./index.html#/dataEntry/" +
                      info.contract.orgUnit.id +
                      "/" +
                      ex.period +
                      "/" +
                      ex.dataEntryType.code
                    }
                    title={ex.period}
                  >
                    {" "}
                    {ex.dataEntryType.name}
                  </a>

                  {details && (
                    <>
                      <br></br>
                      {details}
                    </>
                  )}
                </div>
              );
            },
          },
        },
        {
          name: c.period + "-" + c.dataEntryType.category + "-users",
          label: c.dataEntryType.category + " User " + "\n" + c.period,
          options: {
            filter: true,
            sort: true,
            display: false,
          },
        },
        {
          name: c.period + "-" + c.dataEntryType.category + "-dates",
          label: c.dataEntryType.category + " Date " + "\n" + c.period,
          options: {
            filter: true,
            sort: true,
            display: false,
          },
        },
        {
          name: c.period + "-" + c.dataEntryType.category + "-link",
          label: c.dataEntryType.category + " Link " + "\n" + c.period,
          options: {
            filter: true,
            sort: true,
            display: false,
          },
        },
      ];
    }),
  ];
};

export const zoneStatsColumns = (distinctDataEntries, statsByZone) => {
  return [
    {
      name: "ancestor.name",
      label: "Level 2 name",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "orgUnit.name",
      label: "Level 3 Name",
      options: {
        filter: true,
        sort: true,
      },
    },
    ...distinctDataEntries.flatMap((dataEntryPeriods) => {
      const c = dataEntryPeriods[0];
      const completedKey = c.period + "-" + c.dataEntryType.category + "-completed";
      const expectedKey = c.period + "-" + c.dataEntryType.category + "-expected";
      const ratioKey = c.period + "-" + c.dataEntryType.category + "-ratio";
      return [
        {
          name: completedKey,
          label: c.dataEntryType.category + "\n" + c.period + "\ncompleted",
          options: {
            filter: true,
            sort: true,
            display: false,
          },
        },
        {
          name: expectedKey,
          label: c.dataEntryType.category + "\n" + c.period + "\nexpected",
          options: {
            filter: true,
            sort: true,
            display: false,
          },
        },
        {
          name: ratioKey,
          label: c.dataEntryType.category + "\n" + c.period + "\nratio",
          options: {
            filter: true,
            sort: true,
            customBodyRenderLite: (dataIndex) => {
              const info = statsByZone[dataIndex];
              if (info == undefined) {
                return "";
              }

              return (
                <CompletionInfo completed={info[completedKey]} expected={info[expectedKey]} ratio={info[ratioKey]} />
              );
            },
          },
        },
      ];
    }),
  ];
};
