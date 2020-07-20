const keys = {
  app_name: "Factures & Rapports",
  report_and_invoices: "Rapports",
  generated_at: "Généré le",
  print: "Imprimer",
  orgUnit_name: "Nom d'unité d'organisation",
  search_org_unit: "Rechercher ou sélectionner l'unité d'organisation parente",
  limit_org_unit_under: "Limiter à l'unité d'organisation enfant",
  period: "Période",
  invoice: "Facture",
  name: "Nom",
  show_avalaible_invoices: "Choisir une facture",
  missing_invoice_types: "Facture introuvable...",
  start_period: "Début de période",
  end_period: "Fin de période",
  codes: "Codes",
  actions: 'Action(s)',
  edit: 'Editer',
  table:{
    table:{
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
  }
};
export default keys;
