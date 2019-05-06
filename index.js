const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const models = require('./models');

const app = express();
const port = process.env.port || 8080;

// Set .html as the default template extension
app.set('view engine', 'ejs');

// Initialize the ejs template engine
app.engine('html', require('ejs').renderFile);

// Tell express where it can find the templates
app.set('views', path.join(__dirname, '/views'));

// Make the files in the public folder available to the world
app.use(express.static(path.join(__dirname, '/public')));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('./controllers'));

models.sequelize.sync().then(() => {
  app.listen(port, () => console.log(`Listening on port ${port}`));
});
