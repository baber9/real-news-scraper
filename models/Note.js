const mongoose = require('mongoose');

// save reference of Schema constructor
const Schema = mongoose.Schema;

// create new NoteSchema using contructor
const NoteSchema = new Schema({
    title: String,
    body: String
});

// use mongoose model method to create model (using schema above)
const Note = mongoose.model('Note', NoteSchema);

// export model
module.exports = Note;