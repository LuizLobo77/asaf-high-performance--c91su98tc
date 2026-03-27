migrate(
  (app) => {
    const collection = new Collection({
      name: 'clients',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'cnpj', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'region', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'sellerId', type: 'text' },
        { name: 'lastPurchase', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_clients_cnpj ON clients (cnpj)',
        'CREATE INDEX idx_clients_sellerId ON clients (sellerId)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('clients')
    app.delete(collection)
  },
)
