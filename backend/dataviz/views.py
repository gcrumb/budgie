from dataviz import app # Circular dependendy here ok (see __init__.py).
from dataviz.decorators import crossdomain

from flask import Flask, g, request, abort, jsonify

class Struct:
    """
    Used to turn a Dict into an object. This is mainly a work-around 
    a problem I faced integrating AngularJS and WTForms.
    """
    def __init__(self, **entries): 
        self.__dict__.update(entries)

# CouchDB does not comply with the standard. CouchDB stores a hex value
# of the UUID so this is what we use below to query CouchDB by id
# (see http://stackoverflow.com/questions/2707984/uuids-in-couchdb)

# Also note that I am not that happy with the approved Flask-CouchDB
# extension but I think it's good enough. It's missing a delete()
# method so I revert back to working with raw couch object from the
# python-couchdb lib at times.

@app.route("/", methods=['GET'])
def home():
    """
    Root page of service. Returns a doc with meta data about the service
    """
    d = {"name": "Pacific Institute of Public Policy Data Service", 
         "version": 0.1}
    return jsonify(meta=d)
