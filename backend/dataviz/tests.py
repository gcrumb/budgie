import os
import unittest
import dataviz

from flask import Flask, g, request, abort, jsonify

class DataVizTestCase(unittest.TestCase):

    def setUp(self):
        """
        Set the connection to a test CouchDB database
        """
        dataviz.app.config['COUCHDB_DATABASE'] = 'pipp_data_test'
        self.app = dataviz.app.test_client()

    def tearDown(self):
        dataviz.app.config['COUCHDB_DATABASE'] = 'pipp_data_test'

    def test_empty_db(self):
        pass


if __name__ == '__main__':
    unittest.main()
