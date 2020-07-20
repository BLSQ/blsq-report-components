const keys = {
  report_and_invoices: "Report & Invoices",
  app_name: "ORBF2 - Invoices & Reports",
  generated_at: "Generated on",
  print: "Print",
  orgUnit_name: "Organisation Unit name",
  search_org_unit: "Search or select parent organisation unit",
  limit_org_unit_under: "Limit to the child organisation unit",
  period: "Period",
  invoice: "Invoice",
  name: "Name",
  show_avalaible_invoices: "Select invoice",
  missing_invoice_types: "Missing invoice...",
  start_period: "Start period",
  end_period: "End period",
  codes: "Codes",
  actions: 'Action(s)',
  edit: 'Editer',
  table:{
    noMatch: "Sorry, no matching records found",
    body: {
      noMatch: "Sorry, no matching records found",
      toolTip: "Sort",
      columnHeaderTooltip: column => `Sort for ${column.label}`
    },
    pagination: {
      next: "Next Page",
      previous: "Previous Page",
      rowsPerPage: "Rows per page:",
      displayRows: "of",
    },
    toolbar: {
      search: "Search",
      downloadCsv: "Download CSV",
      print: "Print",
      viewColumns: "View Columns",
      filterTable: "Filter Table",
    },
    filter: {
      all: "All",
      title: "FILTERS",
      reset: "RESET",
    },
    viewColumns: {
      title: "Show Columns",
      titleAria: "Show/Hide Table Columns",
    },
    selectedRows: {
      text: "row(s) selected",
      delete: "Delete",
      deleteAria: "Delete Selected Rows",
    },
  }
};
export default keys;
