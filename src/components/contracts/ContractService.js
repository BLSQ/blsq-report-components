import Contract from "./Contract";
import {
  getOrgUnitCoverage,
  checkSubContractCoverage,
  checkNonVisibleOverlap,
  getOverlaps,
} from "./utils";

class ContractService {
  constructor(api, program, allEventsSqlViewId) {
    this.api = api;
    this.program = program;
    this.standardContractFields = [
      "contract_start_date",
      "contract_end_date",
      "contract_main_orgunit",
    ];
    const toMappings = (program) => {
      const dataElements = program.programStages.flatMap((ps) =>
        ps.programStageDataElements.map((psde) => psde.dataElement),
      );
      const mappings = {};
      dataElements.forEach((de) => (mappings[de.id] = de));
      return mappings;
    };
    this.mappings = toMappings(this.program);
    this.allEventsSqlViewId = allEventsSqlViewId;
  }

  toContract(event) {
    const contract = { id: event.event };
    event.dataValues.forEach((dv) => {
      const de = this.mappings[dv.dataElement];
      contract[de.code] = dv.value;
    });
    contract.orgUnit = {
      id: event.orgUnit,
      name: event.orgUnitName,
      path: event.orgUnitPath,
      ancestors: event.ancestors || [],
    };
    return new Contract(contract);
  }

  toContractsById = (contracts) => {
    const contractsById = {};
    contracts.forEach((contract) => (contractsById[contract.id] = contract));
    return contractsById;
  };

  toContractFields = (program) => {
    const dataElements = program.programStages.flatMap((ps) =>
      ps.programStageDataElements.map((psde) => psde.dataElement),
    );
    return dataElements.map((de) => {
      return {
        standardField: this.standardContractFields.includes(de.code),
        ...de,
      };
    });
  };

