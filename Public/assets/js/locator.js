// Initialize map using Leaflet
let map = L.map('map').setView([28.6139, 77.2090], 13); // Centered on New Delhi

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Marker for user's location
let userMarker = null;

document.getElementById('find-location').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;

            // Center map on user's location
            map.setView([latitude, longitude], 13);

            // Add marker for user's location
            if (userMarker) {
                map.removeLayer(userMarker);
            }
            userMarker = L.marker([latitude, longitude]).addTo(map)
                .bindPopup("You are here").openPopup();

            // Fetch gynecologists based on location
            fetchGynecologists(latitude, longitude);
        }, () => {
            alert("Unable to retrieve your location");
        });
    } else {
        alert("Geolocation is not supported by your browser");
    }
});

// Fetch gynecologists from backend
function fetchGynecologists(lat, lng) {
    fetch(`/gynecologists?lat=${lat}&lng=${lng}`)
        .then(response => response.json())
        .then(data => {
            const gynecologistsList = document.getElementById('gynecologists');
            const doctorSelect = document.getElementById('doctor');

            gynecologistsList.innerHTML = '';
            doctorSelect.innerHTML = '<option value="" disabled selected>Select a doctor</option>'; // Reset dropdown

            data.forEach(doctor => {
                // Add gynecologist to list
                const li = document.createElement('li');
                li.textContent = `${doctor.name} - Rating: ${doctor.rating}`;
                gynecologistsList.appendChild(li);

                // Add gynecologist to appointment dropdown
                const option = document.createElement('option');
                option.value = doctor.name;
                option.textContent = `${doctor.name} - Rating: ${doctor.rating}`; // Show rating in dropdown
                doctorSelect.appendChild(option);

                // Add gynecologist marker on map
                L.marker([doctor.lat, doctor.lng]).addTo(map)
                    .bindPopup(`${doctor.name} - Rating: ${doctor.rating}`);
            });
        })
        .catch(error => console.error('Error fetching gynecologists:', error));
}

// Handle appointment booking
document.getElementById('appointment').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const doctor = document.getElementById('doctor').value;

    fetch('/book-appointment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, date, doctor }),
    })
        .then(response => response.json())
        .then(data => alert('Appointment booked successfully! Confirmation SMS sent to your phone.'))
        .catch(error => console.error('Error booking appointment:', error));
});
