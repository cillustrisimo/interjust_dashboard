import json
import requests
import sys
import os
from pyairtable import Api


# This is a script that we have pre-made to ensure data can be loaded from the API as is necessary
# We use pyair table as our framework. This loader may be later edited to also perform necessary transformations
# On the data, so that we can accurately graph what is needed.

api = Api(os.environ['AIRTABLE_API_KEY'])
table = api.table('appExampleBaseId', 'tblExampleTableId')
# table.all() # show the table