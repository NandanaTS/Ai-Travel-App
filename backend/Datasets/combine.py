import pandas as pd
import json

# File paths
json_file_path = 'outputs/categorized_places_to_visit_kerala.json'
csv_file_path = 'dataset.csv'  # Replace with your actual CSV file path
output_file_path = 'dataset.csv'

# Load JSON data
with open(json_file_path, 'r') as f:
    json_data = json.load(f)

# Convert JSON data to DataFrame
json_df = pd.DataFrame(json_data)

# Normalize the 'Name' column in JSON data by removing ", Kerala"
json_df['Name'] = json_df['Place'].str.replace(', Kerala', '').str.strip()

# Load CSV data
csv_df = pd.read_csv(csv_file_path)

# Ensure the columns in JSON and CSV data are consistent
# Map JSON columns to match CSV columns
json_df = json_df.rename(columns={
    'Name': 'Name',
    'Description': 'Description',
    'Category': 'Category'
})

# Drop duplicates in JSON data based on the 'Name' column
json_names = json_df['Name'].str.strip()
csv_names = csv_df['Name'].str.strip()

unique_json_df = json_df[~json_names.isin(csv_names)]

# Combine the unique JSON data with the CSV data
combined_df = pd.concat([csv_df, unique_json_df], ignore_index=True)

# Save the combined data to a new CSV file
combined_df.to_csv(output_file_path, index=False)

print(f"Combined data saved to {output_file_path}")
