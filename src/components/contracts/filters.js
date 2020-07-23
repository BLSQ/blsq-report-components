
import moment from 'moment'
import { getContractDates }  from "./utils"

const filters = [
    {
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
    }
]

export default filters;