# blsq-report-components

> blsq-report-components

[![NPM](https://img.shields.io/npm/v/@blsq/blsq-report-components.svg)](https://www.npmjs.com/package/@blsq/blsq-report-components) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Build Status](https://travis-ci.com/BLSQ/blsq-report-components.svg?branch=master)](https://travis-ci.com/BLSQ/blsq-report-components)

## Install

```bash
yarn add "@blsq/blsq-report-components"
```

or if you are more extreme, living on the edge, use the github repo and yarn

```bash
yarn add https://github.com/BLSQ/blsq-report-components
```

## Usage

Sorry we don't have yet documentation.

This is a skeleton app component where you can contribute custom routes, invoices & reports.

![Sample invoice app](./doc/sample-invoice.png)


Your best chance is to look at the code and running the example app:
 - generic app : https://github.com/BLSQ/blsq-report-app/ and
 - specific plugin for a sandbox dhis2 : https://github.com/BLSQ/blsq-report-specific-sandox/

It's now "plugin" based.

a npm module can contain several plugins
- [invoices]([https://github.com/BLSQ/blsq-report-components/tree/master/src/components/invoices) : orgunit selector and specific plugin can contribute "invoices" to it
- [incentives](https://github.com/BLSQ/blsq-report-components/tree/master/src/components/incentives) : a special data entry to fill in incentives for a pbf (seeing future and past values in the same screen)
- [contracts](https://github.com/BLSQ/blsq-report-components/tree/master/src/components/contracts) : dhis2 contract management (stored as event, allowing a kind of versionning of groups)
- [dataentry](https://github.com/BLSQ/blsq-report-components/tree/master/src/components/dataentry) : can contribute custom data entry (optionally linked to hesabu)
- [browsedata](https://github.com/BLSQ/blsq-report-components/tree/master/src/components/browsedata) : allow clients to access their data (through datavaluesets api, no analytics required)

then a specific plugins can "configure/define/wire" all these plugins into a working pbf manager.
see https://github.com/BLSQ/blsq-report-specific-sandox

the plugin system allows theses plugins to contribute to each others

### core plugin contributions

```json
 "core.dhis2": [dhis2], // some dhis2 need extra config, enforce https, use categoryCombo for multipayer scheme,...
 "core.routes": [defaultRoute], // all plugins contributes to this, by adding their own routes
 "core.headerRoutes": [customHeader] // plugins can fill the header with custom components depending of their needs.
 "core.drawerLinks": [DrawerLinks], // left menu content in the app
 "core.config": [config],  // general config for date formatting,...
 "core.i18n": [i18n],   // translations, containing the default but can provide their own
```


### invoices plugin contributions

```json
"invoices.invoices": [Invoices] // specific code contributing invoices to orgunit based on their contracts or groups and invoice templates/components
"invoices.actions": [BackBtn, Contract]   //
"invoices.orgUnitsResolver" : [new ContractBasedResolver()] // specific code to lookup orgunits for  eg consolidated invoices
"invoices.selectionLinks" : [ContractLink, DataEntryLink]  // when in orgunit selection page, show extra content (not only invoices, eg contrat or data entry links, receive orgUnit and period as props)
```

### contracts plugin contributions

```json
"contracts.config": [
    {
    programId: "xxx",
    allEventsSqlViewId: "xxxyyyy"
    }
],
"contracts.validator":  // custom validator for contract, field cross validation see
```

see [DefaultValidator](https://github.com/BLSQ/blsq-report-components/blob/master/src/components/contracts/validations/DefaultValidator.js)


### dataentry plugin contributions

```
"dataentry.dataEntries": [DataEntries]  // same role as for invoices but for data entry : which data entry is allowed per orgunit and which component, should be used.
```

### Allowing contribution points or access contributed items

if it's code or config data you can access it

```js
import { PluginRegistry } from "@blsq/blsq-report-components";

const i18n = PluginRegistry.extension("core.i18n");

const contractService = PluginRegistry.extension("contracts.service");
```

if its a component you can drop that in your jsx all the "core.drawerLinks" will be fetched

```jsx
<ExtensionsComponent extensionKey="core.drawerLinks" {...props} />
```


# Development

```
git clone git@github.com:BLSQ/blsq-report-components.git
cd blsq-report-components
yarn install
yarn test
```

```
yarn link
yarn start
```

```
cd example
yarn start
yarn link @blsq/blsq-report-components
yarn link ../node_modules/react
```

you might need to upgrade jest snapshots (assertion based on latest recorded data)

```
yarn test -- --updateSnapshot
```

## Release

1. Adapt the CHANGELOG.md
2. Release the package on npm
```
yarn publish
```
3. Update downstream application using it : https://bitbucket.org/bluesquare_org/report-inventory/src/master/

## License

MIT © [BLSQ](https://github.com/BLSQ)
