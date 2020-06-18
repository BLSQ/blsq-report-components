import Contract from "./Contract";

class ContractService {
  constructor(api, program, allEventsSqlViewId) {
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
    contract.orgUnit = { id: event.orgUnit, name: event.orgUnitName };

    return new Contract(contract);
  }

  async findAll() {
    let events;

    const rawEvents = await api.get(
      "sqlViews/" +
        this.allEventsSqlViewId +
        "/data.json?var=programId:" +
        this.program.id +
        "&paging=false"
    );
    events = rawEvents.listGrid.rows.map(row => {
      let dataVals = [];
      try {
        dataVals = JSON.parse(row[1].value);
      } catch (err) {
        throw new Error(
          "failed to parse : " + row[1].value + " " + err.message
        );
      }
      const dataValues = Object.keys(dataVals).map(k => {
        return {
          dataElement: k,
          ...dataVals[k]
        };
      });
      return {
        event: row[0],
        orgUnit: row[2],
        orgUnitName: row[3],
        program: row[4],
        programStage: row[5],
        dataValues: dataValues
      };
    });

    const contracts = events.map(e => this.toContract(e));
    return contracts;
  }

  async deleteContract(contractId) {
    await api.delete("events/" + contractId);
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
