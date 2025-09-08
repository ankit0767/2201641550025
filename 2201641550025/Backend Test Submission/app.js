const express = require('express');

const crypto = require('crypto');
const { Log } = require('../Logging Middleware/logger.js');

// This array will act as our "urls" table
let urls = [];

// This array will act as our "clicks" table to store detailed stats
let clicks = [];

// This will help us create unique IDs for each new URL
let urlIdCounter = 1;

// --------------------------

// Create our Express app
const app = express();

// This line allows our app to understand JSON in request bodies
app.use(express.json());

// Define a port for our server to listen on
const PORT = 3000;

// A simple helper function to generate a random 6-character string
function generateShortCode() {
  return crypto.randomBytes(3).toString('hex');
}

// --- API Endpoints ---

// 1. Endpoint to Create a new Short URL
// 1. Endpoint to Create a new Short URL
app.post('/shorturls', (req, res) => {
  Log("backend", "info", "handler", "Request received to create a short URL.");
  const { url, shortcode, validity } = req.body;

  // --- Validation ---
  if (!url) {
    Log("backend", "warn", "handler", "URL validation failed: URL is required.");
    return res.status(400).json({ error: 'Malformed input: URL is required' });
  }

  let codeToUse = shortcode;

  // --- Handle the Shortcode ---
  if (codeToUse) {
    // If a custom shortcode was provided, check if it's already taken
    const existingUrl = urls.find(u => u.short_code === codeToUse);
    if (existingUrl) {
      Log("backend", "warn", "db", `Shortcode collision detected for custom code: ${codeToUse}`);
      return res.status(409).json({ error: 'Shortcode collision: This custom name is already in use' });
    }
  } else {
    // If no custom shortcode, generate a new random one until we find one that isn't taken
    do {
      codeToUse = generateShortCode();
    } while (urls.find(u => u.short_code === codeToUse));
  }

  // --- Calculate Expiry Date ---
  const now = new Date();
  const validityMinutes = validity || 30; // Default to 30 minutes
  const expiryDate = new Date(now.getTime() + validityMinutes * 60 * 1000);

  // --- Create and Save the New URL Object ---
  const newUrl = {
    id: urlIdCounter,
    short_code: codeToUse,
    original_url: url,
    created_at: now.toISOString(),
    expires_at: expiryDate.toISOString(),
  };
  urls.push(newUrl); // Add it to our "database"
  urlIdCounter++; // Increment the counter for the next ID

  // --- Send the Success Response ---
  const responseUrl = `http://localhost:${PORT}/${newUrl.short_code}`;
  Log("backend", "info", "db", `Successfully created shortcode ${newUrl.short_code} for URL ${newUrl.original_url}`);
  return res.status(201).json({
    shortLink: responseUrl,
    expiry: newUrl.expires_at
  });
});


// 2. Endpoint to Redirect to the Original URL and Record the Click
// 2. Endpoint to Redirect to the Original URL and Record the Click
app.get('/:shortcode', (req, res) => {
  Log("backend", "info", "handler", `Redirect request received for shortcode: ${req.params.shortcode}`);
  const { shortcode } = req.params;

  // Find the matching URL in our "database"
  const urlObject = urls.find(u => u.short_code === shortcode);

  // --- Error Handling ---
  if (!urlObject) {
    Log("backend", "warn", "handler", `Shortcode not found: ${shortcode}`);
    return res.status(404).json({ error: 'Non-existent shortcode' });
  }

  // Check if the link has expired
  const now = new Date();
  const expiryDate = new Date(urlObject.expires_at);

  if (now > expiryDate) {
    Log("backend", "warn", "handler", `Expired shortcode accessed: ${shortcode}`);
    return res.status(410).json({ error: 'This link has expired' });
  }

  // --- Record the Click Details ---
  const newClick = {
    url_id: urlObject.id,
    clicked_at: now.toISOString(),
    // Get the site the user came from, or mark it as "direct"
    referrer: req.get('Referer') || 'direct',
    // For this test, we'll just record the user's IP as their location
    location: req.ip,
  };
  clicks.push(newClick); // Save the click to our "database"

  // --- Redirect the User ---
  // Send the user to the original long URL
  Log("backend", "info", "handler", `Redirecting ${shortcode} to ${urlObject.original_url}`);
  return res.redirect(302, urlObject.original_url);
});

// 3. Endpoint to Retrieve Short URL Statistics
app.get('/shorturls/:shortcode', (req, res) => {
  const { shortcode } = req.params;

  // Find the URL in our "database"
  const urlObject = urls.find(u => u.short_code === shortcode);

  if (!urlObject) {
    return res.status(404).json({ error: 'Non-existent shortcode' });
  }

  // Find all the clicks that belong to this URL
  const relatedClicks = clicks.filter(c => c.url_id === urlObject.id);

  // Format the final statistics object
  const statistics = {
    totalClicks: relatedClicks.length,
    originalUrl: urlObject.original_url,
    creationDate: urlObject.created_at,
    expiryDate: urlObject.expires_at,
    clickData: relatedClicks.map(click => ({
      timestamp: click.clicked_at,
      referrer: click.referrer,
      location: click.location,
    })),
  };

  // Send the complete statistics object
  return res.status(200).json(statistics);
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});