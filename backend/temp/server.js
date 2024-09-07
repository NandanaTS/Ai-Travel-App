const express = require('express');
const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

const dataFilePath = path.join(__dirname, 'userData/userData.json');


const initialData = {
    "00": {
      "likedLocations": [],
      "addedLocations": [],
      "visitedLocations": []
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




app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

