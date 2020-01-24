const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const querySchema = new Schema({
    domain: String
});

module.exports = mongoose.model('query', querySchema, 'queries');
