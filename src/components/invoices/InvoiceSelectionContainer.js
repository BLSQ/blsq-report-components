import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import LinearProgress from "@material-ui/core/LinearProgress";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItem";
import { Link } from "react-router-dom";
import OrgUnitAutoComplete from "./OrgUnitAutoComplete";
import PeriodPicker from "./PeriodPicker";
import OuPicker from "./OuPicker";
import DatePeriods from "../../support/DatePeriods";

import debounce from "lodash/debounce";

const styles = theme => ({
  paper: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
    minHeight: "600px"
  }),
  table: {
    minWidth: "100%"
  },
  filters: {
    marginLeft: "30px"
  }
});

class InvoiceSelectionContainer extends Component {
  static defaultProps = {
    periodFormat: {
      quarterly: "quarter",
      monthly: "yearMonth"
    }
  };

  constructor(props) {
    super(props);
    this.searchOrgunit = debounce(this.searchOrgunit.bind(this), 1500);
    this.onOuSearchChange = this.onOuSearchChange.bind(this);
    this.onPeriodChange = this.onPeriodChange.bind(this);
    this.synchronizeUrl = debounce(this.synchronizeUrl.bind(this), 200);
    this.onParentOrganisationUnit = this.onParentOrganisationUnit.bind(this);
    this.state = {
      invoiceDialogOpen: false,
      invoiceLinks: undefined,
      invoiceOrgUnitName: undefined
    };
  }

  handleInvoiceDialogClose = () => {
    this.setState({ invoiceDialogOpen: false, invoiceLinks: undefined });
  };

  componentDidMount() {
    this.searchOrgunit();
  }

  onOuSearchChange(event) {
    let ouSearchValue = event.target.value;
    this.synchronizeHistory(
      this.props.parent,
      ouSearchValue,
      this.props.period
    );
  }

  synchronizeUrl() {
    this.setState({ loading: true });
    synchronizeHistory(
      this.props.parent,
      this.props.ouSearchValue,
      this.props.period
    );
  }

  synchronizeHistory(parent, ouSearchValue, period) {
    if (!ouSearchValue) {
      ouSearchValue = "";
    }
    const parentParam = parent ? "&parent=" + parent : "";
    this.props.history.replace({
      pathname: "/select",
      search: "?q=" + ouSearchValue + "&period=" + period + parentParam
    });
  }

  onParentOrganisationUnit(orgUnit) {
    this.synchronizeHistory(
      orgUnit,
      this.props.ouSearchValue,
      this.props.period
    );
  }

  onPeriodChange(period) {
    this.synchronizeHistory(
      this.props.parent,
      this.props.ouSearchValue,
      period
    );
  }

  async searchOrgunit() {
    let searchvalue = this.props.ouSearchValue
      ? this.props.ouSearchValue.trim()
      : "";
    if (this.props.currentUser) {
      this.setState({ loading: true });
      const user = this.props.currentUser;
      const orgUnitsResp = await this.props.dhis2.searchOrgunits(
        searchvalue,
        user.dataViewOrganisationUnits,
        this.props.contractedOrgUnitGroupId,
        this.props.parent
      );
      let categoryList = [];
      if (this.props.dhis2.categoryComboId) {
        categoryList = await this.searchCategoryCombo(searchvalue);
        categoryList.forEach(cl =>
          orgUnitsResp.organisationUnits.push({
            id: cl.id,
            shortName: cl.shortName,
            name: cl.name,
            ancestors: [],
            level: cl.level,
            organisationUnitGroups: cl.organisationUnitGroups
          })
        );
      }
      this.setState({
        orgUnits: orgUnitsResp.organisationUnits,
        loading: false
      });
    }
  }

  async searchCategoryCombo(searchvalue) {
    const categoryCombos = await this.props.dhis2.getCategoryComboById();
    let optionsCombos = categoryCombos.categoryOptionCombos.filter(
      cc => cc.name.toLowerCase().indexOf(searchvalue.toLowerCase()) > -1
    );
    return optionsCombos.map(option => {
      return {
        id: option.id,
        shortName: option.shortName,
        name: option.name,
        ancestors: [],
        level: 0,
        organisationUnitGroups: [
          { name: "", id: this.props.contractedOrgUnitGroupId }
        ]
      };
    });
  }

  buildInvoiceLink = (orgUnit, quarterPeriod, invoiceType) => {
    return {
      invoiceName: invoiceType.name,
      links: DatePeriods.split(quarterPeriod, invoiceType.frequency).map(
        subPeriod => ({
          key: invoiceType.code + "-" + subPeriod + "-" + orgUnit.id,
          to:
            "/invoices/" +
            subPeriod +
            "/" +
            orgUnit.id +
            "/" +
            invoiceType.code,
          title: subPeriod,
          label: DatePeriods.displayName(
            subPeriod,
            invoiceType.periodFormat ||
              (invoiceType.frequency == "quarterly"
                ? "quarter"
                : invoiceType.frequency == "sixMonthly"
                ? "sixMonth"
                : "monthYear")
          )
        })
      )
    };
  };

