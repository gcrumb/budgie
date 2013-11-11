from flask import Flask
from flask.ext.uuid import FlaskUUID
from flaskext.couchdb import CouchDBManager

from cors import CrossOriginResourceSharing

# Create new Flask app
app = Flask(__name__)
FlaskUUID(app)

# Add Easy CORS support
cors = CrossOriginResourceSharing(app)

# Add CouchDB support
manager = CouchDBManager()
manager.setup(app)

# Seamingly circular dependendy here is fine. Views are not actually
# used here; just ensuring the module is imported.
import dataviz.views
