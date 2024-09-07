//PALM_API_KEY='AIzaSyA0_ZZHUDaPanKSeU1w7sWJAJLKdvLJDRw'
//WEATHER_API_KEY='HYA7MBM9MQT687ZDAXUZ27G9A'

const express = require('express');
const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');
const bodyParser = require('body-parser');
const { exec } = require('child_process');


const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

const dataFilePath = path.join(__dirname, 'userData/userData.json');


const initialData = {
    "00": {
      "likedLocations": [],
      "addedLocations": [],
      "visitedLocations": [],
      "recommended": []
    }
  };
  
  // Check if the file exists and is empty
  fs.stat(dataFilePath, (err, stats) => {
    if (err && err.code === 'ENOENT') {
      // File doesn't exist, create it with initial data
      fs.writeFile(dataFilePath, JSON.stringify(initialData, null, 2), (err) => {
        if (err) throw err;
        console.log('userData.json created with initial data.');
      });
    } else if (!err && stats.isFile() && stats.size === 0) {
      // File exists but is empty, write initial data to it
      fs.writeFile(dataFilePath, JSON.stringify(initialData, null, 2), (err) => {
        if (err) throw err;
        console.log('userData.json initialized with initial data.');
      });
    } else if (err) {
      // Some other error occurred
      throw err;
    } else {
      // File exists and is not empty, do nothing
      console.log('userData.json already exists and contains data.');
    }
  });


// Ensure the likedLocations.json file exists
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({}));
}

app.get('/api/data', (req, res) => {
    const results = [];
    fs.createReadStream('Datasets/dataset.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json(results);
        });
});

app.get('/api/locations-by-city', (req, res) => {
    const city = req.query.city;
    const results = [];

    fs.createReadStream('Datasets/dataset.csv')
        .pipe(csv())
        .on('data', (data) => {
            if (data.Location === city) {
                results.push(data);
            }
        })
        .on('end', () => {
            res.json(results);
        });
});

app.post('/api/like', (req, res) => {
    const { username, location, actionType } = req.body;

    // Read the current data from the file
    let data;
    try {
        data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    } catch (err) {
        // If there's an error reading the file, initialize an empty object
        data = {};
    }

    // Ensure the user data structure is present
    if (!data[username]) {
        data[username] = { likedLocations: [], addedLocations: [], visitedLocations: [] };
    }

    const user = data[username];
    const { likedLocations, addedLocations, visitedLocations } = user;

    // Determine the action type and update the appropriate list
    if (actionType === 'like') {
        if (likedLocations.includes(location)) {
            likedLocations.splice(likedLocations.indexOf(location), 1);
            res.json({ message: `Unliked ${location}` });
        } else {
            likedLocations.push(location);
            res.json({ message: `Liked ${location}` });
        }
    } else if (actionType === 'add') {
        if (addedLocations.includes(location)) {
            addedLocations.splice(addedLocations.indexOf(location), 1);
            res.json({ message: `Removed ${location} from added locations` });
        } else {
            addedLocations.push(location);
            res.json({ message: `Added ${location} to added locations` });
        }
    } else if (actionType === 'visit') {
        if (visitedLocations.includes(location)) {
            visitedLocations.splice(visitedLocations.indexOf(location), 1);
            res.json({ message: `Removed ${location} from visited locations` });
        } else {
            visitedLocations.push(location);
            res.json({ message: `Added ${location} to visited locations` });
        }
    } else {
        res.status(400).json({ error: 'Invalid action type' });
        return;
    }

    // Write the updated data back to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
});


// Endpoint to add a location
app.post('/api/add', (req, res) => {
    const { username, location } = req.body;

    const data = JSON.parse(fs.readFileSync(dataFilePath));
    if (!data[username]) {
        data[username] = { likedLocations: [], addedLocations: [], visitedLocations: [] };
    }

    const user = data[username];
    const { likedLocations, addedLocations, visitedLocations } = user;

    const indexInLiked = likedLocations.indexOf(location);
    const indexInAdded = addedLocations.indexOf(location);
    const indexInVisited = visitedLocations.indexOf(location);

    if (indexInLiked !== -1) {
        // Remove from liked locations
        likedLocations.splice(indexInLiked, 1);
        // Add to added locations
        addedLocations.push(location);
        res.json({ message: `Added ${location}` });
    } else if (indexInAdded !== -1) {
        res.json({ message: `${location} is already added` });
    } else if (indexInVisited !== -1) {
        // Remove from visited locations
        visitedLocations.splice(indexInVisited, 1);
        // Add to added locations
        addedLocations.push(location);
        res.json({ message: `Added ${location}` });
    } else {
        // Add to added locations
        addedLocations.push(location);
        res.json({ message: `Added ${location}` });
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(data));
});



