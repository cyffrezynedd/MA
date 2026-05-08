const path = require('path');

require('dotenv').config({ path: path.join(__dirname, 'env', 'firestore-emulator.env') });
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

/** @returns {import('expo/config').ExpoConfig} */
module.exports = () => require('./app.json').expo;
