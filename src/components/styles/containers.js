const containers = (theme) => ({
    rootContainer: theme.mixins.gutters({
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        minHeight: 600
      }),
});

export default containers;
