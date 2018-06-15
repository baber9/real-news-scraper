const path = require('path');
const mongoose = require('mongoose');

let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/real-news-scraper"

// Connect to MongoDB using mongoose
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);



// require models
var db = require('../models');

// SCRAPING TOOLS

// Axios for http requests (scraping)
const axios = require('axios');
// Cheerio to handle data returned
const cheerio = require('cheerio');


//ROUTES

module.exports = app => {
    
    // home page route (displays unsaved articles in db)
    app.get('/', (req, res) => {

        // find un-saved articles in db
        db.Article.find({ saved: false }, (err, found) => {
            
            // declare hbsObj
            let hbsOjbect = {
                articles: found
            }
            
            if (err) {
                console.log(err)
            } else {
                
                // render hbs obj
                res.render('index', hbsOjbect);

            };
        }).sort({ natural: -1 });
    });

    // get route to retrive saved articles (from db)
    app.get('/saved', (req, res) => {

        // find un-saved articles in db
        db.Article.find({ saved: true }, (err, found) => {
            
            // declare hbsObj
            let hbsOjbect = {
                articles: found
            }
            
            if (err) {
                console.log(err)
            } else {
                
                // render hbs obj
                res.render('saved', hbsOjbect);

            };
        });
    });

    // get route for scraping newsmax.com
    app.get('/scrape', (req, res) => {
        
        // get body from newsmax using axios
        axios.get('https://www.newsmax.com/').then(response => {
            
            // load response into cheerio and assign (use like jquery)
            const $ = cheerio.load(response.data);

            // add counter for response
            let counter = 0;

        // get info from parent element for each headline
        $('div.nmNewsfrontStory div.nmNewsfrontT').each(function(i, element) {

            // result obj
            let result = {};

            // push each article into articles arr
            result.headline = $(this)
                    .children('div.nmNewsfrontHead')
                    .children('h2')
                    .children('a.nmSectionLink')
                    .text();

            result.summary = $(this)
                    .children('div.nmNewsfrontSummary')
                    .text().replace(/\s+/g, ' ')
                    .replace('[Full Story]', '')
                    .replace('|', '')
                    .trim();

            result.link = "https://newsmax.com" + $(this)
                    .children('div.nmNewsfrontSummary')
                    .children('a.linkFullStory')
                    .attr('href');

            // increment counter
            counter++;

            // create new Article using result obj
            db.Article.create(result)
            .then(dbArticle => {
                // console.log(dbArticle);
            })
            .catch(error => {
                // if error, send
                // return res.json(err);
                if (error.response) {
                    console.log(`Response Data: ${error.response.data}`);
                    console.log(`Response Status: ${error.response.status}`);
                    console.log(`Response Headers: ${error.repsonse.headers}`);
                } else if (error.request) {
                    console.log(`Request Error: ${error.request}`);
                } else {
                    console.log(`Error: ${error.message}`);
                }
                console.log(`Config Error: ${error.config}`);
            });

            

        });

            res.send(`${counter} new articles added.`)
            
        });

    });

    // route to save article (updates saved prop of article)
    app.post('/save-article/:id', (req, res) => {

        db.Article.updateOne(
            { '_id': req.params.id },
            { $set: { 'saved': true }}
            
        )
        .catch (error => {
            console.log("Save Error: ", error);
        });

        res.send(`Article saved.`);
    });

     // route to unsave article (updates saved prop of article)
     app.post('/unsave-article/:id', (req, res) => {

        // update saved state to false
        db.Article.updateOne(
            { '_id': req.params.id },
            { $set: { 'saved': false }}
            
        )
        .catch (error => {
            console.log("Save Error: ", error);
        });

        res.send(`Article removed from saved articles.`);
    });

    // route to delete all notes using articleID (when article is unsaved)
    app.post('/delete-notes/:id', (req, res) => {
        
        // delete all notes related to article
        db.Note.remove({
            articleId : req.params.id 
        }, (err) => {
            console.log(err)
        });
    });

    // route to get notes for an article id (from db)
    app.get('/notes/:id', (req, res) => {

        db.Note.find({ 'articleId': req.params.id }, (err, found) => {
            if (found) {
                res.send(found);
            } 
        });

    });

    app.post('/save-note', (req, res) => {

        console.log(req.body);
        // create new Article using req obj
        db.Note.create(req.body)
        .then(dbArticle => {
            // console.log(dbArticle);
        })

        res.send(`Note saved.`);
    });

    // Delete single note using NotesID (from Notes Display Modal)
    app.post('/delete-note/:id', (req, res) => {
        // console.log('req.params.id: ', req.params.id);
        db.Note.remove({
            _id: req.params.id
        }).then(() => {
            res.send('Note deleted');
        });
    });



}


