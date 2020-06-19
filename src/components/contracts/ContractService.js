import Contract from "./Contract";

class ContractService {
  constructor(api, program, allEventsSqlViewId) {
    this.api = api;
    this.program = program;
    const toMappings = program => {
      const dataElements = program.programStages.flatMap(ps =>
        ps.programStageDataElements.map(psde => psde.dataElement)
      );
      const mappings = {};
      dataElements.forEach(de => (mappings[de.id] = de));
      return mappings;
    };
    this.mappings = toMappings(this.program);
    this.allEventsSqlViewId = allEventsSqlViewId;
  }

  toContract(event) {
    const contract = { id: event.event };
    event.dataValues.forEach(dv => {
      const de = this.mappings[dv.dataElement];
      contract[de.code] = dv.value;
    });
    contract.orgUnit = { id: event.orgUnit, name: event.orgUnitName, path: event.orgUnitPath, ancestors: event.ancestors };

    return new Contract(contract);
  }

  async findAll() {
    let events;

    const rawEvents = await this.api.get(
      "sqlViews/" +
        this.allEventsSqlViewId +
        "/data.json?var=programId:" +
        this.program.id +
        "&paging=false"
    );
    const indexes = {};
    rawEvents.listGrid.headers.forEach((h, index) => (indexes[h.name] = index));

    events = rawEvents.listGrid.rows.map(row => {
      let dataVals = [];
      try {
        dataVals = JSON.parse(row[indexes.data_values].value);
      } catch (err) {
        throw new Error(
          "failed to parse : " +
            row[indexes.data_values].value +
            " " +
            err.message
        );
      }
      const dataValues = Object.keys(dataVals).map(k => {
        return {
          dataElement: k,
          ...dataVals[k]
        };
      });
      const ancestors = []
      const level = row[indexes.level]
      for (var i = 1; i <= level ; i +=1) {
        const idIndex = indexes["uidlevel"+i]
        const nameIndex =indexes["namelevel"+i]
        ancestors.push({
          id: row[idIndex],
          name: row[nameIndex]
        })
      }

      return {
        event: row[indexes.event_id],
        orgUnit: row[indexes.org_unit_id],
        orgUnitName: row[indexes.org_unit_name],
        orgUnitPath: row[indexes.org_unit_path],
        ancestors: ancestors,
        program: row[indexes.program_id],
        programStage: row[indexes.program_stage_id],
        dataValues: dataValues
      };
    });

    const contracts = events.map(e => this.toContract(e));

    return contracts;
  }

  async deleteContract(contractId) {
    await this.api.delete("events/" + contractId);
  }

  async createContract(orgUnitIds, contractInfo) {
    const events = orgUnitIds.map(orgUnitId => {
      const dataValues = [];

      Object.keys(contractInfo).forEach(field => {
        dataValues.push({
          dataElement: Object.values(this.mappings).find(
            mapping => mapping.code == field
          ).id,
          value: contractInfo[field]
        });
      });

      const event = {
        orgUnit: orgUnitId,
        program: this.program.id,
        eventDate: contractInfo.startContract,
        programStage: this.program.programStages[0].id,
        dataValues: dataValues
      };
      return event;
    });

    const createResp = await api.post("events", { events });
    return createResp;
  }
}

export default ContractService;
