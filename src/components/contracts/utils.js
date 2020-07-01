
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
    for (const [orgUnitId, contractsForOrgUnit] of Object.entries(
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