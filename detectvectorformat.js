// Necessary for file validation 
	var MIME_TYPES = {
		'shapefile' : ['shp', 'shx', 'dbf'],
		'gpx' : ['gpx'],
		'kml' : ['kml'],
		'geojson' : ['geojson'], //geojson,
		'json' : ['json'],
		'gml' : ['gml']
	}

var detectvectorformat = {
	
	validate_uploaded_files : function (request) {
		// This variable will keep track of file format information 
		var file_type = null, filename = null;
		var self = this;
		// Iterate through mime files and return true/false
		for (var itr=0; itr < request.files.length; itr++) {
			var extracted_mime_type = this.extract_mime_type(request.files[itr].originalname);
			filename = request.files[itr].originalname.replace("."+extracted_mime_type, "");
			if (extracted_mime_type == null) {
				//catch exception in parent 
				console.log('extracted type is null with originalname = ' + request.files[itr].originalname);
				return null;
			}
			for (var key in MIME_TYPES) {
				if (MIME_TYPES[key].indexOf(extracted_mime_type) != -1) {
					file_type = key;
				}
			}
		}

		if (file_type == null) {
			// catch exception in parent, says files are not valid
			console.log('file type is null');
			return {file_type : null, file_name : filename};
		}
		else {
			return {file_type : file_type, file_name : filename};
		}
    },

    extract_mime_type : function(filename) {
		if (filename == '' || filename == undefined) {
			return null;
		}
		var mimetype = null;
		if (filename.split('.').length >= 2) {
			mimetype = filename.split('.').pop();
		}
		if (mimetype != null) {
			return mimetype;
		}
		else {
			return null;
		}
	}
}
module.exports = detectvectorformat;
