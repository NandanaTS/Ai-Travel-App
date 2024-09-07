function getNewUsername() {
    let userCounter = parseInt(localStorage.getItem('userCounter')) || 0;
    userCounter++;
    localStorage.setItem('userCounter', userCounter);
    return 'user' + userCounter;
}

const username = '00'; //getNewUsername();

// Function to fetch and display user locations
function fetchUserLocations() {
    return fetch(`http://localhost:3000/api/user-locations?username=${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error:', error);
            return { likedLocations: [], addedLocations: [], visitedLocations: [] };
        });
}

// Fetch all locations and user-specific locations, then display them
Promise.all([
    fetch('http://localhost:3000/api/data').then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }),
    fetchUserLocations()
])
.then(([allLocations, userLocations]) => {
    displayLocations(allLocations, userLocations.likedLocations, userLocations.addedLocations, userLocations.visitedLocations, 'other-location-container');
})
.catch(error => {
    console.error('Error:', error);
});


function fetchLocationsByCity(city) {
    Promise.all([
        fetch(`http://localhost:3000/api/locations-by-city?city=${city}`).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }),
        fetchUserLocations()
    ])
    .then(([cityLocations, userLocations]) => {
        displayLocations(cityLocations, userLocations.likedLocations, userLocations.addedLocations, userLocations.visitedLocations, 'location-container');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayLocations(data, likedLocations, addedLocations, visitedLocations, loc) {
    const container = document.getElementById(loc);

    // Check if the container exists
    if (!container) {
        console.error(`Container with ID ${loc} not found.`);
        return;
    }

    container.innerHTML = '';

    data.forEach(location => {
        const card = document.createElement('div');
        card.classList.add('location-card');

        // Check if likedLocations, addedLocations, and visitedLocations are arrays
        const isLiked = Array.isArray(likedLocations) && likedLocations.includes(location.Name);
        const isAdded = Array.isArray(addedLocations) && addedLocations.includes(location.Name);
        const isVisited = Array.isArray(visitedLocations) && visitedLocations.includes(location.Name);

        card.innerHTML = `
            <h2>${location.Name}</h2>
            <p><strong>Location:</strong> ${location.Location}</p>
            <p><strong>Description:</strong> ${location.Description}</p>
            <p><strong>Category:</strong> ${location.Category}</p>
            <button class="already-visited card-buttons ${isVisited ? 'visited' : ''}" data-location="${location.Name}">
                Already Visited
            </button>
            <button class="like card-buttons ${isLiked ? 'liked' : ''}" data-location="${location.Name}">
                <i class="fas fa-thumbs-up"></i>
            </button>
            <button class="add card-buttons ${isAdded ? 'added' : ''}" data-location="${location.Name}">
                <i class="fas fa-plus"></i>
            </button>
        `;

        container.appendChild(card);
    });

    // Attach event listeners to buttons
    attachButtonListeners();
}


function showPosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    console.time('City Located in'); 
    // Make a reverse geocoding request
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(response => response.json())
        .then(data => {
            if (data.address && data.address.city) {
                const city = data.address.city;
                document.getElementById("City").textContent = city;
                fetchLocationsByCity(city);
            } else {
                document.getElementById("City").textContent = "City not found";
            }
        })
        .catch(error => {
            console.error("Error fetching reverse geocoding data:", error);
            document.getElementById("City").textContent = "Error fetching city data";
        });

    console.timeEnd('City Located in'); // End the timer
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

window.onload = function() {
    getLocation();
}

document.getElementById('searchInput').addEventListener('input', function(event) {
    const query = event.target.value;
    if (query.trim() === '') {
        showLocationContainer();
    } else {
        document.getElementById("OtherCity").textContent = 'in ' + query;
        hideLocationContainer();
        fetchAllLocations(query);
    }
});

function fetchAllLocations() {
    fetch('http://localhost:3000/api/data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const query = document.getElementById('searchInput').value;
            const filteredLocations = filterLocations(data, query);
            fetchUserLocations()
                .then(userLocations => {
                    displayLocations(filteredLocations, userLocations.likedLocations, userLocations.addedLocations, userLocations.visitedLocations, 'other-location-container');
                })
                .catch(error => {
                    console.error('Error fetching user locations:', error);
                    // Display filtered locations without considering liked or added status
                    displayLocations(filteredLocations, [], [], 'other-location-container');
                });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function hideLocationContainer() {
    const container = document.getElementById('location-container');
    container.style.display = 'none';
    const subtitle = document.querySelector('.Subtitle1');
    subtitle.style.display = 'none';
}

function showLocationContainer() {
    const container = document.getElementById('location-container');
    container.style.display = 'grid';
    const subtitle = document.querySelector('.Subtitle1');
    subtitle.style.display = 'block';
}

function filterLocations(locations, query) {
    return locations.filter(location => {
        return (
            location.Name?.toLowerCase().includes(query.toLowerCase()) ||
            location.Location?.toLowerCase().includes(query.toLowerCase()) ||
            location.Description?.toLowerCase().includes(query.toLowerCase()) ||
            location.Category?.toLowerCase().includes(query.toLowerCase())
        );
    });
}

function likeLocation(location, button) {
    fetch('http://localhost:3000/api/like', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, location, actionType: 'like' })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        button.classList.toggle('liked'); // Toggle the button state
        // Refresh data in both containers after liking
        fetchAllLocations(); // Refresh data in other-location-container
        fetchLocationsByCity(document.getElementById("City").textContent); // Refresh data in location-container
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function addLocation(location, button) {
    fetch('http://localhost:3000/api/like', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, location, actionType: 'add' })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        button.classList.toggle('added'); // Toggle the button state
        // Refresh data in both containers after adding
        fetchAllLocations(); // Refresh data in other-location-container
        fetchLocationsByCity(document.getElementById("City").textContent); // Refresh data in location-container
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function visitLocation(location, button) {
    fetch('http://localhost:3000/api/like', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, location, actionType: 'visit' })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        button.classList.toggle('visited'); // Toggle the button state
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function attachButtonListeners() {
    // Remove existing event listeners
    document.querySelectorAll('.like').forEach(button => {
        button.removeEventListener('click', likeButtonClickHandler);
    });
    // Remove existing event listeners
    document.querySelectorAll('.add').forEach(button => {
        button.removeEventListener('click', addButtonClickHandler);
    });
     // Remove existing event listeners
     document.querySelectorAll('.already-visited').forEach(button => {
        button.removeEventListener('click', visitButtonClickHandler);
    });

    // Add event listeners to like buttons
    document.querySelectorAll('.like').forEach(button => {
        button.addEventListener('click', likeButtonClickHandler); 
    });

    // Add event listeners to add buttons
    document.querySelectorAll('.add').forEach(button => {
        button.addEventListener('click', addButtonClickHandler); 
    });

    // Add event listeners to visited buttons
    document.querySelectorAll('.already-visited').forEach(button => {
        button.addEventListener('click', visitButtonClickHandler); 
    });

    
}

function likeButtonClickHandler() {
    const location = this.getAttribute('data-location');
    likeLocation(location, this);
}

function addButtonClickHandler() {
    const location = this.getAttribute('data-location');
    addLocation(location, this);
}

function visitButtonClickHandler() {
    const location = this.getAttribute('data-location');
    visitLocation(location, this);
}
