var loopback = require('loopback');
var fs = require('fs');
var open = require('open');
var explorer = require('loopback-explorer');

var API_URL = '/api/restaurant';
var API_URL_ID = API_URL + '/:id';
var API_URL_ORDER = '/api/order';

var removeMenuItems = function(restaurant) {
  var clone = {};

  Object.getOwnPropertyNames(restaurant).forEach(function(key) {
    if (key !== 'menuItems') {
      clone[key] = restaurant[key];
    }
  });

  return clone;
};


exports.start = function(PORT, STATIC_DIR, DATA_FILE, TEST_DIR) {
  var app = loopback();

  // db
  app.dataSource('db', {connector: loopback.Memory});

  // models
  var Restaurant = app.model('restaurant', {
    dataSource: 'db',
    properties: {
      id: {type: String, id: true}
    }
  });
  var MenuItem = app.model('menu-item', {dataSource: 'db'});
  var Order = app.model('order', {dataSource: 'db'});

  // log requests
  app.use(loopback.logger('dev'));

  // serve static files for demo client
  app.use(loopback.static(STATIC_DIR));

  // parse body into req.body
  app.use(loopback.bodyParser());

  // use rest
  app.use('/api', loopback.rest());
  app.use(loopback.rest());

  // explorer
  app.use('/explorer', explorer(app, {baseUrl: '/api'}));

  // only for running e2e tests
  app.use('/test/', loopback.static(TEST_DIR));

  // start the server
  // read the data from json and start the server
  fs.readFile(DATA_FILE, function(err, data) {
    JSON.parse(data).forEach(function(restaurant) {
      console.log(restaurant);
      Restaurant.create(restaurant);
    });

    app.listen(PORT, function() {
      open('http://localhost:' + PORT + '/');
    });
  });
};