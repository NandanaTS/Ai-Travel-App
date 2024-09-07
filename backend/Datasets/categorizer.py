import json
import pandas as pd
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load the data from JSON file
def load_data(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        logging.info("Data loaded successfully.")
        return pd.DataFrame(data)
    except Exception as e:
        logging.error(f"Error loading data: {e}")
        return None

# Define categories and associated keywords
categories_keywords = {
    "Beaches": ["beach", "coast", "sea", "sand", "shore", "waves"],
    "Mountains": ["mountain", "hill", "peak", "summit", "ridge"],
    "Cities": ["city", "town", "urban", "metropolis", "downtown"],
    "Nature": ["forest", "jungle", "park", "nature", "wildlife", "natural"],
    "Historical": ["historical", "heritage", "monument", "ancient", "ruins"],
    "Waterfalls": ["waterfall", "cascade", "falls", "rapids"],
}

# Function to categorize description based on keywords
def categorize_description(description):
    description = description.lower()
    for category, keywords in categories_keywords.items():
        if any(keyword in description for keyword in keywords):
            return category
    return "Uncategorized"

# Categorize all descriptions in the dataframe
def categorize_data(df):
    try:
        df['Category'] = df['Description'].apply(categorize_description)
        logging.info("Data categorized successfully.")
        return df
    except Exception as e:
        logging.error(f"Error categorizing data: {e}")
        return None

# Save categorized data to JSON file
def save_data(df, output_file_path):
    try:
        df.to_json(output_file_path, orient='records')
        logging.info(f"Categorized data saved successfully to {output_file_path}.")
    except Exception as e:
        logging.error(f"Error saving data: {e}")

# Main function to process the data
def main(input_file_path, output_file_path):
    df = load_data(input_file_path)
    if df is not None:
        categorized_df = categorize_data(df)
        if categorized_df is not None:
            save_data(categorized_df, output_file_path)

# Define file paths
input_file_path = 'outputs/places_to_visit_kerala.json'
output_file_path = 'outputs/categorized_places_to_visit_kerala.json'

# Run the main function
if __name__ == "__main__":
    main(input_file_path, output_file_path)
