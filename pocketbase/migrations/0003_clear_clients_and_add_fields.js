migrate(
  (app) => {
    // Clear existing misencoded clients
    const clientsCol = app.findCollectionByNameOrId('clients')
    app.truncateCollection(clientsCol)

    // Add deletedAt to clients
    if (!clientsCol.fields.getByName('deletedAt')) {
      clientsCol.fields.add(new TextField({ name: 'deletedAt' }))
      app.save(clientsCol)
    }

    // Add role to users
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(new TextField({ name: 'role' }))
      app.save(usersCol)
    }
  },
  (app) => {
    const clientsCol = app.findCollectionByNameOrId('clients')
    clientsCol.fields.removeByName('deletedAt')
    app.save(clientsCol)

    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    usersCol.fields.removeByName('role')
    app.save(usersCol)
  },
)
