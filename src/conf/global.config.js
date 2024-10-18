// DEV CONFIGURATION
var settings = {
  project: process.env.PROJECT,
  space: process.env.SPACE,
  auth: {
    google: process.env.WITH_GOOGLE_SECRET,
    facebook: process.env.CROWDHERITAGE_FACEBOOK_SECRET
  },
  baseUrl: process.env.BASE_URL, // Production backend
  apiUrl: process.env.API_URL,
  googlekey: process.env.WITH_GOOGLE_KEY,
  logLevel: 1 // Error: 1, Warn: 2, Info: 3, Debug: 4
};

// Override settings for development/testing etc
if (window.location.hostname === 'DEV') {
  // settings.baseUrl = process.env.WITH_BASE_URL;  // Original WITH-backend
  settings.baseUrl = process.env.DEV_BASE_URL;   // Backend with test-DB
  // settings.baseUrl = process.env.LOCAL_BASE_URL; // Local backend for testing
  // settings.project = 'WITHcrowd';
  settings.logLevel = 4; // Debug
}
// Override for staging
else if (window.location.hostname === 'withcrowd.eu') {
  settings.auth.facebook = process.env.WITHCROWD_FACEBOOK_SECRET;
  settings.baseUrl = process.env.WITHCROWD_BASE_URL;
  settings.project = 'WITHcrowd';
}
else if (window.location.hostname === 'crowdheritage.eu' || window.location.hostname === 'www.crowdheritage.eu') {
  settings.project = 'CrowdHeritage';
}
else {
  settings.logLevel = 4; // Debug
  console.log(`${window.location.hostname}`);
}

export default settings;
