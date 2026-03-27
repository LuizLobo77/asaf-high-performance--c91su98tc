onRecordListRequest((e) => {
  e.response.header().set('Content-Type', 'application/json; charset=utf-8')
  e.next()
}, 'clients')

onRecordViewRequest((e) => {
  e.response.header().set('Content-Type', 'application/json; charset=utf-8')
  e.next()
}, 'clients')
