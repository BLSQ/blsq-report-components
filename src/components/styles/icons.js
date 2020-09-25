import green from "@material-ui/core/colors/green";
import red from "@material-ui/core/colors/red";

const icons = (theme) => ({
  warningIcon: {
    fontSize: 22,
    display: "inline-block",
    marginRight: theme.spacing(1),
    position: "relative",
    top: 2,
  },
  success: {
    color: green[500],
  },
  error: {
    color: red[500],
  },
});

export default icons;
