import React from "react";

// http://localhost:3000/function%20AccessDisplay(_ref)%20%7B%20%20var%20access%20=%20_ref.access,%20%20%20%20%20%20displayName%20=%20_ref.displayName,%20%20%20%20%20%20dhis2RootUrl%20=%20_ref.dhis2RootUrl;%20%20var%20publicWriteAccess%20=%20access.includes(%22w%22)%20&&%20displayName%20==%20%22Public%22;%20%20var%20metadataWriteAccess%20=%20access[1]%20==%20%22w%22;%20%20return%20/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4___default.a.createElement(%22div%22,%20null,%20/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4___default.a.createElement(%22span%22,%20{%20%20%20%20style:%20{%20%20%20%20%20%20fontFamily:%20%22monospace%22%20%20%20%20}%20%20},%20access,%20%22\xA0%22),%20/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4___default.a.createElement(%22span%22,%20null,%20/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4___default.a.createElement(%22a%22,%20{%20%20%20%20target:%20%22_blank%22,%20%20%20%20rel:%20%22noopener%20noreferrer%22,%20%20%20%20href:%20dhis2RootUrl%20+%20%22/dhis-web-maintenance/index.html#/list/dataSetSection/dataSet%22%20%20},%20displayName),%20publicWriteAccess%20&&%20/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4___default.a.createElement(%22span%22,%20{%20%20%20%20style:%20{%20%20%20%20%20%20color:%20%22red%22%20%20%20%20}%20%20},%20%22%20public%20!%20write%20access%20!!\%22%22),%20metadataWriteAccess%20&&%20/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4___default.a.createElement(%22span%22,%20{%20%20%20%20style:%20{%20%20%20%20%20%20color:%20%22red%22%20%20%20%20}%20%20},%20%22%20metadata%20write%20access%20!!\%22%22)));}/dhis-web-maintenance/index.html#/edit/dataSetSection/dataSet/TKLYACdoCtO

export const AccessDisplay = ({ access, displayName, dhis2RootUrl }) => {
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
