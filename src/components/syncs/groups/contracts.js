import DatePeriods from "../../../support/DatePeriods";
import PluginRegistry from "../../core/PluginRegistry";
import _ from "lodash";
const codify = (str) => {
  if (str === undefined) {
    return undefined;
  }
  const code = str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace("/", "_")
    .replace(/-/g, "_")
    .replace(/'/g, "_")
    .replace(/ /g, "_")
    .replace(/__/g, "_")
    .toLowerCase();

  return code;
};

const codifyObject = (dhis2Object) => (dhis2Object.hesabuCode = codify(dhis2Object.code) || codify(dhis2Object.name));

const distance = (contract, period) =>
  Math.min(parseInt(contract.startPeriod) - parseInt(period), parseInt(contract.endPeriod) - parseInt(period));

const buildContractInfos = (contractsByOrgunits, groupSetIndex, period, contractFields) => {
  const monthPeriod = DatePeriods.split(period, "monthly")[0];
  const results = [];
  for (let orgUnitContracts of Object.values(contractsByOrgunits)) {
    const warnings = [];
    const orgUnit = orgUnitContracts[0].orgUnit;
    const contractsForPeriod = orgUnitContracts.filter((contract) => contract.matchPeriod(period));

    let contractForPeriod;
    let contractedForPeriod;

    if (contractsForPeriod.length > 1) {
      warnings.push(contractsForPeriod.length + " contracts for the period");
    } else {
      contractForPeriod = contractsForPeriod[0];

      if (contractsForPeriod.length === 0) {
        contractForPeriod = _.minBy(orgUnitContracts, (contract) => distance(contract, monthPeriod));
        contractedForPeriod = false;
      } else {
        contractedForPeriod = true;
      }
    }

    let actions = [];
    if (contractForPeriod) {
      const groupSet = groupSetIndex.groupSetsByCode["contracts"];

      if (groupSet) {
        const contractedGroup = groupSet.organisationUnitGroups.find((g) => g.hesabuCode === "contracted");
        const nonContractedGroup = groupSet.organisationUnitGroups.find((g) => g.hesabuCode === "non_contracted");

        if (contractedGroup && nonContractedGroup) {
          const isInContractedGroup = contractedGroup.organisationUnits.some((ou) => ou.id === orgUnit.id);
          const isInNonContractedGroup = nonContractedGroup.organisationUnits.some((ou) => ou.id === orgUnit.id);

          if (contractedForPeriod) {
            if (isInContractedGroup) {
              actions.push({ kind: "keep", group: contractedGroup, orgUnit });
            }
            if (!isInContractedGroup) {
              actions.push({ kind: "add", group: contractedGroup, orgUnit });
            }
            if (isInNonContractedGroup) {
              actions.push({
                kind: "remove",
                group: nonContractedGroup,
                orgUnit,
              });
            }
          } else {
            if (isInContractedGroup) {
              actions.push({ kind: "remove", group: contractedGroup, orgUnit });
            }
            if (!isInNonContractedGroup) {
              actions.push({ kind: "add", group: nonContractedGroup, orgUnit });
            }
            if (isInNonContractedGroup) {
              actions.push({ kind: "keep", group: nonContractedGroup, orgUnit });
            }
          }
        }
      }
    }
    if (contractForPeriod) {
      for (let contractField of contractFields) {
        const groupSet = groupSetIndex.groupSetsByCode[contractField.code];
        if (groupSet) {
          for (let group of groupSet.organisationUnitGroups) {
            if (contractField.optionSet.options.some((o) => o.code.toLowerCase() === group.hesabuCode)) {
              const isInGroup = group.organisationUnits.some((ou) => ou.id == orgUnit.id);
              const contractCodes = contractForPeriod.codes.map((c) => c.toLowerCase());
              if (isInGroup && !contractCodes.includes(group.hesabuCode)) {
                actions.push({ kind: "remove", group, orgUnit });
              }
              if (!isInGroup && contractCodes.includes(group.hesabuCode)) {
                actions.push({ kind: "add", group, orgUnit });
              }
              if (isInGroup && contractCodes.includes(group.hesabuCode)) {
                actions.push({ kind: "keep", group, orgUnit });
              }
            }
          }
        }
      }
    }

    actions = _.uniqBy(actions, (e) => e.group.id + "-" + e.kind);

    results.push({
      orgUnit,
      orgUnitContracts,
      contractForPeriod,
      contractedForPeriod,
      synchronized: actions.every((a) => a.kind === "keep"),
      actions,
      warnings,
    });
  }
  return results;
};

export const indexGroupSet = async () => {
  const dhis2 = PluginRegistry.extension("core.dhis2");
  const api = await dhis2.api();
  const ds = await api.get("organisationUnitGroupSets", {
    paging: false,
    fields: "id,code,name,organisationUnitGroups[id,code,name,organisationUnits[id,name]]",
  });
  const groupsByCode = {};
  const groupSetsByCode = {};
  const organisationUnitGroupSets = ds.organisationUnitGroupSets;
  for (let organisationUnitGroupSet of organisationUnitGroupSets) {
    codifyObject(organisationUnitGroupSet);
    groupSetsByCode[organisationUnitGroupSet.hesabuCode] = organisationUnitGroupSet;
    for (let organisationUnitGroup of organisationUnitGroupSet.organisationUnitGroups) {
      organisationUnitGroup.groupSetCode = organisationUnitGroupSet.hesabuCode;
      codifyObject(organisationUnitGroup);
      groupsByCode[organisationUnitGroup.hesabuCode] = organisationUnitGroup;
    }
  }
  return {
    groupsByCode,
    groupSetsByCode,
  };
};

export const fetchContracts = async (groupSetIndex, period) => {
  const contractService = PluginRegistry.extension("contracts.service");

  const contracts = await contractService.findAll();
  const contractsByOrgunits = _.groupBy(contracts, (c) => c.orgUnit.id);

  const results = buildContractInfos(contractsByOrgunits, groupSetIndex, period, contractService.contractFields());
  return results.sort((a, b) => {
    return a.orgUnit.path.localeCompare(b.orgUnit.path);
  });
};

export const buildStats = (results, groupSetIndex) => {
  const statsPerGroup = {};
  for (let contactInfo of results) {
    for (let action of contactInfo.actions) {
      if (statsPerGroup[action.group.hesabuCode] === undefined) {
        statsPerGroup[action.group.hesabuCode] = {};
      }
      statsPerGroup[action.group.hesabuCode][action.kind] =
        (statsPerGroup[action.group.hesabuCode][action.kind] || 0) + 1;
    }
  }
  const displayableStats = [];
  for (const [groupCode, stats] of Object.entries(statsPerGroup)) {
    const group = groupSetIndex.groupsByCode[groupCode];
    displayableStats.push({ group, stats });
  }
  return displayableStats;
};
