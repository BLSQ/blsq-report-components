import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import DatePeriods from "../../support/DatePeriods";

function InvoiceLink(orgUnit, invoices, period) {
  const codes = invoices.getInvoiceTypeCodes(orgUnit, period);

  if (codes === undefined || codes.length === 0) {
    return null;
  }

  const invoiceTypes = invoices.getInvoiceTypes(codes, period);

  const quarterPeriod = DatePeriods.split(period, "quarterly")[0];

  return invoiceTypes.map(invoiceType => {
    return {
      invoiceName: invoiceType.name,
      invoiceLinks: DatePeriods.split(quarterPeriod, invoiceType.frequency).map(
        subPeriod => (
          <Button
            key={invoiceType.code + "-" + subPeriod + "-" + orgUnit.id}
            variant="text"
            color="primary"
            size="small"
            component={Link}
            to={
              "/reports/" +
              subPeriod +
              "/" +
              orgUnit.id +
              "/" +
              invoiceType.code
            }
            title={subPeriod}
          >
            {DatePeriods.displayName(
              subPeriod,
              invoiceType.periodFormat ||
                (invoiceType.frequency == "quarterly"
                  ? "quarter"
                  : invoiceType.frequency == "sixMonthly"
                  ? "sixMonth"
                  : "monthYear")
            )}
          </Button>
        )
      )
    };
  });
}

export default InvoiceLink;
