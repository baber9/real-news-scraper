const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

// SCRAPING TOOLS

// Axios for http requests (scraping)
const axios = require('axios');
// Cheerio to handle data returned
const cheerio = require('cheerio');

// require models
var db = require('./models');

const PORT = 3000;

// Initialize express for routing
const app = express();

// CONFIGURE MIDDLEWARE

// morgan for logging all reqs
app.use(logger('dev'));
// body-parser for form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// express.static to serve public folder as a static directory
app.use(express.static('public'));

// Connect to MongoDB using mongoose
mongoose.connect('mongodb://localhost/real-news-scraper');

// ROUTES

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

            // add headline, summary and link of each to result obj
            result.headline = $(this)
                .children('div.nmNewsfrontHead')
                .children('h2')
                .children('a.nmSectionLink')
                .text();
            result.summary =$(this)
                .children('div.nmNewsfrontSummary')
                .text().replace(/\s+/g, ' ')
                .replace('[Full Story]', '')
                .replace('|', '')
                .trim();
            result.link = "https://www.newsmax.com" + $(this)
                .children('div.nmNewsfrontSummary')
                .children('a.linkFullStory')
                .attr('href');

            counter++;

            // create new Article using result obj
            db.Article.create(result)
                .then(dbArticle => {
                    console.log(dbArticle);
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

        // if successful scrape, save Article and send message
        res.send(`${counter} news articles scraped.`);

    });
});

// start server
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
})