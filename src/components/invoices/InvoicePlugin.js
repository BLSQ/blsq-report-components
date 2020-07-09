import invoiceRoutes from "./invoiceRoutes";
import InvoiceDrawerLinks from "./InvoiceDrawerLinks";

const invoicePlugin = {
  key: "@blsq/blsq-report-components#invoices",
  extensions: {
    "core.routes": [invoiceRoutes],
    "core.drawerLinks": [InvoiceDrawerLinks],
  },
};

export default invoicePlugin;
