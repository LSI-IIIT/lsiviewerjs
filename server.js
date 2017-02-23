var express = require('express');
var ogr2ogr = require('ogr2ogr');
var fs = require('fs');
var jsonfile = require('jsonfile');
var app = express();
var path = require('path');
var compression = require('compression');
var multer = require('multer');
var zlib = require('zlib');
var tj = require('togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use jsdom
    jsdom = require('jsdom').jsdom;
var brotli = require('iltorb').compressStream;
var lzma = require('lzma-native').createStream.bind(null, 'aloneEncoder');
var path = './uploads/';
var detectvectorformat = require('./detectvectorformat');
/*
app.get('/', function (req, res) {
   res.send('Hello World using express dasdas');
})
*/
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads/');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});




app.use(express.static('assets'));
app.use(express.static('uploads'));
app.use('/assets', express.static('assets'));
app.use('/uploads', express.static('uploads'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
var upload = multer({ storage : storage })

app.get('/lsiviewer1', function (req, res) {
	/*	
	var shapefile = ogr2ogr('/Users/Manikanta/Desktop/RESEARCH/isprs/SampleData/shapefiles/Andhra_pradesh_region.shp')
					.format('GeoJson')
					.skipfailures()
					.timeout(1000000)
					.stream();
	var writeStream = fs.createWriteStream('./shapefile.json');
	shapefile.pipe(writeStream);
	console.log("hi from lsiviewer...!");
	
	writeStream.on('finish', function() {
        // do stuff
        res.writeHead(200, {"Content-Type": "application/json"});
	    var obj = fs.createReadStream('./shapefile.json');
		obj.pipe(res);
        //callbackTest(res, './shapefile.json');
    });
	*/
    res.writeHead(200, {"Content-Type": "application/json"});
	    var obj = fs.createReadStream('./shapefile.json');
		obj.pipe(res);

});

app.get('/', function(req, res) {
	res.render('index.html');
});

app.get('/lsiviewer', function(req, res) {
	res.render('lsiviewer.html');
});

app.get('/wms', function(req, res) {
	res.render('wms.html');
});

app.get('/login', function(req, res) {
	res.render('login.html');
});

app.get('/login_success', function(req, res) {
	res.render('login_successful.html');
});



// Necessary for file validation 
var MIME_TYPES = {
	'shapefile' : ['shp', 'shx', 'dbf'],
	'gpx' : ['gpx'],
	'kml' : ['kml'],
	'geojson' : ['geojson'], //geojson,
	'json' : ['json'],
	'gml' : ['gml']
}


app.post('/uploadFiles', upload.array('files', 4), function(req, res, next) {
	
	// 1. Files written, 2. iterate through files and check if they are same, 3. convert it into json, 4. return json as response 
	
	/**
	 * Things needed : 
	 	1. Validation method that takes request files(atleast for 5 formats) 
	 	2. Object that represents MIME types of files
	 	3. Method for json conversion taking format as response
	 */
	 // gen filepath
	var validated_object = detectvectorformat.validate_uploaded_files(req);
	var filepath = null;
	
	for (var key in MIME_TYPES) {
		if (key == validated_object.file_type) {
			filepath = path + validated_object.file_name + '.' + MIME_TYPES[key][0];
		}
	}
	var file_type = validated_object.file_type;
	var file_name = validated_object.file_name;
	// 3. Method for Json conversion (files should have same mime)
	if (file_type == "kml") {
		// Use toGeoJson to convert from kml to geojson
		var kml = jsdom(fs.readFileSync(filepath, 'utf8'));
		var converted_json = tj.kml(kml);
		var converted_with_styles = tj.kml(kml, { styles: true });
		jsonfile.writeFile(path + validated_object.file_name + '.json', converted_with_styles, function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    res.writeHead(200, {"Content-Type": "application/json"});
		    var obj = fs.createReadStream(path + validated_object.file_name + '.json');
			obj.pipe(res);
		   
		}); 
	}

	if (file_type == "gpx") {
		// Use toGeoJson to convert from gpx to geojson
		var gpx = jsdom(fs.readFileSync(filepath));
		var converted_json = tj.gpx(gpx);
		var converted_with_styles = tj.gpx(gpx, { styles: true });
		jsonfile.writeFile(path + validated_object.file_name + '.json', converted_with_styles, function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    res.writeHead(200, {"Content-Type": "application/json"});
		    var obj = fs.createReadStream(path + validated_object.file_name + '.json');
			obj.pipe(res);
		   
		}); 
	    

	}
	console.log("file type = " + file_type);
	if ((file_type == "shapefile" && req.files.length >= 3) || file_type == "gml") {
		   	
		var geojson = ogr2ogr(filepath)
						.format('GeoJson')
						.skipfailures()
						.timeout(1000000)
						.stream();
		var writeStream = fs.createWriteStream(path + validated_object.file_name + '.json');
		geojson.pipe(writeStream);
		var _res = res;
		writeStream.on('finish', function() {
	        // do stuff
		    var obj = fs.createReadStream(path + validated_object.file_name + '.json');
			_res.writeHead(200, {"Content-Type": "application/json", "content-encoding": "lzma" });	
			obj.pipe(lzma()).pipe(_res);
	    });
	}

	if (file_type == "geojson" || file_type == "json") {
		res.writeHead(200, {"Content-Type": "application/json"});
		var obj = fs.createReadStream(filepath);
		obj.pipe(res);	
	}

});


var server = app.listen(8095, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
