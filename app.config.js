const path = require('path');

require('dotenv').config({ path: path.join(__dirname, 'env', 'firestore-emulator.env') });
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

/** Формат с ключом `expo` обязателен для Expo / EAS (иначе configure и build падают). */
module.exports = {
  expo: require('./app.json').expo,
};
