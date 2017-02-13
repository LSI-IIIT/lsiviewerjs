#  LSIViewer 2.0

- A client oriented online viewer for Geospatial vector data which is at http://lsi.iiit.ac.in/lsiviewer 
- This repository has source code written in javascript, html and css.  
![alt tag](https://s31.postimg.org/x0jc5ygi3/Roads_In_Australia.png)

## Highlights :
- An installation-free, platform-independent online application to view spatial vector data anytime
- Major rendering happens solely on client
- Redering speeds are compared to a Desktop GIS application
- Released as Open source 

## How to run?

###Requirements :

Make sure node js(v5 or newer) libraries are installed or 
* For node js installation - 
** curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
** sudo apt-get install nodejs 
* For node-gyp installation - sudo npm install -g node-gyp
* To check node js version : node --verison 

###Commands : 
+ npm install 
+ node server.js 
	

## Instructions:
- Open http://localhost:8095 in browser 
- Open Simple Data Viewer(http://localhost:8095/lsiviewer) and upload spatial vector data(in any of the formats GPX, GeoJSON, KML, GML, GeoJSON) 
- GIS abilities: Zoom, Pan, User-defined styling and Export are available on the toolbar 
- Open WMS viewer(http://localhost:8095/wmsviewer) and upload your data 
- Zoom and Export 

### Roads of South Africa viewed on both SimpleDataViewer and WMSViewer 
![alt tag](https://s4.postimg.org/oz6nxzgi5/lsiviewer_sds_wms.jpg)

