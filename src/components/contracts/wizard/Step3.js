import React, { useEffect, useState } from "react";

const Step3 = ({ validatedContracts, progress }) => (
  <div>
    <h2>Step 3 : Import summary</h2>
    Confirm the import of {validatedContracts.length} contracts. <br></br>
    It will update {validatedContracts.filter((r) => r.action == "update").length} contracts and try to create{" "}
    {validatedContracts.filter((r) => r.action == "create").length} contracts
    {progress}
  </div>
);

export default Step3;
