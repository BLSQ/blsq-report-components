import React, { useState, useEffect } from "react";
import PluginRegistry from "../core/PluginRegistry";

function ContractPage(props) {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const contractService = PluginRegistry.extensions("contracts.service")[0];
      setIsLoading(true);
      const contracts = await contractService.findAll();
      setContracts(contracts);
      setIsLoading(false);
    };
    fetchData();
  }, [setIsLoading, setContracts]);

  return (
    <div>
      <h1>Hello !</h1>
      {isLoading ? <div>Loading ...</div> : <div></div>}
      {contracts &&
        contracts.map(contract => (
          <p>
            {contract.startPeriod} {contract.endPeriod}
          </p>
        ))}
    </div>
  );
};

export default ContractPage;
