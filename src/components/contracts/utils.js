import moment from 'moment'
import DatePeriods  from "../../support/DatePeriods"

export const toContractsById = (contracts) => {
    const contractsById = {};
    contracts.forEach((contract) => (contractsById[contract.id] = contract));
    return contractsById;
  };

export const toOverlappings = (contracts) => {
    const contractsByOrgUnits = {};
    contracts.forEach((contract) => {
      if (contractsByOrgUnits[contract.orgUnit.id] === undefined) {
        contractsByOrgUnits[contract.orgUnit.id] = [];
      }
      contractsByOrgUnits[contract.orgUnit.id].push(contract);
    });

    const contractsOverlaps = {};
    for (const [, contractsForOrgUnit] of Object.entries(
      contractsByOrgUnits
    )) {
      contractsForOrgUnit.forEach((contract1) => {
        contractsForOrgUnit.forEach((contract2) => {
          if (contract1.overlaps(contract2)) {
            if (contractsOverlaps[contract1.id] === undefined) {
              contractsOverlaps[contract1.id] = new Set();
            }
            if (contractsOverlaps[contract2.id] === undefined) {
              contractsOverlaps[contract2.id] = new Set();
            }
            contractsOverlaps[contract1.id].add(contract2.id);
            contractsOverlaps[contract2.id].add(contract1.id);
          }
        });
      });
    }
    return contractsOverlaps;
  };

export const getFilteredContracts = (filters, contracts, contractsOverlaps) => {
  let filteredContracts  = contracts;
  Object.keys(filters).forEach(filterKey =>{
    const filter = filters[filterKey]
    filteredContracts = filteredContracts.filter(
      (c) => {
        return (filter === "overlaps" &&
          contractsOverlaps[c.id] &&
          contractsOverlaps[c.id].size > 0) ||
        c.codes.includes(filter) ||
        c.orgUnit.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.startPeriod.includes(filter) ||
        c.endPeriod.includes(filter)
      }
    )
  })
  return filteredContracts;
}

export const getOverlaps = (contractId, contractsOverlaps, contractsById) => {
  if (!contractsOverlaps[contractId]) {
    return [];
  }
  return Array.from(contractsOverlaps[contractId])
            .map((contractId) => contractsById[contractId]);
};

export const getOrgUnitAncestors = orgUnit => {
  if (orgUnit && orgUnit.ancestors) {
    return orgUnit.ancestors
    .slice(1, -1)
    .map((a) => a.name)
    .join(" > ");
  }
  return ""
}

export const filterItems = (filters, items, extra) => {
    let filteredItems = [...items]
    filters.forEach(filter => {
        filteredItems = filter.onFilter(filter.value, filteredItems, extra)
    })
    return filteredItems
}

export const getStartDateFromPeriod = (startPeriod) => {
  const startPeriodMonths = DatePeriods.split(startPeriod, "monthly")
  return moment(startPeriodMonths[0], 'YYYYMM')
}
export const getEndDateFromPeriod = (endPeriod) => {
  const endPeriodMonths = DatePeriods.split(endPeriod, "monthly")
  return moment(endPeriodMonths[endPeriodMonths.length - 1], 'YYYYMM').endOf('month')
}

export const getContractDates = (contract) => ({
  startDate: getStartDateFromPeriod(contract.startPeriod),
  endDate: getEndDateFromPeriod(contract.endPeriod)
})