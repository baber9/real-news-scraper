const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');



const PORT = process.env.PORT || 3000;

// Initialize express for routing
const app = express();


// CONFIGURE MIDDLEWARE

// morgan for logging all reqs
app.use(logger('dev'));
// body-parser for form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// express.static to serve public folder as a static directory
app.use(express.static('public'));

// setup handlebars
const exphbs = require('express-handlebars');
// set hbs views
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');



// ROUTES

require('./routes/news-scraper-routes.js')(app);

// start server
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});
