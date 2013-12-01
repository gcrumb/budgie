# A simply Python dictionary to handle the configuration of the backend

# Production config
conf = {
    # Database configuration
    'couchdb': 'http://localhost:5984/',
    'couchdb_database': 'pipp_data',
    'couchdb_databasetest': 'pipp_data_test',

    # Configure which host is allowed cross origin access to the backend
    # Can take exact strings and regexes
    'allowed' : (
        'https://candy.pacificpolicy.org',
        )
}

# Development config

# If you want to use different different configuration for development
# you can change it here. It will not interfere with production configs.
dev_conf = {
    # Database configuration
    'couchdb': 'http://localhost:5984/',
    'couchdb_database': 'pipp_data',
    'couchdb_databasetest': 'pipp_data_test',

    # Configure which host is allowed cross origin access to the backend
    # Can take exact strings and regexes
    'allowed' : (
	'http://localhost:8080',
        'http://localhost:9000',
        ),
}
