from dataviz import app, cors
from config import dev_conf

app.config.update(
   DEBUG = True,
   COUCHDB_SERVER = dev_conf['couchdb'],
   COUCHDB_DATABASE = dev_conf['couchdb_database'],
   COUCHDB_DATABASE_TEST = dev_conf['couchdb_databasetest']
)

cors.set_allowed_origins(*dev_conf['allowed'])

app.run(host='0.0.0.0', port=5000)
