
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

export const getFilteredContracts = (filter, contracts, contractsOverlaps) => {
  const filteredContracts = filter
  ? contracts.filter(
      (c) =>
        (filter === "overlaps" &&
          contractsOverlaps[c.id] &&
          contractsOverlaps[c.id].size > 0) ||
        c.codes.includes(filter) ||
        c.orgUnit.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.startPeriod.includes(filter) ||
        c.endPeriod.includes(filter)
    )
  : contracts;
  return filteredContracts;
}

export const getOverlaps = (contractId, contractsOverlaps, contractsById) => {
  if (!contractsOverlaps[contractId]) {
    return [];
  }
  return Array.from(contractsOverlaps[contractId])
            .map((contractId) => contractsById[contractId]);
};