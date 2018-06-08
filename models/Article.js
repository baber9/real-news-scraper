const mongoose = require('mongoose');

// save reference to Schema constructor
const Schema = mongoose.Schema;

// create new Schema
const ArticleSchema = new Schema({
    headline: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    // Object to store note
    // link to Note model which allows us to populate Article with associatied note
    note: {
        type: Schema.Types.ObjectId,
        ref: 'Note'
    }
});

// use mongoose model method to create model
const Article = mongoose.model('Article', ArticleSchema);

// export model
module.exports = Article;