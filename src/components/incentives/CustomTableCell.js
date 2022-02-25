import TableCell from "@material-ui/core/TableCell";
import { withStyles } from "@material-ui/core/styles";

const CustomTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#266696",
    color: theme.palette.common.white,
    textAlign: "center",
    fontWeight: "bold",
    padding: "5px",
    fontSize: "14px",
  },
  root: {
    textAlign: "left",
    align: "center",
  },
}))(TableCell);

export default CustomTableCell;
