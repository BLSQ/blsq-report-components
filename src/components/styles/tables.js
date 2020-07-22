const tables = (theme) => ({
    tableContainer: {
        padding: 0,
        margin: 0,
        boxShadow: 'none',
    },
    rowError: {
        '& .MuiTableCell-body': {
            color: 'red',
        }
    },
    iconLink: {
        color: 'inherit',
    },
    chip: {
        marginRight: theme.spacing(2),
    },
    tableTitle: {
        marginLeft: -theme.spacing(2),
        display: "inline-block",
    }
});

export default tables;
