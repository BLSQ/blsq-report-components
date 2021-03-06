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
    "&>span": {
      justifyContent: "center",
    },
  },
  headerCell: {
    fontWeight: "bold",
  },
  spanCentered: {
    textAlign: "center",
    display: "block",
    margin: "auto",
  },
  tableIcon: {
    position: "relative",
    top: 3,
  },
});

export default tables;
