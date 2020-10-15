import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import { Link } from 'react-router-dom'
import DatePeriods from '../../support/DatePeriods'

const styles = theme => ({})

class InvoiceLinks extends Component {
  static defaultProps = {
    periodFormat: {
      quarterly: 'quarter',
      monthly: 'yearMonth'
    }
  };

  constructor(props) {
    super(props)

    this.state = {
      invoiceDialogOpen: false,
      invoiceLinks: undefined,
      invoiceOrgUnitName: undefined
    }
  }

  handleInvoiceDialogClose = () => {
    this.setState({ invoiceDialogOpen: false, invoiceLinks: undefined })
  };

  buildInvoiceLink = (quarterPeriod, invoiceType) => {
    return {
      invoiceName: invoiceType.name,
      links: DatePeriods.split(quarterPeriod, invoiceType.frequency).map(
        subPeriod => ({
          key: invoiceType.code + '-' + subPeriod + '-' + this.props.orgUnit.id,
          to:
            '/reports/' +
            subPeriod +
            '/' +
            this.props.orgUnit.id +
            '/' +
            invoiceType.code,
          title: subPeriod,
          label: DatePeriods.displayName(
            subPeriod,
            invoiceType.periodFormat ||
              (invoiceType.frequency == 'quarterly'
                ? 'quarter'
                : invoiceType.frequency == 'sixMonthly'
                  ? 'sixMonth'
                  : 'monthYear')
          )
        })
      )
    }
  };

  buildInvoiceAnchors = linkObj => {
    return (
      <React.Fragment>
        <Typography variant='overline' gutterBottom>
          {linkObj.invoiceName}{' '}
        </Typography>
        {linkObj.links.map(link => (
          <Button
            key={link.key}
            variant='text'
            color='primary'
            size='small'
            component={Link}
            to={link.to}
            title={link.title}
          >
            {link.label}
          </Button>
        ))}
      </React.Fragment>
    )
  };

  invoiceListDialog = () => {
    return (
      <Dialog
        fullWidth={true}
        maxWidth='md'
        open={this.state.invoiceDialogOpen}
        onClose={this.handleInvoiceDialogClose}
      >
        <DialogTitle id='simple-dialog-title'>
          {this.state.invoiceOrgUnitName}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            <List>
              {this.state.invoiceLinks.map((link, linkIndex) => (
                <li key={link.invoiceName + '-' + linkIndex}>
                  {this.buildInvoiceAnchors(link)}
                  {this.state.invoiceLinks.length - 1 !== linkIndex && (
                    <Divider />
                  )}
                </li>
              ))}
            </List>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    )
  };

  buildInvoiceTypes = invoices => {
    let codes = invoices.getInvoiceTypeCodes(this.props.orgUnit)
    if (this.props.hideCurrentInvoice === true) {
      codes.splice(codes.indexOf(this.props.invoiceCode), 1)
    }

    if (codes === undefined || codes.length === 0) {
      return null
    }

    return invoices.getInvoiceTypes(codes)
  };

  buildInvoiceLinks() {
    const invoiceTypes = this.buildInvoiceTypes(this.props.invoices)
    const quarterPeriod = DatePeriods.split(this.props.period, 'quarterly')[0]

    var invoiceLinks = invoiceTypes.map(invoiceType =>
      this.buildInvoiceLink(quarterPeriod, invoiceType)
    )
    this.setState({
      invoiceOrgUnitName: this.props.orgUnit.name,
      invoiceLinks: invoiceLinks,
      invoiceDialogOpen: true
    })
  }

  evalInvoice = () => {
    const invoiceTypes = this.buildInvoiceTypes(this.props.invoices)
    const quarterPeriod = DatePeriods.split(this.props.period, 'quarterly')[0]
    const promptBtn = (
      <Button
        color='primary'
        size='small'
        onClick={() => this.buildInvoiceLinks()}
      >
        {this.props.t('show_avalaible_invoices')}
      </Button>
    )
    let invoicePrompt = this.props.t('missing_invoice_types')

    if (invoiceTypes !== null) {
      invoicePrompt =
        this.props.hideCurrentInvoice === true
          ? promptBtn
          : invoiceTypes.length > 1
            ? promptBtn
            : this.buildInvoiceAnchors(
              this.buildInvoiceLink(quarterPeriod, invoiceTypes[0])
            )
    }
    return invoicePrompt
  };

  render() {
    return (
      <React.Fragment>
        {this.evalInvoice()}
        {this.state.invoiceLinks && this.invoiceListDialog()}
      </React.Fragment>
    )
  }
}

export default InvoiceLinks
