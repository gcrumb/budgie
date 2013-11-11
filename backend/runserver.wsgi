import os
import sys
import site

# If using virtualenv, add the virtualenf's site-packages to sys.path as well
#VENV_PATH = "/home/ghachey/.virtualenvs/candy.pacificpolicy.org.vu/"
#site.addsitedir(os.path.join(VENV_PATH,'lib/python2.6/site-packages/'))

# Change working directory so relative paths (and template lookup) work again
os.chdir(os.path.dirname(__file__))

# Add current directory to sys.path
site.addsitedir(os.curdir)

import dataviz
from config import conf
from dataviz import app, cors

app.config.update(
    DEBUG = False,
    COUCHDB_SERVER = conf['couchdb'],
    COUCHDB_DATABASE = conf['couchdb_database'],
    COUCHDB_DATABASE_TEST = conf['couchdb_databasetest']
)

cors.set_allowed_origins(*conf['allowed'])

application = app
