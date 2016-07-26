/* Author: Manikanta, K S Rajan */
/**
 * lsiviewer.js : This file has the methods that control the canvas and add styling to it.
 * load(function) : 
 *    loads geojson
 *    create canvas and add event listeners  
 *      InitJson 
      @returns:  
 */
/* Global Variables Declaration */
/* Related to Canvas */
/* Main Code  */

var map, VectorLayer=null, VectorSource = null, canvasWidth=window.innerWidth, canvasHeight=window.innerHeight;

window.onload = function() {
    /**
     *  We must not show canvas background color (Color paletter that used while exporting) without selecting color as an option. Therefore hide it in the initial load.
     **/
    console.log("Window.onload called = ");
    addImageOnCanvas('./assets/img/upload_files.jpg')
};

function addImageOnCanvas(url) {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    var imageObj = new Image();

    imageObj.onload = function() {
        context.drawImage(imageObj, canvasWidth/2 - imageObj.width/2, canvasHeight/2 - imageObj.height);
    };
    imageObj.src = url;
}


function submitForm() {
    console.log("submitForm in wms is called..");
    var dynamic_canvas = $('canvas');
    if(dynamic_canvas) dynamic_canvas.remove();
    var options = {
        url: '/uploadFiles',
        success: function(response) {
            $("#upload_form")[0].reset();
            $('#uploadModal').modal('hide');
            createMap(response);
        },
        error: function(response) {
            clearCanvas();
            $('#uploadModal').modal('hide');
            addImageOnCanvas('./assets/img/error_page.jpg');
        }
    };

    $('#upload_form').submit(function(e) { //Ajax Submit form   
        e.preventDefault();
        e.stopImmediatePropagation();
        $(this).ajaxSubmit(options);
        return false;
    });

}

function createVectorLayer(geojson) {
    var myStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255,100,50,0.5)'
        })
    });
    var features = new ol.format.GeoJSON().readFeatures(geojson, {
        featureProjection: 'EPSG:3857'
    });

    VectorSource = new ol.source.Vector({
            features: features,
            defaultProjection: 'EPSG:4326',
            projection: 'EPSG:3857',
            style: myStyle,
            format: new ol.format.GeoJSON()
    });

    return VectorSource;
}


var image = new ol.style.Circle({
    radius: 5,
    fill: null,
    stroke: new ol.style.Stroke({
        color: 'red',
        width: 1
    })
});

var styles = {
    'Point': new ol.style.Style({
        image: image
    }),
    'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'green',
            width: 3
        })
    }),
    'MultiLineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'green',
            width: 3
        })
    }),
    'MultiPoint': new ol.style.Style({
        image: image
    }),
    'MultiPolygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'yellow',
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 0, 0.1)'
        })
    }),
    'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'blue',
            lineDash: [4],
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.1)'
        })
    }),
    'GeometryCollection': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'magenta',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'magenta'
        }),
        image: new ol.style.Circle({
            radius: 10,
            fill: null,
            stroke: new ol.style.Stroke({
                color: 'magenta'
            })
        })
    }),
    'Circle': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.2)'
        })
    })
};

var styleFunction = function(feature) {
    return styles[feature.getGeometry().getType()];
};


function createMap(geojson) {

    console.log("Data passed to this function");

    if (VectorLayer != null) {
        map.removeLayer(VectorLayer);
    }

    VectorSource = createVectorLayer(geojson);
    

    VectorLayer = new ol.layer.Vector({
        title: 'GeoJson Layer',
        source: VectorSource
    });

    map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            VectorLayer
        ],
        target: 'map',
        controls: ol.control.defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
            })
        }).extend([
                new ol.control.ZoomSlider(),
                new ol.control.OverviewMap(),
                new ol.control.ScaleLine(),
                new ol.control.FullScreen(),
                new ol.control.MousePosition({
                    coordinateFormat: ol.coordinate.createStringXY(4),
                    projection: 'EPSG:4326'
                })
            ]),
        interactions: ol.interaction.defaults().extend([
                new ol.interaction.Select({
                    condition: ol.events.condition.mouseMove
                })
            ]),
        view: new ol.View({
            center: [0, 0],
            zoom: 2
        })
    });


    map.getView().fit(VectorSource.getExtent(), map.getSize());

    console.log('VectorLayer.getSource().getExtent() = ' + VectorLayer.getSource().getExtent());
    var exportPNGElement = document.getElementById('export-png');

    if ('download' in exportPNGElement) {
        exportPNGElement.addEventListener('click', function(e) {
            map.once('postcompose', function(event) {
                var canvas = event.context.canvas;
                exportPNGElement.href = canvas.toDataURL('image/png');
            });
            map.renderSync();
        }, false);
    } else {
        var info = document.getElementById('no-download');
        /**
         * display error message
         */
        info.style.display = '';
    }

}