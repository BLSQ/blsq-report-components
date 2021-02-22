import _ from "lodash"

export const SAFE_DIV = (a, b) => {
    if (b !== 0) {
        return a / b;
    }
    return 0;
};

export const IFF = (a, b, c) => {
    return a ? b : c;
};
export const ROUND = (a, position) => {
    if (a == undefined) {
        return 0
    }
    const fixed = a.toFixed(position)
    return parseFloat(fixed);
};

export const SCORE_TABLE = (...args) => {
    const target = args[0];
    const slices = _.chunk(args.slice(1), 3);

    for (let slice of slices) {
        if (slice.length == 3) {
            const lower = slice[0];
            const greater = slice[1];
            const thenvalue = slice[2];
            if (lower <= target && target < greater) {
                return thenvalue;
            }
        } else {
            return slice[0];
        }
    }
    return target;
};

export const ABS = (x) => Math.abs(x);

export const SUM = (...args) => {
    let a = 0;
    for (let arg of args) {
        a += arg;
    }
    return a;
};

export const functions = {
    "SCORE_TABLE": SCORE_TABLE,
    "ABS": ABS,
    "ROUND": ROUND,
    "IFF": IFF,
    "SAFE_DIV": SAFE_DIV,
    "SUM": SUM,
    "sum": SUM
}
