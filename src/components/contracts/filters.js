
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
          )
    },
    {
        id: "activeAt",
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
        }
    },
]

export default filters;