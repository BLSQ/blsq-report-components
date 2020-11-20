import dataEntryRoutes from "./dataEntryRoutes";

class DataEntryPlugin {
  constructor() {
    this.key = "@blsq/blsq-report-components#dataentry";
    this.extensions = {
      "core.routes": [dataEntryRoutes],
    };
  }
}

export default new DataEntryPlugin();
