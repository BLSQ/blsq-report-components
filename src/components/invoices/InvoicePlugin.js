import invoiceRoutes from "./invoiceRoutes";
import InvoiceDrawerLinks from "./InvoiceDrawerLinks";

const invoicePlugin = {
  extensions: {
    "core.routes": [invoiceRoutes],
    "core.drawerLinks": [InvoiceDrawerLinks],
  },
};

export default invoicePlugin;
