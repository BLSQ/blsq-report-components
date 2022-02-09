import React from "react";

const ContractsResume = ({ contractInfos, progress }) => (
  <div>
    {contractInfos && (
      <span>
        {contractInfos.length} orgunits, {contractInfos.filter((c) => c.synchronized).length} already synchronized.
      </span>
    )}
  </div>
);

export default ContractsResume;
