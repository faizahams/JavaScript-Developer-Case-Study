require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Access the API key from environment variable
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

app.use(express.static('public'));



// Route to handle GET requests to the root URL
app.get('/', (req, res) => {
    res.send('The Customer Location Pinning System is live');
    res.render('index', { apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

// Route to save customer information
app.post('/customer', (req, res) => {
    const { name, address, phonenumber, email } = req.body;

    // Check if any required field is missing
    if (!name || !address || !phonenumber || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Read existing customers from the JSON file
    fs.readFile('customers.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        let customers = [];
        if (data) {
            customers = JSON.parse(data);
        }

        // Check if customer with the same email or phone number already exists
        const isDuplicateEmail = customers.some(customer => customer.email === email);
        const isDuplicatephonenumber = customers.some(customer => customer.phonenumber === phonenumber);

        if (isDuplicateEmail) {
            return res.status(400).json({ error: 'Customer with the same email already exists' });
        }

        if (isDuplicatephonenumber) {
            return res.status(400).json({ error: 'Customer with the same phone number already exists' });
        }

        // Add the new customer to the array
        customers.push({ name, address, phonenumber, email });

        // Write the updated customer list to the JSON file
        fs.writeFile('customers.json', JSON.stringify(customers), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.status(201).json({ message: 'Customer information saved successfully' });
        });
    });
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Function to check if a customer with the same email already exists
function isDuplicateEmail(email) {
    // Load existing customers from customers.json
    const customers = JSON.parse(fs.readFileSync('customers.json', 'utf8'));

    // Check if customer with the same email exists
    return customers.some(customer => {
        return customer.email === email;
    });
}

// Function to check if a customer with the same phone number already exists
function isDuplicatephonenumber(phonenumber) {
    // Load existing customers from customers.json
    const customers = JSON.parse(fs.readFileSync('customers.json', 'utf8'));

    // Check if customer with the same phone number exists
    return customers.some(customer => {
        return customer.phonenumber === phonenumber;
    });
}
