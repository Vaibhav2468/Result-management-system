const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  globalReleaseDate: { type: Date, required: true }, // This will store both date and time
});

const Settings = mongoose.model("Settings", settingsSchema);

module.exports = Settings;
