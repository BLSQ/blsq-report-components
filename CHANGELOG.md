# @blsq/blsq-report-components@1.0.61

 - [contracts] Assign organisation unit to contract program when creating/importing contracts.

# @blsq/blsq-report-components@1.0.60

 - [dataentry] Allow multiple dataset and offer complete button where we can pass a dataSetId

# @blsq/blsq-report-components@1.0.59

 - [dataentry] Allow [navigation](https://github.com/BLSQ/blsq-report-components/pull/127) between subcontract or main contracts.
 - [contracts] Allow to create contract with prefilled fields of latest [contract](https://github.com/BLSQ/blsq-report-components/pull/126)


# @blsq/blsq-report-components@1.0.58

 - [dataentry] Add period picker in header bar

# @blsq/blsq-report-components@1.0.57

 - [general] Allow to contribute to a page header via PortalHeader
 - [completeness] Orgunit situation add columns for user and date of completeness, links, and parent level's names.
 - [completeness] Allow data entry to give dataSetIds instead of a single dataSetId to support for example quality forms splitted by sections

# @blsq/blsq-report-components@1.0.56

- [completeness] Display totals for filtered [zones](https://github.com/BLSQ/blsq-report-components/pull/120).
- [completeness] Harmonize completeness display per orgunit by reusing same component for zone and totals.
- [general] Upgrade some vulnerable dependencies.

# @blsq/blsq-report-components@1.0.55
 
 - [dataentry] Full decision support (start/end periods, *, in:level_x)

# @blsq/blsq-report-components@1.0.54
 
 - [invoices] Allow calculations for orgunits not present in the invoice.

# @blsq/blsq-report-components@1.0.53
 
 - [completeness] Fix incorrect completeness status on newer dhis2

# @blsq/blsq-report-components@1.0.52

 - [dataentry] Fix lag and disappearing values when typing [fast](https://github.com/BLSQ/blsq-report-components/pull/114)

# @blsq/blsq-report-components@1.0.51

- [completeness] Fix crash when nothing is completed.

# @blsq/blsq-report-components@1.0.50

- [invoices] Add support for "consecutive" [invoices](https://github.com/BLSQ/blsq-report-components/pull/87)

# @blsq/blsq-report-components@1.0.49
 
- [completeness] a first screen on [completeness](https://github.com/BLSQ/blsq-report-components/pull/113) based on contracts and dataset complete events.

# @blsq/blsq-report-components@1.0.48
 
- [contracts] Add a screen to sync organisation unit groups with their "active or nearest" contract.  

# @blsq/blsq-report-components@1.0.47
 
- [dataentry] Small improvements on sync screen (tooltip, deal with "undefined" state mapping)

# @blsq/blsq-report-components@1.0.46

- [dataentry] Add an url to easily [synchronize](https://github.com/BLSQ/blsq-report-components/pull/111) orgunits and data elements based on hesabu/contracts configurations, checks data approval workflows.

# @blsq/blsq-report-components@1.0.45

 - [dataentry] Add CONCATENATE function.
 - [dataentry] Allow to express if dataset is completable (eg any warnings left).
 - [dataentry] Allow to style HesabuFormula (eg display in red).
 - [invoices] Make lock/unlock button less error prone by [showing a confirmation dialog](https://github.com/BLSQ/blsq-report-components/pull/109) and description of what will be locked.

# @blsq/blsq-report-components@1.0.44

- [contracts] Fix validation on orgunit's contract page, the cross contract validation errors were not shown
- [contracts] Allow to filter on warnings text with the [search box](https://github.com/BLSQ/blsq-report-components/pull/110)

# @blsq/blsq-report-components@1.0.43

- [contracts] Allow to download validation errors in [csv](https://github.com/BLSQ/blsq-report-components/pull/108)
- [contracts] Allow specific validators to access all the contracts for cross validations.

# @blsq/blsq-report-components@1.0.42

- [invoices] Calculate button was checking mayApprove instead of the approval state

# @blsq/blsq-report-components@1.0.41

- [contracts] Fix mass update of contracts.
- [contracts] Display stats per levels.

# @blsq/blsq-report-components@1.0.40

- [invoice] Disable Lock/Unlock button if user can't approve/unapprove.

# @blsq/blsq-report-components@1.0.39

- [general] Fix broken dhis2 logo
- [dataentry] Don't show data entries when multiple contracts for same period
- [contracts] Add navigation to data entry, and in filter orgunits under breadcrumb
- [contracts] Hide subcontracts when not applicable
- [contracts] Add navigation to data entry

# @blsq/blsq-report-components@1.0.38

- [contracts] Allow to filter contracts on their contract end date and mass update these contracts

# @blsq/blsq-report-components@1.0.37

- [dataentry] Handle dataset data write access
- [dataentry] Add a default implementation for edit in iaso form button

# @blsq/blsq-report-components@1.0.36

- [contracts] make import wizard more robust when error while processing a page
- [contracts] don't crash contract statististics when endPeriod is missing

# @blsq/blsq-report-components@1.0.35

- [dataentry] more helpfull message when some formula use unsupported feature like time %{...windows_values}
- [dataentry] the data entry selection page was saying the orgunit doesn't have an contract when subcontracted
- [contracts] import of contracts now calls also the specific/contributed validator by the plugin system.
- [contracts] import of contracts wizard display the matched pyramid hierarchy of the orgunit

# @blsq/blsq-report-components@1.0.34

- [dataentry] add some functions (AVG, MIN, MAX,...) to the hesabu engine
- [dataentry] add tests and refactor a bit the code base to make it more maintainable
- [general] switch to yarn to be more consistent with other projects

# @blsq/blsq-report-components@1.0.33

- [contracts] Edit/create contracts a better [period picker](https://github.com/BLSQ/blsq-report-components/pull/92)
- [contracts] Filter contracts on a [parent orgunit](https://github.com/BLSQ/blsq-report-components/pull/93)
- [contracts] Detail page show orgunit hierachy and allow to create sub-contract if at least one contract
- [contracts] Fixes when creating/editing where main contract orgunit was ignored and so creating a standalone contract
- [contracts] Fixes when creating/editing where default periods where not well handled, forcing you to change the value

# @blsq/blsq-report-components@1.0.32

- [dataentry] Add link to orgunit selection in hierarchy breadcrumb

# @blsq/blsq-report-components@1.0.31

- [dataentry] support equality check and turn them into == (the fix is a bit weak but does it for my case)
- [dataentry] support "blank" (when removing a value from the screen, was generating a NaN, instead of 0 in hesabu)

# @blsq/blsq-report-components@1.0.30

- [dataentry] restore backward compatibility with older dhis2 for Complete/uncomplete dataset
- [dataentry] allow to trigger an hesabu invoice when dataset is clicked completed

# @blsq/blsq-report-components@1.0.27-29

- [dataentry] various fixes, add minimal support for decision tables
- [dataentry] Calculator allow cross reference between package formulas

# @blsq/blsq-report-components@1.0.26

- [incentives] Fix period not passed in the drawer links
- [invoices] Pass a period in Invoices functions to allow versioning of invoices.

# @blsq/blsq-report-components@1.0.25

- [incentives] Allow to copy data values from another periods
- [dataentry] Navigate to first data entry when entry code not in url
- [dataentry] Add link to contract page
- [dataentry] Highlight current data entry

# @blsq/blsq-report-components@1.0.24

- [invoices] Calculate button
- [doc] Remove example app and link to blsq-report-app, document a bit existing extension points.

# @blsq/blsq-report-components@1.0.23

- [dataentry] Replace Dhis2Formula with HesabuFormula

# @blsq/blsq-report-components@1.0.22

- [dataentry] Hesabu calculation in data entry

# @blsq/blsq-report-components@1.0.21

- [invoices] Offer an extenstion point to show items in the orgunit selection page
- [dataentry] Fix error when no data was previously filled,
- [dataentry] Prevent showing a dataentry form that is not in the allowed one
- [dataentry] Minimal translation
- [dataentry] Show tooltip on double click instead on focus or hover

# @blsq/blsq-report-components@1.0.20

- [contracts] Sending only the year month and day part on start end end contract dates

# @blsq/blsq-report-components@1.0.19

- [reports] Fix link to previous or next period

# @blsq/blsq-report-components@1.0.18

- [contracts] Add chart of contracted orgunits per month

# @blsq/blsq-report-components@1.0.17

- [contracts] Add some hidden columns in contracts, show some statistics for each fields

# @blsq/blsq-report-components@1.0.16

- [contracts] allow to delete contracts
- [contracts] allow to contribute validations
- [contracts] use program info to deduce if a field is required (compulsory)
