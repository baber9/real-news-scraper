const mongoose = require('mongoose');

// save reference of Schema constructor
const Schema = mongoose.Schema;

// create new NoteSchema using contructor
const NoteSchema = new Schema({
    note: String,
    articleId: String
});

// use mongoose model method to create model (using schema above)
const Note = mongoose.model('Note', NoteSchema);

// export model
module.exports = Note;