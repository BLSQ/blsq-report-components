import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";

import PluginRegistry from "../core/PluginRegistry";
import ContractCard from "./ContractCard";
import ContractFilters from "./ContractFilters";
import LoadingSpinner from "../shared/LoadingSpinner";
import { toContractsById, toOverlappings, getFilteredContracts } from "./utils";

class ContractsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      contracts: null,
      contractsById: null,
      contractsOverlaps: {},
      filter: undefined,
      contractService: PluginRegistry.extension("contracts.service"),
    };
  }

  setIsLoading(isLoading) {
    this.setState({
      isLoading,
    })
  }

  setContracts(data) {
    this.setState({
      ...data,
    })
  }

  async fetchData() {
    const { contractService } = this.state;
    if (contractService) {
      this.setIsLoading(true);
      const contracts = await contractService.findAll();
      console.log('fetchData', contracts);
      this.setContracts({
        contracts,
        contractsById: toContractsById(contracts),
        contractsOverlaps: toOverlappings(contracts),
      })
      this.setIsLoading(false);
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const { contracts, filter, contractsOverlaps, isLoading, contractsById } = this.state;
    const filteredContracts = getFilteredContracts(filter, contracts, contractsOverlaps);

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <Typography color="textPrimary">Contracts</Typography>
      </Breadcrumbs>
      <br />
      {
        isLoading
        && <LoadingSpinner />
      }
      <ContractFilters
        filter={filter}
        setFilter={(filter) => this.setState({filter})}
      />
      {contracts && (
        <Typography>
          {filteredContracts.length} matching filter out of {contracts.length}{" "}
          contracts, {Object.keys(contractsOverlaps).length} overlapping
          globaly.
        </Typography>
      )}
      {contracts && (
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            alignItems: "flex-start",
            alignContent: "space-around",
          }}
        >
          {filteredContracts.slice(0, 4 * 3).map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              contractsById={contractsById}
              contractsOverlaps={contractsOverlaps}
            />
          ))}
        </div>
      )}
    </div>
  );
  };
};

export default ContractsPage;
