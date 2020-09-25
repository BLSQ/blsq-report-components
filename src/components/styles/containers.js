import orange from "@material-ui/core/colors/orange";
import yellow from "@material-ui/core/colors/yellow";

const containers = (theme) => ({
  rootContainer: theme.mixins.gutters({
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    minHeight: "calc(100vh - 160px)",
  }),
  warningBox: {
    padding: theme.spacing(2, 4, 2, 2),
    borderLeft: `5px solid ${orange[200]}`,
    backgroundColor: yellow[100],
    width: "fit-content",
  },
});

export default containers;
