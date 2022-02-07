import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useTranslation } from "react-i18next";
const ConfirmDialog = (props) => {
  const { t } = useTranslation();
  // title — This is what will show as the dialog title
  // children — This is what will show in the dialog content. This can be a string, or it can be another, more complex component.
  // open — This is what tells the dialog to show.
  // setOpen — This is a state function that will set the state of the dialog to show or close.
  // onConfirm — This is a callback function when the user clicks Yes.
  const { title, children, open, setOpen, onConfirm } = props;
  return (
    <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="confirm-dialog">
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => setOpen(false)} color="secondary">
          {t("confirmNo")}
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setOpen(false);
            onConfirm();
          }}
          color="secondary"
        >
          {t("confirmYes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ConfirmDialog;