  toOverlappings = (contracts) => {
    const contractsByOrgUnits = {};
    contracts.forEach((contract) => {
      if (contractsByOrgUnits[contract.orgUnit.id] === undefined) {
        contractsByOrgUnits[contract.orgUnit.id] = [];
      }
      contractsByOrgUnits[contract.orgUnit.id].push(contract);
    });

    const contractsOverlaps = {};
    for (const [, contractsForOrgUnit] of Object.entries(contractsByOrgUnits)) {
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

  async findAll() {
    let events;

    const rawEvents = await this.api.get(
      "sqlViews/" +
        this.allEventsSqlViewId +
        "/data.json?var=programId:" +
        this.program.id +
        "&paging=false",
    );
    const indexes = {};
    rawEvents.listGrid.headers.forEach((h, index) => (indexes[h.name] = index));

    events = rawEvents.listGrid.rows.map((row) => {
      let dataVals = [];
      try {
        dataVals = JSON.parse(row[indexes.data_values].value);
      } catch (err) {
        throw new Error(
          "failed to parse : " +
            row[indexes.data_values].value +
            " " +
            err.message,
        );
      }
      const dataValues = Object.keys(dataVals).map((k) => {
        return {
          dataElement: k,
          ...dataVals[k],
        };
      });
      const ancestors = [];
      const level = row[indexes.level];
      for (var i = 1; i <= level; i += 1) {
        const idIndex = indexes["uidlevel" + i];
        const nameIndex = indexes["namelevel" + i];
        ancestors.push({
          id: row[idIndex],
          name: row[nameIndex],
        });
      }

      return {
        event: row[indexes.event_id],
        orgUnit: row[indexes.org_unit_id],
        orgUnitName: row[indexes.org_unit_name],
        orgUnitPath: row[indexes.org_unit_path],
        ancestors: ancestors,
        program: row[indexes.program_id],
        programStage: row[indexes.program_stage_id],
        dataValues: dataValues,
      };
    });

    const contracts = events.map((e) => this.toContract(e));

    return contracts;
  }

  async fetchContracts(orgUnitId) {
    let contracts = await this.findAll();
    let subContracts = [];
    let mainContracts = [];
    const allContractsOverlaps = this.toOverlappings(contracts);
    contracts.sort((a, b) => (a.endPeriod < b.endPeriod ? 1 : -1));
    if (orgUnitId) {
      subContracts = contracts.filter(
        (c) =>
          c.fieldValues.contract_main_orgunit &&
          c.fieldValues.contract_main_orgunit === orgUnitId,
      );
      mainContracts = contracts.filter(
        (c) =>
          c.orgUnit.id === orgUnitId && !c.fieldValues.contract_main_orgunit,
      );

      const orgUnitCoverage = getOrgUnitCoverage(mainContracts);
      const subContractsOverlaps = this.toOverlappings(subContracts);
      const subContractsById = this.toContractsById(subContracts);
      const mainContractsOverlaps = this.toOverlappings(mainContracts);
      const mainContractsById = this.toContractsById(mainContracts);
      subContracts.forEach((c, i) => {
        const coverageIssue = checkSubContractCoverage(c, orgUnitCoverage);
        const nonVisibleOverlaps = checkNonVisibleOverlap(
          c,
          mainContracts,
          subContracts,
          contracts,
          allContractsOverlaps,
        );
        const visibleOverlaps = getOverlaps(
          c.id,
          subContractsOverlaps,
          subContractsById,
        );
        c.status =
          !coverageIssue && !nonVisibleOverlaps && visibleOverlaps.length === 0;
        c.statusDetail = {
          coverageIssue,
          nonVisibleOverlaps,
          visibleOverlaps,
        };
        c.rowIndex = i + 1;
      });
      mainContracts.forEach((c, i) => {
        const visibleOverlaps = getOverlaps(
          c.id,
          mainContractsOverlaps,
          mainContractsById,
        );
        c.status = visibleOverlaps.length === 0;
        c.statusDetail = {
          visibleOverlaps,
        };
        c.rowIndex = i + 1;
      });
      return {
        allContracts: contracts,
        allContractsOverlaps,
        subContracts: {
          contracts: subContracts,
          contractsById: subContractsById,
          contractsOverlaps: subContractsOverlaps,
        },
        mainContracts: {
          contracts: mainContracts,
          contractsById: mainContractsById,
          contractsOverlaps: mainContractsOverlaps,
        },
        contractFields: this.toContractFields(this.program),
      };
    }
    const contractsOverlaps = this.toOverlappings(contracts);
    const contractsById = this.toContractsById(contracts);
    contracts.forEach((c) => {
      const visibleOverlaps = getOverlaps(
        c.id,
        contractsOverlaps,
        contractsById,
      );
      c.status = visibleOverlaps.length === 0;
      c.statusDetail = {
        visibleOverlaps,
      };
    });

    return {
      contracts,
      contractsById,
      contractsOverlaps,
      contractFields: this.toContractFields(this.program),
    };
  }

  async deleteContract(contractId) {
    await this.api.delete(`events/${contractId}`);
  }

  getEvent = (contractInfo, orgUnitId) => {
    const dataValues = [];
    const ignoredFields = ["id", "orgUnit"];

    Object.keys(contractInfo).forEach((fieldKey) => {
      if (!ignoredFields.includes(fieldKey)) {
        const dataElement = Object.values(this.mappings).find(
          (mapping) => mapping.code === fieldKey,
        );
        if (dataElement === undefined) {
          throw new Error(
            "no mapping for field " +
              fieldKey +
              " vs " +
              Object.values(this.mappings)
                .map((m) => m.code)
                .join(","),
          );
        }
        dataValues.push({
          dataElement: dataElement.id,
          value: contractInfo[fieldKey],
        });
      }
    });

    const event = {
      orgUnit: orgUnitId,
      program: this.program.id,
      eventDate: contractInfo.contract_start_date,
      programStage: this.program.programStages[0].id,
      dataValues,
    };
    return event;
  };

  async createContract(orgUnitIds, contract) {
    const events = orgUnitIds.map((orgUnitId) =>
      this.getEvent(contract.fieldValues, orgUnitId),
    );
    const res = await this.api.post("events", { events });
    return res;
  }

  async updateContract(contract) {
    const event = this.getEvent(
      contract.fieldValues,
      contract.fieldValues.orgUnit.id,
    );
    const res = await this.api.update(`events/${contract.id}`, {
      event,
    });
    return res;
  }
}

export default ContractService;
