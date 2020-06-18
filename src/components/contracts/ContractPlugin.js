
import ContractService from "./ContractService"
import ContractRoutes from "./ContractRoutes"

const PROGRAM_FIELDS = "id,name,programStages[programStageDataElements[dataElement[id,name,code,optionSet[id,name,code,options[id,code,name]]]]"



class ContractPlugin {
  constructor(config) {
    this.config = config;
    this.extensions = {
      "core.routes": [ContractRoutes]
    }
  }


  initializer = async options => {
    const api = options.api

    const config = this.config;
    if (config.programId && config.allEventsSqlViewId) {
      const program = await api.get("programs/" + config.programId, {
        fields:PROGRAM_FIELDS
      });
      const contractService = new ContractService(
        api,
        program,
        config.allEventsSqlViewId
      );
      this.extensions["contracts.service"] = contractService
      this.extensions["contracts.program"] = program
    }
  };
}

export default ContractPlugin;
