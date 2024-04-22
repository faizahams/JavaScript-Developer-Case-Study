// Define a global variable for the map
let map;
let markers = []; // Array to store customer markers
let predefinedLocation = { lat: 6.577222, lng: 3.321111 }; // Latitude and Longitude of Murtala Muhammed International Airport

function initMap() {
    // Initialize the map
    map = new google.maps.Map(document.getElementById("map"), {
        center: predefinedLocation,
        zoom: 8,
    });
    // Get the original dimensions of the marker image
const originalWidth = 32; // Original width of the marker image
const originalHeight = 44; // Original height of the marker image

// Calculate the aspect ratio of the original image
const aspectRatio = originalWidth / originalHeight;

// Calculate the new width based on the desired height
const newHeight = 44; // Desired height of the marker image
const newWidth = newHeight * aspectRatio;
    // Place a marker at the predefined location
    const airportMarker = new google.maps.Marker({
        position: predefinedLocation,
        map: map,
        title: 'Airport Icon',
        icon: {
        url: 'assets/airport_icon.png',
        scaledSize: new google.maps.Size(newWidth, newHeight) // Adjust the size of the marker image
    }
    });

    markers.push(airportMarker);  // Add marker to markers array

    // Add click event listener to the map
    map.addListener("click", function(event) {
        fillForm(event.latLng); // Call fillForm function when map is clicked
    });

    // Submit form event listener
    document.getElementById("customerForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent form submission

        // Validate form inputs
        if (validateForm()) {
            // Get form values
            const customerName = document.getElementById("customerName").value;
            const customerAddress = document.getElementById("customerAddress").value;
            const customerPhoneNumber = document.getElementById("customerPhoneNumber").value;
            const customerEmail = document.getElementById("customerEmail").value;

            // Place a marker at the specified location
            const customerMarker = new google.maps.Marker({
                position: {
                    lat: parseFloat(customerAddress.split(",")[0]),
                    lng: parseFloat(customerAddress.split(",")[1])
                },
                map: map,
                title: customerName,
            });

            markers.push(customerMarker); // Add marker to markers array

            // Link customer information to marker
            customerMarker.customerInfo = {
                name: customerName,
                address: customerAddress,
                phonenumber: customerPhoneNumber,
                email: customerEmail
            };

            // Calculate and display distance from predefined location
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(predefinedLocation.lat, predefinedLocation.lng),
            customerMarker.getPosition()
        );

        const distanceInKm = (distance / 1000).toFixed(2); // Convert distance to kilometers and round to 2 decimal places

        // Display customer information and distance as a label on the marker
        const distanceLabel = `${distanceInKm} km`;
        const infoWindow = new google.maps.InfoWindow({
            content: `<p><strong>Name:</strong> ${capitalizeName(customerMarker.customerInfo.name)}</p>
    <p><strong>Location:</strong> ${customerMarker.customerInfo.address}</p>
    <p><strong>Phone Number:</strong> ${customerMarker.customerInfo.phonenumber}</p>
    <p><strong>Email:</strong> ${customerMarker.customerInfo.email}</p>
            <p><strong>Distance from Murtala Muhammed International Airport:</strong> ${distanceLabel}</p>`
        });
        customerMarker.addListener("click", function() {
            infoWindow.open(map, customerMarker);
        });

            // Clear form fields
            document.getElementById("customerName").value = "";
            document.getElementById("customerAddress").value = "";
            document.getElementById("customerPhoneNumber").value = "";
            document.getElementById("customerEmail").value = "";

            // Send customer data to backend
            fetch('http://localhost:3000/customer', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        name: customerName,
        address: customerAddress,
        phonenumber: customerPhoneNumber,
        email: customerEmail
    }),
})
.then(response => {
    if (response.ok) {
        // Customer added successfully
        return response.json();
    } else if (response.status === 400) {
        // Duplicate customer detected
        throw new Error('Duplicate customer detected');
    } else {
        throw new Error('Failed to add customer: ' + response.statusText);
    }
})
.then(data => {
    console.log('Customer added successfully:', data);
})
.catch(error => {
    console.error(error.message);
});

        }
    });
}

function fillForm(location) {
    // Fill form fields with location coordinates
    document.getElementById("customerAddress").value = location.lat() + ", " + location.lng();
}

function validateForm() {
    var name = document.getElementById("customerName").value;
    var address = document.getElementById("customerAddress").value;
    var phonenumber = document.getElementById("customerPhoneNumber").value;
    var email = document.getElementById("customerEmail").value;
    var errorMessage = "";
    //Check that all inputs are not empty
   // Check that the input contains both a first and last name
    if (name.trim() === "") {
        errorMessage += "Name is required.<br>";
    } else {
        var names = name.trim().split(" ");
        if (names.length < 2) {
            errorMessage += "Please enter both first and last name.<br>";
        }
    }
    if (address.trim() === "") {
        errorMessage += "Address is required.<br>";
    }
    // Check that the input is a valid phone number

    if (phonenumber.trim() === "") {
        errorMessage += "Phone Number is required.<br>";
    } else if (!validatePhoneNumber(phonenumber)) {
        errorMessage += "Invalid Phone Number format. Please enter a valid phone number.<br>";
    }

    // Check that the input is a valid email

    if (email.trim() === "") {
        errorMessage += "Email is required.<br>";
    } else if (!validateEmail(email)) {
        errorMessage += "Invalid Email format. Please enter a valid email address.<br>";
    }

    // If any of the fields are not valid display an error message
    if (errorMessage !== "") {
        document.getElementById("errorMessages").innerHTML = errorMessage;
        return false;
    }

    return true;
}

function validatePhoneNumber(phonenumber) {
    // Regular expression to match phone number with optional international code
    var phonePattern = /^\+?\d{0,3}(\(\d{3}\)|\d{3})[- ]?\d{3}[- ]?\d{4}$/;
    return phonePattern.test(phonenumber);
}

function validateEmail(email) {
    // Regular expression to match email address
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function capitalizeName(name) {
  // Regular expression to match the first letter of each word
    return name.replace(/\b\w/g, function(char) {
      // Capitalize the first letter
        return char.toUpperCase();
    });
}
