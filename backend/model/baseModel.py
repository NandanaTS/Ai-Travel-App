import pandas as pd
import json
import os

# Load user data
user_data_path = '../backend/userData/userData.json'
with open(user_data_path, 'r') as f:
    user_data = json.load(f)

# Load location dataset
location_data_path = '../backend/Datasets/dataset.csv'
if not os.path.exists(location_data_path):
    raise FileNotFoundError(f"The file {location_data_path} does not exist.")
location_df = pd.read_csv(location_data_path)

# Convert all relevant columns to lowercase and strip whitespace
columns_to_process = ['Name', 'Description', 'Category', 'BestSeason', 'Timings', 'Reviews', 'Price']
for column in columns_to_process:
    location_df[column] = location_df[column].str.lower().str.strip()

# Ensure the Name column is also processed
location_df['Name'] = location_df['Name'].str.lower().str.strip()

# Display the processed location DataFrame
print("Processed location DataFrame:")
print(location_df.head())

# Create a user-item matrix
user_likes = {}
for user_id, data in user_data.items():
    for location in data['likedLocations']:
        if user_id not in user_likes:
            user_likes[user_id] = []
        user_likes[user_id].append(location.lower().strip())

# Transform user_likes into a DataFrame
user_likes_df = pd.DataFrame.from_dict(user_likes, orient='index').fillna('')
user_likes_df.columns = [f'location_{i}' for i in range(user_likes_df.shape[1])]

# Ensure all values are strings
user_likes_df = user_likes_df.astype(str)
print("User likes DataFrame:")
print(user_likes_df.head())

# Flatten the user_likes DataFrame
user_likes_flat = user_likes_df.apply(lambda x: ','.join(x.dropna().astype(str)), axis=1)
print("User likes flat (after join and before split):")
print(user_likes_flat.head())

# Check if user_likes_flat is empty before splitting
if not user_likes_flat.empty:
    user_likes_flat = user_likes_flat.str.split(',', expand=True).stack().reset_index(level=1, drop=True)
    user_likes_flat.name = 'location'
    user_likes_flat = user_likes_flat.reset_index().rename(columns={'index': 'UserId'})

    # Convert 'location' column to string to avoid AttributeError
    user_likes_flat['location'] = user_likes_flat['location'].astype(str).str.strip().str.lower()
    print("User likes flat (after split):")
    print(user_likes_flat.head())

    # Merge user_likes with location_df on 'Name' column
    user_likes_merged = pd.merge(user_likes_flat, location_df, left_on='location', right_on='Name', how='left')
    print("User likes merged with location data:")
    print(user_likes_merged.head())

    # Function to recommend locations
    def recommend_locations(user_id, user_likes_merged, location_df):
        user_liked_locations = user_likes_merged[user_likes_merged['UserId'] == user_id]['location'].tolist()
        user_categories = location_df[location_df['Name'].isin(user_liked_locations)]['Category'].unique().tolist()

        recommendations = location_df[location_df['Category'].isin(user_categories) & ~location_df['Name'].isin(user_liked_locations)]

        return recommendations[['Name', 'Location', 'Category']].drop_duplicates()

    # Example recommendation for a user
    user_id = '00'
    recommendations = recommend_locations(user_id, user_likes_merged, location_df)
    print(f"Recommendations for user {user_id}:")
    print(recommendations)

    for user_id in user_data:
        recommendations = recommend_locations(user_id, user_likes_merged, location_df)
        user_data[user_id]['recommended'] = recommendations['Name'].tolist()

    # Write the updated user data back to the file
    with open(user_data_path, 'w') as f:
        json.dump(user_data, f, indent=4)

else:
    print("No user likes data to process.")
