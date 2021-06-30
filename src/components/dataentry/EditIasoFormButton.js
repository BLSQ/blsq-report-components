import React, { useContext } from "react";

import FormDataContext from "./FormDataContext";
import { Button } from "@material-ui/core";
import LoadingSpinner from "../shared/LoadingSpinner";

const EditIasoFormButton = ({ formId, currentUserId, period, orgUnitId, iasoToken, dataSetId }) => {
  const formDataContext = useContext(FormDataContext);
  const currentDataSetId = dataSetId ? dataSetId : formDataContext.dataSet.id;
  const [loading, setLoading] = React.useState(false);
  const iasoHost = "https://iaso.bluesquare.org";
  const iasoUrl = `${iasoHost}/api/enketo/public_create_url/`;
  const returnUrl = encodeURIComponent(window.location.href);

  const handleClick = async () => {
    setLoading(true);
    try {
      const resp = await fetch(
        `${iasoUrl}?token=${iasoToken}&form_id=${formId}&period=${period}&external_user_id=${currentUserId}&external_org_unit_id=${orgUnitId}&to_export=true&return_url=${returnUrl}`,
      ).then((r) => r.json());
      if (resp.url) {
        window.location.href = resp.url;
      } else {
        alert("Sorry we can't contact iaso " + JSON.stringify(resp));
      }
    } catch (error) {
      alert("Sorry we can't contact iaso " + JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const writable = formDataContext.isDataWritable(currentDataSetId);


  return (
    <Button
      color="secondary"
      title={"Edit in iaso : " + formId}
     
      onClick={handleClick}
      disabled={loading || !writable}
    >
      {loading ? <LoadingSpinner></LoadingSpinner>  : "Edit"}
    </Button>
  );
};

export default EditIasoFormButton;