// Endpoint to get liked, added, and visited locations for a user
app.get('/api/user-locations', (req, res) => {
    const username = req.query.username;
    let data = {};

    try {
        data = JSON.parse(fs.readFileSync(dataFilePath));
    } catch (error) {
        // If the file doesn't exist or is empty, respond with empty data
        return res.json({ likedLocations: [], addedLocations: [], visitedLocations: [] });
    }

    if (!data[username]) {
        return res.json({ likedLocations: [], addedLocations: [], visitedLocations: [] });
    }

    res.json({
        likedLocations: data[username].likedLocations || [],
        addedLocations: data[username].addedLocations || [],
        visitedLocations: data[username].visitedLocations || []
    });
});


// Helper function to read JSON file
const readJSONFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading JSON file:', err);
                return reject(err);
            }
            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            } catch (parseError) {
                console.error('Error parsing JSON file:', parseError);
                reject(parseError);
            }
        });
    });
};

// Route to get recommended locations details
app.get('/api/recommendations', async (req, res) => {
    try {
        const username = req.query.username;
        if (!username) {
            return res.status(400).send({ error: 'Username is required' });
        }

        const userDataPath = dataFilePath;
        const userData = await readJSONFile(userDataPath);

        if (!userData[username]) {
            return res.status(404).send({ error: 'User not found' });
        }

        const recommendedLocations = userData[username]?.recommended || [];
        if (recommendedLocations.length === 0) {
            return res.json([]);
        }

        const results = [];
        const datasetPath = 'Datasets/dataset.csv';

        fs.createReadStream(datasetPath)
            .pipe(csv())
            .on('data', (data) => {
                if (recommendedLocations.includes(data.Name.toLowerCase())) {
                    results.push({
                        Name: data.Name,
                        Location: data.Location,
                        Description: data.Description,
                        Category: data.Category,
                        BestSeason: data.BestSeason,
                        Timings: data.Timings,
                        Reviews: data.Reviews,
                        Rating: data.Rating,
                        Price: data.Price,
                        url: data.url
                    });
                }
            })
            .on('end', () => {
                res.json(results);
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                res.status(500).send({ error: 'An error occurred while reading the CSV file' });
            });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'An internal server error occurred' });
    }
});

















let source, destination, start_date, end_date;

app.get('/', (req, res) => {
    res.sendFile(__dirname + 'index.html');
});

app.post('/iternary', async (req, res) => {
    source = req.body.source;
    destination = req.body.destination;
    start_date = req.body.date;
    end_date = req.body.return;

    let no_of_day = moment(end_date).diff(moment(start_date), 'days');

    if (no_of_day < 0) {
        res.status(400).json({ error: "Return date should be greater than the Travel date (Start date)." });
        return;
    }

    try {
        // Call your weather API here using axios
        let weather_data = await getWeatherData(destination, start_date, end_date);

        // Generate itinerary (assuming bard.generate_itinerary is a function you define)
        let plan = generateItinerary(source, destination, start_date, end_date, no_of_day);

        // Send the response with weather_data and plan
        res.json({ weather_data, plan });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: "Error processing request. Please try again later." });
    }
});

// Example function to get weather data (replace with your actual API call)
async function getWeatherData(destination, start_date, end_date) {
    // Example API call using axios (replace with your actual API and endpoint)
    const apiKey = 'HYA7MBM9MQT687ZDAXUZ27G9A';
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${destination}&dt=${start_date}&end_dt=${end_date}`;
    const response = await axios.get(apiUrl);
    return response.data;
}

// Example function to generate itinerary (replace with your logic)
function generateItinerary(source, destination, start_date, end_date, no_of_day) {
    // Replace with your logic to generate itinerary
    return `Itinerary for ${source} to ${destination} from ${start_date} to ${end_date} (${no_of_day} days)`;
}








app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

