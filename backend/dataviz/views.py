import json

from dataviz import app # Circular dependendy here ok (see __init__.py).
from dataviz.decorators import crossdomain

from flask import Flask, g, request, abort, jsonify

from dataviz.utils import validate

class Struct:
    """
    Used to turn a Dict into an object. This is mainly a work-around 
    a problem I faced integrating AngularJS and WTForms.

    Probably will not be needed in this little problem but no cost to
    leave it here.
    """
    def __init__(self, **entries): 
        self.__dict__.update(entries)

@app.route("/", methods=['GET'])
def home():
    """
    Root page of service. Returns a doc with meta data about the service
    """
    d = {"name": "Pacific Institute of Public Policy Data Service", 
         "version": 0.1}
    return jsonify(meta=d)

@app.route("/budgets/<budget_id>", methods=['PUT'])
def create_budget(budget_id):
    """
    REST view to add a new budget to the DB. It expects data as
    JSON. Takes a budget_id of the form 'country-year'. For example,
    if you want to add the budget Papua New Guinea's 2013 budget the
    ID would be png-2013.

    Here, a HTTP PUT is used since we are creating a new resource to a
    new URI and not a new resource to an existing URI such as creating
    a new blog entry with PSOST to /blog/entry/. The former is more
    appropriate when you want to define your own ID like in this
    case.
    """

    doc = request.get_json()

#    import pdb; pdb.set_trace()

    # Make sure budget has not been added first.
    if g.couch.get(budget_id):
        abort(409) # Conflict or just update it?!?    

    # Validate budget submitted.
    try:
        validate(doc)
    except Exception, e:
        abort(400) # Bad request
        
    # Add new budget.
    try:
        g.couch[budget_id] = doc
        return "Budget Successfully Added"
    except Exception, e:
        abort(500) # Server error
