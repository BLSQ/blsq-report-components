import React, { Component } from "react";
import PluginRegistry from "../core/PluginRegistry";
import ArrowIcon from "@material-ui/icons/ArrowRightAlt";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import Chip from "@material-ui/core/Chip";
import CardContent from "@material-ui/core/CardContent";

class ContractPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.fetchData = this.fetchData.bind(this);
  }

  async componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const contractService = PluginRegistry.extensions("contracts.service")[0];
    if (contractService) {
      this.setState({ isLoading: true });
      const contracts = await contractService.findAll();
      this.setState({ contracts: contracts, isLoading: false });
    }
  }

  render() {
    const { isLoading, contracts } = this.state;
    return (
      <div>
        <h1>Contracts</h1>
        {isLoading ? <div>Loading ...</div> : <div></div>}
        {contracts && <Typography>{contracts.length} contracts</Typography>}
        {contracts && (
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              alignItems: "flex-start",
              alignContent: "space-around"
            }}
          >
            {contracts.map(contract => (
              <Card
                key={contract.id}
                style={{
                  minWidth: "500px",
                  margin: "20px",
                  flex: "10 10 20%",
                  alignSelf: "stretch",
                  alignContent: "stretch"
                }}
              >
                <CardContent>
                  <Typography
                    color="textPrimary"
                    style={{ fontWeight: "bold" }}
                  >
                    {contract.orgUnit.name} <code>{contract.orgUnit.id}</code>
                  </Typography>

                  <Typography
                    style={{
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    {contract.startPeriod} <ArrowIcon /> {contract.endPeriod}{" "}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {contract.codes.map(code => (
                      <Chip label={code}></Chip>
                    ))}
                  </Typography>

                  <Typography color="textSecondary" title={contract.orgUnit.path}>
                    {contract.orgUnit.ancestors
                      .slice(1, -1)
                      .map(a => a.name)
                      .join(" > ")}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default ContractPage;
