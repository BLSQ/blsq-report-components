import invoiceRoute from "./InvoiceRoute";

import invoiceSelectionRoute from "./InvoiceSelectionRoute";
import reportRoute from "./ReportRoute";

const invoiceRoutes = params => {
  return [
    invoiceRoute(params),
    reportRoute(params),
    invoiceSelectionRoute(params)
  ];
};

export default invoiceRoutes;
