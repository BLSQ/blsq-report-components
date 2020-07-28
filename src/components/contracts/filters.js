
import moment from 'moment'
import { getContractDates }  from "./utils"

/**
 * A Filters list
 * @typedef {Array} Filters
    * @typedef {Object} Filter
        * @property {string} id - Uid, fo the input, also used in url
        * @property {string} key - Key label used by the translation tool
        * @property {string} keyInfo - Optionnal - Key of the info tooltip used by the translation tool
        * @property {string} type - Type of filter to display (search, date, array)
        * @property {number} column - column where to display the filter (1, 2 ,3, 4)
        * @property {any} value - default value
        * @property {function} onFilter - function used to filter the items
        * @property {array} options - Optionnal - array of options for the select type
            * @property {string} label - label of the option
            * @property {any} value - value of the option
        * @property {function} urlEncode - Optionnal - function used encode filter into url
        * @property {function} urlDecode - Optionnal - function used decode filter from url
 */

const filters = [
    {
        id: "search",
        key: "search",
        keyInfo: "contracts.searchInfos",
        type: "search",
        column: 1,
        value: "",
        onFilter: (value, contracts) => contracts.filter(
            (c) =>
            c.codes.includes(value) ||
            c.orgUnit.name.toLowerCase().includes(value.toLowerCase()) ||
            c.startPeriod.includes(value) ||
            c.endPeriod.includes(value)
          ),
    },
    {
        id: "active_at",
        key: "contracts.activeAt",
        type: "date",
        column: 2,
        value: null,
        onFilter: (value, contracts) => {
            if (!value) {
                return contracts
            }
            return contracts.filter(
                (c) => {
                    const contractDates = getContractDates(c)
                    return moment(value).isBetween(contractDates.startDate, contractDates.endDate)
                })
        },
        urlDecode: (value) => !value || value === "" ? null : value
    },
    {
        id: "groups",
        key: "groups",
        type: "select",
        multi: true,
        column: 3,
        value: [],
        options: [
            {
                label: "PMA",
                value: "PMA",
            },
            {
                label: "PCA",
                value: "PCA",
            },
            {
                label: "Province",
                value: "province",
            }
        ],
        onFilter: (groups, contracts) => {
            if (groups.length === 0) {
                return contracts
            }

            return contracts.filter(
                (c) => c.codes.some(c=> groups.findIndex(g => g.value === c) >= 0))
        },
        urlEncode: (value) => !value || value.length === 0 ? "" : JSON.stringify(value),
        urlDecode: (value) => !value || value === "" ? [] : JSON.parse(value)
    },
    {
        id: "only_overlaps",
        key: "contracts.onlyOverlaps",
        type: "checkbox",
        column: 4,
        value: false,
        onFilter: (onlyOverlaps, contracts, contractsOverlaps) => {
            if (!onlyOverlaps) {
                return contracts
            }
            return contracts.filter(
                (c) => contractsOverlaps[c.id] &&
                contractsOverlaps[c.id].size > 0)
        },
        urlEncode: (value) => value ? 'true' : 'false',
        urlDecode: (value) => value === 'true'
    },
    // {
    //     id: "groupsBis",
    //     key: "groups",
    //     type: "select",
    //     column: 4,
    //     value: "",
    //     options: [
    //         {
    //             label: "PMA",
    //             value: "PMA",
    //         },
    //         {
    //             label: "PCA",
    //             value: "PCA",
    //         },
    //         {
    //             label: "Province",
    //             value: "province",
    //         }
    //     ],
    //     onFilter: (group, contracts) => {
    //         if (!group || (group && group.value === "")) {
    //             return contracts
    //         }

    //         return contracts.filter(
    //             (c) => c.codes.includes(group.value))
    //     },
        // urlEncode: (value) => !value || value.length === 0 ? "" : JSON.stringify(value),
        // urlDecode: (value) => !value || value === "" ? [] : JSON.parse(value)
    // }
]

export default filters;