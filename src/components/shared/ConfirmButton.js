import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { useTranslation } from "react-i18next";
const ConfirmButton = (props) => {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  // onConfirm = This is a callback function when the user clicks Yes.
  // title = button title
  // message = message inside dialog
  const { onConfirm, title, message } = props;
  return (
    <div>
      <Button onClick={() => setConfirmOpen(true)} color="primary">
        {title}
      </Button>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} aria-labelledby="confirm-dialog">
        <DialogContent>{message}</DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setConfirmOpen(false)} color="secondary">
            {t("confirmNo")}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setConfirmOpen(false);
              onConfirm();
            }}
            color="secondary"
          >
            {t("confirmYes")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default ConfirmButton;
