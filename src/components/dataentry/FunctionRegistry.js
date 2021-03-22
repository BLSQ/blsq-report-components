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

export const MAX = (...args) => {
    return Math.max(...args)
}

export const MIN = (...args) => {
    return Math.min(...args)
}

export const SQRT = (arg) => {
    return Math.sqrt(arg)
}

export const AVG = (...args) => {
    return args.reduce((a, b) => (a + b)) / args.length;
}

export const RANDBETWEEN = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const FLOOR = (f, mymultiple) => {
    const multiple = mymultiple || 1.0
    return Math.floor(f / multiple) * multiple
};

export const CEILING = (f, mymultiple) => {
    const multiple = mymultiple || 1.0
    return Math.ceil(f / multiple) * multiple
};

const ACCESS = (...args) => {
    const index = args[args.length - 1]
    let myArray = args
    if (Array.isArray(args[0])) {
        myArray = args[0]
    }
    return myArray[index]
}

const ARRAY = (...args) => {
    return args
}

const STRLEN = (str) => {
    if (str === undefined) {
        return 0
    }
    return str.length
}

const CONCATENATE = (...args) => {
    return args.join("")
}

// https://github.com/BLSQ/go-hesabu/blob/master/hesabu/registry.go#L26
// missing stdevp, TRUNC, CAL_DAYS_IN_MONTH, eval_array


export const functions = {
    "ABS": ABS,
    "abs": ABS,
    "SQRT": SQRT,
    "sqrt": SQRT,
    "STRLEN": STRLEN,
    "strlen": STRLEN,
    "RANDBETWEEN": RANDBETWEEN,
    "randbetween": RANDBETWEEN,
    "AVG": AVG,
    "avg": AVG,
    "SCORE_TABLE": SCORE_TABLE,
    "ROUND": ROUND,
    "round": ROUND,
    "FLOOR": FLOOR,
    "floor": FLOOR,
    "CEILING": CEILING,
    "ceiling": CEILING,
    "IFF": IFF,
    "SAFE_DIV": SAFE_DIV,
    "safe_div": SAFE_DIV,
    "ACCESS": ACCESS,
    "access": ACCESS,
    "ARRAY": ARRAY,
    "array": ARRAY,
    "SUM": SUM,
    "sum": SUM,
    "MIN": MIN,
    "min": MIN,
    "MAX": MAX,
    "max": MAX,
    "CONCATENATE":CONCATENATE,
    "concatenate":CONCATENATE,

}
