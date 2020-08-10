import invoiceRoutes from "./invoiceRoutes";
import InvoiceDrawerLinks from "./InvoiceDrawerLinks";
import Orbf2 from "../../support/Orbf2";

class InvoicePlugin {
  constructor() {
    this.key = "@blsq/blsq-report-components#invoices";
    this.extensions = {
      "core.routes": [invoiceRoutes],
      "core.drawerLinks": [InvoiceDrawerLinks],
    };
  }

  initializer = async (options) => {
    const api = options.api;
    const config = api.get("dataStore/hesabu/hesabu");
    const orbf2 = new Orbf2(config);
    this.extensions["invoices.hesabu"] = [orbf2];
  };
}

export default new InvoicePlugin();
