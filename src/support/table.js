
export const textLabels = (t) => ({
    body: {
      noMatch: t("table.body.noMatch"),
      toolTip: t("table.body.toolTip"),
      columnHeaderTooltip: column =>
        t("table.body.columnHeaderTooltip", { label: column.label.toLowerCase() })
    },
    pagination: {
      next: t("table.pagination.next"),
      previous: t("table.pagination.previous"),
      rowsPerPage: t("table.pagination.rowsPerPage"),
      displayRows: t("table.pagination.displayRows"),
    },
    toolbar: {
      search: t("table.toolbar.search"),
      downloadCsv: t("table.toolbar.downloadCsv"),
      print: t("table.toolbar.print"),
      viewColumns: t("table.toolbar.viewColumns"),
      filterTable: t("table.toolbar.filterTable"),
    },
    filter: {
      all: t("table.filter.all"),
      title: t("table.filter.title"),
      reset: t("table.filter.reset"),
    },
    viewColumns: {
      title: t("table.viewColumns.title"),
      titleAria: t("table.viewColumns.titleAria"),
    },
    selectedRows: {
      text: t("table.selectedRows.text"),
      delete: t("table.selectedRows.delete"),
      deleteAria: t("table.selectedRows.deleteAria"),
    },
})


export const defaultOptions = (t) => ({
    // filterType: 'checkbox',
    enableNestedDataAccess: '.',
    textLabels: textLabels(t)
})