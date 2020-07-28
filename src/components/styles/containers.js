const containers = (theme) => ({
    rootContainer: theme.mixins.gutters({
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        minHeight: 'calc(100vh - 160px)'
      }),
});

export default containers;
