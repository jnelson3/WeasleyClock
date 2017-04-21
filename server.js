console.log('Loading Server');

// load main modules
var express = require ('express');
var fs = require('fs');
var exec = require('child_process').exec;
var GMapsAPIKey = 'AIzaSyA9cg_uHvbxgBnalRYoNeQ1n_s41mZ0rvc';
var DEFAULT_RADIUS = 200;
var defaultLocations = ['home', 'school', 'work', 'church', 'unknown'];

// load express middleware modules
var logger = require('morgan');
var bodyParser = require('body-parser');

// create express app
var app = express();

// insert middleware
app.use(logger('dev'));
app.use(bodyParser.json());

// load express middleware modules
var router = express.Router();

// load location data
var people = fs.readFileSync(`${__dirname}/people.json`);
console.log(people);
people = JSON.parse(people);
console.log(people);

// REST endpoints
// update
app.put('/api/v1/update', function(req, res){
	moveHand(req.body.name, req.body.location);
	console.log(`${req.body.name} is located at ${req.body.location}`);
	res.sendStatus(200);
});

// read
app.get('/api/v1/:name.json', function(req, res) {
	for (var i = 0; i < people.length; i++) {
		console.log("person is " + people[i]);
		if (req.params.name === people[i].name) {
			res.status(200).json(people[i]);
			return;
		}
	}
	// if name not found
	res.sendStatus(404);
});

// create


var server = app.listen(8080);

console.log("server listening");

function gracefullShutdown() {
   console.log('\nStarting Shutdown');
   server.close(function() {
      console.log('\nShutdown Complete');
   });
}

process.on('SIGTERM', function() { //kill (terminate)
   gracefullShutdown();
});

process.on('SIGINT', function() { //Ctrl+C (interrupt)
   gracefullShutdown();
});

//SIGKILL (kill -9) can't be caught by any process, including node
//SIGSTP/SIGCONT (stop/continue) can't be caught by node

function moveHand(name, location) {
	console.log('moving hand');
	var handID = 0;
	var servoSetMin = 80; // minimum value for servo
	var servoSetMax = 150; // maximum value of servo after adding minimum
	var servoSet = 0; // position to set servo
	
	for (var i = 0; i < people.length; i++) {
		if (name === people[i].name) {
			handID = i+1;
			break;
		}
	}
	
	servoSet = defaultLocations.indexOf(location) * (servoSetMax / (defaultLocations.length-1));
	if (servoSet < 0) {
		servoSet = servoSetMax;
	}
	servoSet = servoSet + servoSetMin;
	console.log("moving hand to " + location);
	
	exec(`echo ${handID}=${servoSet} > /dev/servoblaster`);
}

function createUser(name) {
	var person = {};
	person.name = name;
	var locations = [];
	for (defaultLocation in defaultLocations) {
		var location = {};
		location.locationName = defaultLocation;
		location.lat = null;
		location.lon = null;
		location.radius = DEFAULT_RADIUS;
		locations.push(location);
	}
	person.locations = locations;
	people.push(person);
	fs.writeFileSync(`${__dirname}/people.json`, JSON.stringify(people));
}