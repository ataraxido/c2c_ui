import config from '@/js/config.js'

import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

import {get as getProjection} from 'ol/proj';
import {getWidth} from 'ol/extent';

function createSwisstopoLayer(layer, format = 'jpeg', time = 'current') {
    return new TileLayer({
        title: 'swisstopo',
        type: 'base',
        visible: false,
        source: new XYZ({
            attributions: [
                '<a target="_blank" href="http://www.swisstopo.admin.ch">swisstopo</a>',
            ],
            urls: ['10', '11', '12', '13', '14'].map(i => {
                return `https://wmts${i}.geo.admin.ch/1.0.0/${layer}/default/${time}/3857/{z}/{x}/{y}.${format}`;
            }),
            maxZoom: 17
        })
    })
}


function createIgnSource(layer, format = 'jpeg') {
    const resolutions = [];
    const matrixIds = [];
    const proj3857 = getProjection('EPSG:3857');
    const maxResolution = getWidth(proj3857.getExtent()) / 256;

    for (let i = 0; i < 18; i++) {
        matrixIds[i] = i.toString();
        resolutions[i] = maxResolution / Math.pow(2, i);
    }

    const tileGrid = new WMTSTileGrid({
        origin: [-20037508, 20037508],
        resolutions: resolutions,
        matrixIds: matrixIds
    });

    var source = new WMTS({
        url: '//wxs.ign.fr/' + config.ignApiKey + '/wmts',
        layer: layer,
        matrixSet: 'PM',
        format: `image/${format}`,
        projection: 'EPSG:3857',
        tileGrid: tileGrid,
        style: 'normal',
        attributions: [
            '<a href="http://www.geoportail.fr/" target="_blank">' +
            '<img src="//api.ign.fr/geoportail/api/js/latest/' +
            'theme/geoportal/img/logo_gp.gif"></a>'
        ]
    })

    return new TileLayer({
        title: 'IGN maps',
        type: 'base',
        visible: false,
        source: source,
    })
}


var esri = new TileLayer({
    title: 'Esri',
    type: 'base',
    visible: true,
    source: new XYZ({
        url:
            'https://server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/' +
            'WMTS?layer=World_Topo_Map&style=default&tilematrixset=GoogleMapsCompatible&' +
            'Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&' +
            'TileMatrix={z}&TileCol={x}&TileRow={y}',
        attributions : [
            '<a href="https://www.arcgis.com/home/item.html?id=30e5fe3149c34df1ba922e6f5bbf808f"' +
            ' target="_blank">Esri</a>'
        ]
    })
})

var openStreetMap = new TileLayer({
    title: 'OpenStreetMap',
    source: new OSM(),
    visible: false,
})

var openTopoMap = new TileLayer({
    title: 'OpenTopoMap',
    type: 'base',
    visible: false,
    source: new XYZ({
        url: '//{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attributions :
            '© <a href="//openstreetmap.org/copyright">OpenStreetMap</a> | ' +
            '© <a href="//opentopomap.org" target="_blank">OpenTopoMap</a>'
    })
})

var ign_maps = createIgnSource('GEOGRAPHICALGRIDSYSTEMS.MAPS');

var swissTopo = createSwisstopoLayer('ch.swisstopo.pixelkarte-farbe')

export default [esri, openStreetMap, openTopoMap, swissTopo, ign_maps]
