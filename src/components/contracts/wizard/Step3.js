import React, { useEffect, useState } from "react";

const Step3 = ({ validatedContracts, progress }) => (
  <div>
    <h2>Step 3 : Import summary</h2>
    Confirm the import of {validatedContracts.length} contracts. <br></br>
    {progress}
  </div>
);

export default Step3;