  buildInvoiceAnchors = linkObj => {
    return (
      <React.Fragment>
        <Typography variant="overline" gutterBottom>
          {linkObj.invoiceName}{" "}
        </Typography>
        {linkObj.links.map(link => (
          <Button
            key={link.key}
            variant="text"
            color="primary"
            size="small"
            component={Link}
            to={link.to}
            title={link.title}
          >
            {link.label}
          </Button>
        ))}
      </React.Fragment>
    );
  };

  buildInvoiceTypes = (invoices, orgUnit) => {
    const codes = invoices.getInvoiceTypeCodes(orgUnit);

    if (codes === undefined || codes.length === 0) {
      return null;
    }

    return invoices.getInvoiceTypes(codes);
  };

  buildInvoiceLinks(orgUnit, period, invoices) {
    const invoiceTypes = this.buildInvoiceTypes(invoices, orgUnit);
    const quarterPeriod = DatePeriods.split(period, "quarterly")[0];

    var invoiceLinks = invoiceTypes.map(invoiceType =>
      this.buildInvoiceLink(orgUnit, quarterPeriod, invoiceType)
    );

    this.setState({
      invoiceOrgUnitName: orgUnit.name,
      invoiceLinks: invoiceLinks,
      invoiceDialogOpen: true
    });
  }

  evalInvoice = (orgUnit, period, invoices) => {
    const invoiceTypes = this.buildInvoiceTypes(invoices, orgUnit);
    const quarterPeriod = DatePeriods.split(period, "quarterly")[0];
    debugger;
    return invoiceTypes !== null ? (
      invoiceTypes.length > 1 ? (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={() =>
            this.buildInvoiceLinks(
              orgUnit,
              this.props.period,
              this.props.invoices
            )
          }
        >
          {this.props.t("show_avalaible_invoices")}
        </Button>
      ) : (
        this.buildInvoiceAnchors(
          this.buildInvoiceLink(orgUnit, quarterPeriod, invoiceTypes[0])
        )
      )
    ) : (
      "Missing invoice types..."
    );
  };

  componentWillReceiveProps(nextProps) {
    const dirty =
      nextProps.ouSearchValue !== this.props.ouSearchValue ||
      nextProps.parent != this.props.parent;
    this.props = nextProps;

    const user = this.props.currentUser;
    if (user && dirty) {
      this.searchOrgunit();
    }
  }

  render() {
    const { classes, t } = this.props;
    return (
      <Paper className={classes.paper} square>
        <Typography variant="h5" component="h5" gutterBottom>
          {t("report_and_invoices")}
        </Typography>
        <div className={classes.filters}>
          <OrgUnitAutoComplete
            organisationUnits={this.props.topLevelsOrgUnits}
            onChange={this.onParentOrganisationUnit}
            selected={this.props.parent}
          />
          <br />

          <OuPicker
            onOuSearchChange={this.onOuSearchChange}
            ouSearchValue={this.props.ouSearchValue}
          />

          <PeriodPicker
            period={this.props.period}
            onPeriodChange={this.onPeriodChange}
            periodFormat={this.props.periodFormat}
          />
          <br />
          {this.state.loading ? <LinearProgress variant="query" /> : ""}
        </div>

        <br />

        <br />
        <br />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{this.props.t("name")}</TableCell>
              <TableCell>{this.props.levels[1]}</TableCell>
              <TableCell>{this.props.levels[2]}</TableCell>
              <TableCell>{this.props.t("invoice")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.orgUnits &&
              this.state.orgUnits.map((orgUnit, index) => (
                <TableRow key={orgUnit.id + index}>
                  <TableCell
                    component="th"
                    scope="row"
                    title={orgUnit.organisationUnitGroups
                      .map(g => g.name)
                      .join(", ")}
                  >
                    {orgUnit.name}
                  </TableCell>
                  <TableCell>
                    {orgUnit.ancestors[1] && orgUnit.ancestors[1].name}
                  </TableCell>
                  <TableCell>
                    {orgUnit.ancestors[2] && orgUnit.ancestors[2].name}
                  </TableCell>
                  <TableCell>
                    {this.evalInvoice(
                      orgUnit,
                      this.props.period,
                      this.props.invoices
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {this.state.invoiceLinks && (
          <Dialog
            fullWidth={true}
            maxWidth="md"
            open={this.state.invoiceDialogOpen}
            onClose={this.handleInvoiceDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="simple-dialog-title">
              {this.state.invoiceOrgUnitName}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                <List>
                  {this.state.invoiceLinks.map((link, linkIndex) => (
                    <li key={link.invoiceName + "-" + linkIndex}>
                      {this.buildInvoiceAnchors(link)}
                      <Divider />
                    </li>
                  ))}
                </List>
              </DialogContentText>
            </DialogContent>
          </Dialog>
        )}
      </Paper>
    );
  }
}

InvoiceSelectionContainer.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(withNamespaces()(InvoiceSelectionContainer));
