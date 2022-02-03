import React from "react";

const AccessDisplay = ({ access, displayName, dhis2RootUrl }) => {
  const publicWriteAccess = access.includes("w") && displayName == "Public";
  const metadataWriteAccess = access[1] == "w";
  return (
    <div>
      <span style={{ fontFamily: "monospace" }}>{access}&nbsp;</span>
      <span>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={dhis2RootUrl + "/dhis-web-maintenance/index.html#/list/dataSetSection/dataSet"}
        >
          {displayName}
        </a>
        {publicWriteAccess && <span style={{ color: "red" }}> public ! write access !!"</span>}
        {metadataWriteAccess && <span style={{ color: "red" }}> metadata write access !!"</span>}
      </span>
    </div>
  );
};

export default AccessDisplay;
