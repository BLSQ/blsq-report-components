import ContractService from "./ContractService";
import ContractRoutes from "./ContractRoutes";
import PluginRegistry from "../core/PluginRegistry";
import DefaultValidator from "./validations/DefaultValidator";

const PROGRAM_FIELDS =
  "id,name,programStages[programStageDataElements[compulsory,dataElement[id,name,code,optionSet[id,name,code,options[id,code,name]]]]";

class ContractPlugin {
  constructor() {
    this.key = "@blsq/blsq-report-components#contracts";
    this.extensions = {
      "core.routes": [ContractRoutes],
      "contracts.validator": [DefaultValidator],
    };
  }

  initializer = async (options) => {
    const api = options.api;
    this.config = PluginRegistry.extension("contracts.config");
    const config = this.config;
    if (config.programId && config.allEventsSqlViewId) {
      const program = await api.get("programs/" + config.programId, {
        fields: PROGRAM_FIELDS,
      });
      const contractService = new ContractService(api, program, config.allEventsSqlViewId);
      this.extensions["contracts.service"] = [contractService];
      this.extensions["contracts.program"] = [program];
    }
  };
}

export default new ContractPlugin();
