import { DatePeriods, PluginRegistry } from "@blsq/blsq-report-components";
import CompletionInfo from "./CompletionInfo";
import _ from "lodash";
import MUIDataTable from "mui-datatables";
import React, { useEffect } from "react";
import { TableCell, TableRow } from "@material-ui/core";
import PortalHeader from "../shared/PortalHeader";
import PeriodPicker from "../shared/PeriodPicker";

const tableOptions = (quarterPeriod) => {
  return {
    enableNestedDataAccess: ".",
    print: false,
    rowsPerPage: 50,
    rowsPerPageOptions: [1, 5, 10, 20, 50, 100, 1000],
    downloadOptions: {
      filename: "orgunit-completeness-" + quarterPeriod,
      separator: ",",
    },
  };
};

const statsTableOptions = (quarterPeriod, statsByZone, setSelectedZones) => {
  return {
    enableNestedDataAccess: ".",
    print: false,
    rowsPerPage: 5,
    rowsPerPageOptions: [1, 5, 10, 20, 50, 100, 1000],
    downloadOptions: {
      filename: "zone-completeness-" + quarterPeriod,
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
                <TableCell key={index} className={footerClasses} style={{background: "#F0F0F0"}}>
                  <b>Total : </b>
                </TableCell>
                )
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
                  <TableCell key={index} className={footerClasses} style={{background: "#F0F0F0"}}>
                    <i>
                      <CompletionInfo completed={totalCompleted} expected={totalExpected} ratio={ratio}></CompletionInfo>
                    </i>
                  </TableCell>
                );
              } else {
                return (
                  <TableCell key={index} className={footerClasses}>
                  </TableCell>
                );
              }
            })}
        </TableRow>
      );
    },
  };
};

