"""
Scaffolding for the main airtable dataloader
"""
import os
import sys
import pandas as pd
import numpy as np
from pyairtable import Api

# --- Configuration ---
# NOTE: Using environment variables for security instead of hardcoding. Please feel free to ask if setup help needed for environment variables -Carl
AIRTABLE_API_KEY = os.environ.get("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = os.environ.get("AIRTABLE_BASE_ID")
AIRTABLE_TABLE_NAME = "TABLE_NAME"

def fetch_airtable_data(api_key, base_id, table_name):
    """
    Connects to an Airtable base, fetches all records from a table,
    and returns them as a Pandas DataFrame.

    Args:
        api_key (str): Your Airtable API key.
        base_id (str): The ID of your Airtable base.
        table_name (str): The name of the table you want to read.

    Returns:
        pd.DataFrame: A DataFrame containing the Airtable data,
                      or an empty DataFrame if an error occurs or
                      the table is empty.
    """
    try:
        # 1. Connect to the Airtable API
        api = Api(api_key)
        
        # 2. Select your base and table
        table = api.table(base_id, table_name)
        
        # 3. Get all records from the table
        print(f"Fetching all records from '{table_name}'...")
        all_records = table.all()
        print(f"Successfully fetched {len(all_records)} records.")
        
        # 4. Convert the records into a list of dictionaries for the DataFrame
        data_for_df = [record['fields'] for record in all_records]
        
        if not data_for_df:
            print("The table is empty or no fields were found in the records.")
            return pd.DataFrame()
            
        # 5. Create the Pandas DataFrame
        df = pd.DataFrame(data_for_df)
        
        return df

    except Exception as e:
        print(f"An error occurred: {e}")
        # Return an empty DataFrame in case of an error
        return pd.DataFrame()

# --- Main block ---
# Fetch the data and store it in a DataFrame
airtable_df = fetch_airtable_data(
    api_key=AIRTABLE_API_KEY,
    base_id=AIRTABLE_BASE_ID,
    table_name=AIRTABLE_TABLE_NAME
)

# --- Transformations Here ----


# write to sysout
airtable_df.to_csv(sys.stdout)
