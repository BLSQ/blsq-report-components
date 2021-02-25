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