const orgUnitColumns = (distinctDataEntries, filteredCompletnessInfos) => {
  return [
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
      name: "completedDataEntries.length",
      label: "Completed",
      options: {
        filter: true,
        sort: true,
        display: false,
        customBodyRenderLite: (dataIndex) => {
          const info = filteredCompletnessInfos[dataIndex];
          return <span title={JSON.stringify(info.completedDataEntries)}>{info.completedDataEntries.length}</span>;
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
          const completed = info.expectedDataEntries.filter((e) => e.completedDataEntry).length;
          const expected = info.expectedDataEntries.length;
          const ratio = info.completionRatio;
          return <CompletionInfo completed={completed} expected={expected} ratio={ratio} />;
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

    ...distinctDataEntries.map((dataEntryPeriods) => {
      const c = dataEntryPeriods[0];
      return {
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
            return (
              <div>
                <a
                  style={{
                    textDecoration: "none",
                    color: ex.completedDataEntry ? "green" : "orange",
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
              </div>
            );
          },
        },
      };
    }),
  ];
};

const zoneStatsColumns = (distinctDataEntries, statsByZone) => {
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

const buildStatsByZone = (results, distinctDataEntries) => {
  const statsByZone = [];
  const contractsByZone = _.groupBy(results, (c) => c.contract.orgUnit.ancestors[2].id);
  for (let contractsForZone of Object.values(contractsByZone)) {
    const parentZone = contractsForZone[0].contract.orgUnit.ancestors[1];
    const zone = contractsForZone[0].contract.orgUnit.ancestors[2];
    const stats = { orgUnit: zone, ancestor: parentZone };

    for (let info of contractsForZone) {
      for (let dataEntryPeriods of distinctDataEntries) {
        const key = dataEntryPeriods[0].period + "-" + dataEntryPeriods[0].dataEntryType.category + "-completed";

        let count = info[key];
        let currentCount = stats[key];

        if (currentCount !== undefined) {
          stats[key] = currentCount + count;
        } else {
          stats[key] = count;
        }

        const keyExpected = dataEntryPeriods[0].period + "-" + dataEntryPeriods[0].dataEntryType.category + "-expected";
        count = info[keyExpected];
        currentCount = stats[keyExpected];

        if (currentCount !== undefined) {
          stats[keyExpected] = currentCount + count;
        } else {
          stats[keyExpected] = count;
        }

        const keyRatio = dataEntryPeriods[0].period + "-" + dataEntryPeriods[0].dataEntryType.category + "-ratio";
        stats[keyRatio] = stats[keyExpected] ? ((stats[key] / stats[keyExpected]) * 100).toFixed(2) : undefined;
      }
    }

    statsByZone.push(stats);
  }
  return statsByZone;
};

const CompletenessView = (props) => {
  const history = props.history
  const quarterPeriod = props.match.params.period;

  const [completnessInfos, setCompletnessInfos] = React.useState([]);

  const [statsByZone, setStatsByZone] = React.useState([]);
  const [distinctDataEntries, setDistinctDataEntries] = React.useState([]);
  const [selectedZones, setSelectedZones] = React.useState([]);
  const loadContracts = async () => {
    const DataEntries = PluginRegistry.extension("dataentry.dataEntries");

    const dhis2 = PluginRegistry.extension("core.dhis2");
    const api = await dhis2.api();
    const currentUser = props.currentUser;
    const contractService = PluginRegistry.extension("contracts.service");
    const accessibleOrgunitIds = new Set(currentUser.organisationUnits.map((ou) => ou.id));
    const contracts = (await contractService.findAll()).filter(
      (contract) =>
        contract.matchPeriod(quarterPeriod) &&
        contract.orgUnit.ancestors.some((ancestor) => accessibleOrgunitIds.has(ancestor.id)),
    );

    const periods = [quarterPeriod]
      .concat(DatePeriods.split(quarterPeriod, "monthly"))
      .concat(DatePeriods.split(quarterPeriod, "yearly"));
    const dataSets = DataEntries.getAllDataEntries().map((de) => de.dataSetId);

    let completeDataSetRegistrations = [];
    for (let ou of currentUser.organisationUnits) {
      const ds = await api.get("completeDataSetRegistrations", {
        orgUnit: ou.id,
        children: true,
        period: periods,
        dataSet: dataSets,
      });
      completeDataSetRegistrations = completeDataSetRegistrations.concat(ds.completeDataSetRegistrations);
    }

    completeDataSetRegistrations = completeDataSetRegistrations
      .filter((c) => c)
      .filter((c) => {
        // handle newer dhis2 version that has the completed flag
        if (c.hasOwnProperty("completed")) {
          return c.completed;
        }
        // else keep all records
        return true;
      });

    const completeDataSetRegistrationsByOrgUnitId = _.groupBy(
      completeDataSetRegistrations,
      (cdsr) => cdsr.organisationUnit,
    );
    const results = [];
    for (let contract of contracts) {
      const expectedDataEntries = DataEntries.getExpectedDataEntries(contract, quarterPeriod);
      if (expectedDataEntries.length > 0) {
        const completedDataEntries = completeDataSetRegistrationsByOrgUnitId[contract.orgUnit.id] || [];

        if (completedDataEntries.length > 0) {
          for (let expectedDataEntry of expectedDataEntries) {
            expectedDataEntry.completedDataEntry = completedDataEntries.find(
              (c) => c.dataSet == expectedDataEntry.dataEntryType.dataSetId && c.period == expectedDataEntry.period,
            );
          }
        }
        results.push({
          contract,
          expectedDataEntries,
          completedDataEntries,
          completionRatio:
            expectedDataEntries.length > 0
              ? ((completedDataEntries.length / expectedDataEntries.length) * 100).toFixed(2)
              : undefined,
        });
      }
    }

    const dataentries = _.groupBy(
      results.flatMap((r) => r.expectedDataEntries),
      (r) => (r.dataEntryType.category || r.dataEntryType.name) + "-" + r.period,
    );
    const distinctDataEntries = Object.values(dataentries);
    for (let info of results) {
      for (let dataEntryPeriods of distinctDataEntries) {
        for (let dataEntryPeriod of dataEntryPeriods) {
          if (dataEntryPeriod.dataEntryType.category == undefined) {
            dataEntryPeriod.dataEntryType.category = dataEntryPeriod.dataEntryType.name;
          }
        }
        const ex = info.expectedDataEntries.find((ex) =>
          dataEntryPeriods.some((ex3) => ex.dataEntryType.code == ex3.dataEntryType.code && ex.period == ex3.period),
        );

        info[dataEntryPeriods[0].period + "-" + dataEntryPeriods[0].dataEntryType.category] = ex;

        info[dataEntryPeriods[0].period + "-" + dataEntryPeriods[0].dataEntryType.category + "-completed"] = ex
          ? ex.completedDataEntry
            ? 1
            : 0
          : 0;

        info[dataEntryPeriods[0].period + "-" + dataEntryPeriods[0].dataEntryType.category + "-expected"] = ex ? 1 : 0;
      }
    }
    setDistinctDataEntries(distinctDataEntries);

    const statsByZone = buildStatsByZone(results, distinctDataEntries);
    setStatsByZone(statsByZone);
    setCompletnessInfos(results);
  };

  useEffect(() => {
    loadContracts();
  }, [quarterPeriod]);

  let filteredCompletnessInfos = completnessInfos;
  const zoneNames = selectedZones.map((stat) => stat.orgUnit.name);

  if (selectedZones.length > 0) {
    const zoneIds = new Set(selectedZones.map((stat) => stat.orgUnit.id));
    filteredCompletnessInfos = completnessInfos.filter((info) =>
      info.contract.orgUnit.ancestors.some((ancestor) => zoneIds.has(ancestor.id)),
    );
  }

  const columns = orgUnitColumns(distinctDataEntries, filteredCompletnessInfos);
  const columnsStats = zoneStatsColumns(distinctDataEntries, statsByZone);

  return (
    <div>

    <PortalHeader>
        <PeriodPicker period={quarterPeriod} onPeriodChange={(newPeriod) => { history.push("/completeness/"+newPeriod)} }></PeriodPicker>      
    </PortalHeader>
      <h1>
        Completeness for datasets {quarterPeriod} ({completnessInfos.length})
      </h1>

      <h2></h2>
      <MUIDataTable
        title="Statistics by zone"
        data={statsByZone}
        columns={columnsStats}
        options={statsTableOptions(quarterPeriod, statsByZone, setSelectedZones)}
      />

      <br></br>

      <MUIDataTable
        title={zoneNames.length == 0 ? "Situation by orgUnit" : "Situation by orgUnit under " + zoneNames.join(", ")}
        data={filteredCompletnessInfos}
        columns={columns}
        options={tableOptions(quarterPeriod)}
      />
    </div>
  );
};

export default CompletenessView;
