/**
 * server/data/lkLocations.js
 * Sri Lanka's 25 districts with the coordinates of each district's main town.
 * The weather API only ever accepts one of these names, so the client can't
 * make the server fetch arbitrary coordinates.
 */
const locations = [
  { name: 'Ampara', lat: 7.2975, lon: 81.682 },
  { name: 'Anuradhapura', lat: 8.3114, lon: 80.4037 },
  { name: 'Badulla', lat: 6.9934, lon: 81.055 },
  { name: 'Batticaloa', lat: 7.731, lon: 81.6747 },
  { name: 'Colombo', lat: 6.9271, lon: 79.8612 },
  { name: 'Galle', lat: 6.0535, lon: 80.221 },
  { name: 'Gampaha', lat: 7.0873, lon: 79.9925 },
  { name: 'Hambantota', lat: 6.1241, lon: 81.1185 },
  { name: 'Jaffna', lat: 9.6615, lon: 80.0255 },
  { name: 'Kalutara', lat: 6.5854, lon: 79.9607 },
  { name: 'Kandy', lat: 7.2906, lon: 80.6337 },
  { name: 'Kegalle', lat: 7.2513, lon: 80.3464 },
  { name: 'Kilinochchi', lat: 9.3803, lon: 80.377 },
  { name: 'Kurunegala', lat: 7.4863, lon: 80.3647 },
  { name: 'Mannar', lat: 8.981, lon: 79.9044 },
  { name: 'Matale', lat: 7.4675, lon: 80.6234 },
  { name: 'Matara', lat: 5.9549, lon: 80.555 },
  { name: 'Monaragala', lat: 6.8728, lon: 81.3507 },
  { name: 'Mullaitivu', lat: 9.2671, lon: 80.8142 },
  { name: 'Nuwara Eliya', lat: 6.9497, lon: 80.7891 },
  { name: 'Polonnaruwa', lat: 7.9403, lon: 81.0188 },
  { name: 'Puttalam', lat: 8.0408, lon: 79.8394 },
  { name: 'Ratnapura', lat: 6.6828, lon: 80.3992 },
  { name: 'Trincomalee', lat: 8.5874, lon: 81.2152 },
  { name: 'Vavuniya', lat: 8.7514, lon: 80.4971 },
];

const DEFAULT_LOCATION = 'Colombo';

const normalise = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');

/** Case-insensitive lookup by district name; undefined when unknown. */
const findLocation = (name) => locations.find((l) => normalise(l.name) === normalise(name));

module.exports = { locations, findLocation, DEFAULT_LOCATION };
