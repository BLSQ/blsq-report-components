import React, { useContext } from "react";

import FormDataContext from "./FormDataContext";
import { Button } from "@material-ui/core";
import LoadingSpinner from "../shared/LoadingSpinner";
import PluginRegistry from "../core/PluginRegistry";

const EditIasoFormButton = ({ formId, currentUserId, period, orgUnitId, iasoToken, dataSetId, iasoUrl }) => {
  const formDataContext = useContext(FormDataContext);
  const currentDataSetId = dataSetId ? dataSetId : formDataContext.dataSet.id;
  const [loading, setLoading] = React.useState(false);

  let iasoHost = iasoUrl || "https://iaso.bluesquare.org";
  let iasoConfig = PluginRegistry.extension("iaso.config");
  if (iasoConfig && iasoConfig.url) {
    iasoHost = iasoConfig.url;
  }

  const iasoEnketoUrl = `${iasoHost}/api/enketo/public_create_url/`;
  const returnUrl = encodeURIComponent(window.location.href);

  const handleClick = async () => {
    setLoading(true);
    try {
      const resp = await fetch(
        `${iasoEnketoUrl}?token=${iasoToken}&form_id=${formId}&period=${period}&external_user_id=${currentUserId}&external_org_unit_id=${orgUnitId}&to_export=true&return_url=${returnUrl}`,
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
      title={"Edit in iaso : " + formId + "\n" + iasoHost}
      onClick={handleClick}
      disabled={loading || !writable}
    >
      {loading ? <LoadingSpinner></LoadingSpinner> : "Edit"}
    </Button>
  );
};

export default EditIasoFormButton;
