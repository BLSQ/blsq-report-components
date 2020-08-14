const tables = (theme) => ({
  tableContainer: {
    padding: 0,
    margin: 0,
    boxShadow: "none",
    "& .MuiTableSortLabel-active": {
      top: 6,
    },
  },
  rowError: {
    "& .MuiTableCell-body": {
      color: "red",
    },
  },
  iconLink: {
    color: "inherit",
    height: 24,
    display: "flex",
    alignItems: "baseline",
  },
  chip: {
    marginRight: theme.spacing(2),
  },
  tableTitle: {
    marginLeft: -theme.spacing(2),
    display: "inline-block",
  },
  cellCentered: {
    textAlign: "center",
  },
});

export default tables;
