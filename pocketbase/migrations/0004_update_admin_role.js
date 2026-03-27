migrate(
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'luizlobo77@gmail.com')
      record.set('role', 'Admin')
      app.save(record)
    } catch (_) {}
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'luizlobo77@gmail.com')
      record.set('role', '')
      app.save(record)
    } catch (_) {}
  },
)
