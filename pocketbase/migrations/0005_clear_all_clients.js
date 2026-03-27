migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('clients')
    app.truncateCollection(col)
  },
  (app) => {
    // Irreversible operation: data removed cannot be restored automatically
  },
)
