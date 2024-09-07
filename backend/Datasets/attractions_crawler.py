import requests
import lxml.html as lh
import pandas as pd
import os
import logging
import time

# Setup logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

base_url = "https://www.makemytrip.com"

def scrape(url):
    try:
        logging.info(f"Scraping main page: {url}")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Retry logic
        for attempt in range(5):
            try:
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()
                break
            except requests.exceptions.RequestException as e:
                logging.error(f"Attempt {attempt + 1}: Request error - {e}")
                time.sleep(2)  # wait before retrying
        else:
            logging.error("Failed to fetch the main page after multiple attempts.")
            return

        html = response.content
        os.makedirs('model/htmlpages', exist_ok=True)
        with open('model/lhtmlpages/places_to_visit_kerala.html', 'wb') as file:
            file.write(html)
        logging.info("Main page scraped successfully.")
        parse_places()
    except Exception as e:
        logging.error(f"Error scraping main page: {e}")

def parse_places():
    try:
        with open('htmlpages/places_to_visit_kerala.html', 'r', encoding='utf-8') as file:
            html = file.read()
        
        tree = lh.fromstring(html)
        
        # Updated XPath expressions based on provided HTML structure
        place_elements = tree.xpath('//a[contains(@class, "DestinationCard__Container-sc-11r6g4i-0")]')
        
        places = []
        descriptions = []
        
        for place in place_elements:
            place_name = place.xpath('.//h3[contains(@class, "DestinationCard__Title-sc-11r6g4i-2")]/text()')
            place_description = place.xpath('.//p[contains(@class, "DestinationCard__Description-sc-11r6g4i-4")]/text()')
            
            if place_name and place_description:
                places.append(place_name[0].strip())
                descriptions.append(place_description[0].strip())
        
        if not places:
            logging.error("Places not found in the HTML.")
            return
        
        if not descriptions:
            logging.error("Descriptions not found in the HTML.")
            return
        
        if len(places) != len(descriptions):
            logging.warning("Number of places and descriptions do not match. Data might be incomplete.")
        
        data = {'Place': places, 'Description': descriptions}
        
        df = pd.DataFrame(data)
        os.makedirs('model/outputs', exist_ok=True)
        output_file_path = 'model/outputs/places_to_visit_kerala.json'
        df.to_json(output_file_path, orient='records')
        logging.info(f"Places and descriptions saved successfully to {output_file_path}.")
    except Exception as e:
        logging.error(f"Error parsing places: {e}")

# Start the scraping process
scrape('https://www.makemytrip.com/tripideas/places-to-visit-in-kerala')
