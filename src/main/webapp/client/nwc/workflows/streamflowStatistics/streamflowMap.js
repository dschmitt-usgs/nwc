/*global angular,OpenLayers,CONFIG*/
(function () {
    var streamflowMap = angular.module('nwc.map.streamflow', ['nwc.util']);
    streamflowMap.factory('StreamflowMap', ['StoredState', 'CommonState', '$state', 'BaseMap', '$log', 'util',
        function (StoredState, CommonState, $state, BaseMap, $log, util) {
            var map;
            
            var initMap = function () {
                var mapLayers = [];
                var initialControls = [];
                
                // ////////////////////////////////////////////// FLOWLINES
                var flowlinesData = new OpenLayers.Layer.FlowlinesData(
                        "Flowline WMS (Data)",
                        CONFIG.endpoint.geoserver + 'gwc/service/wms'
                );
                flowlinesData.id = 'nhd-flowlines-data-layer';

                var flowlineRaster = new OpenLayers.Layer.FlowlinesRaster({
                    name: "NHD Flowlines",
                    dataLayer: flowlinesData,
                    streamOrderClipValue: 0,
                    displayInLayerSwitcher: false
                });
                flowlineRaster.id = 'nhd-flowlines-raster-layer';
                
                // ////////////////////////////////////////////// GAGES
                var gageFeatureLayer = new OpenLayers.Layer.WMS(
                    "Gage Location",
                    CONFIG.endpoint.geoserver + 'NWC/wms',
                    {
                        LAYERS: 'NWC:gagesII',
                        STYLES: 'blue_circle',
                        format: 'image/png',
                        transparent: true,
                        tiled: true
                    },
                    {
                        isBaseLayer: false,
                        displayInLayerSwitcher: false
                    }
                );

                gageFeatureLayer.id = 'gage-feature-layer';

                var hucLayerOptions = BaseMap.getWorkflowLayerOptions();
                hucLayerOptions.visibility = false;

                var hucLayer = new OpenLayers.Layer.WMS("National WBD Snapshot",
                    CONFIG.endpoint.geoserver + 'gwc/service/wms',
                    {
                        layers: 'NWC:huc12_SE_Basins_v2',
                        transparent: true,
                        styles: ['polygon']
                    },
                    hucLayerOptions
                );
                hucLayer.id = 'hucs';
                
                mapLayers.push(hucLayer);
                
                mapLayers.push(gageFeatureLayer);

                mapLayers.push(flowlinesData);
                mapLayers.push(flowlineRaster);   
                
                //var waterCensusToolbar = new OpenLayers.Control.WaterCensusToolbar({});
                //initialControls.push(waterCensusToolbar);
                initialControls.push(new OpenLayers.Control.Navigation({
                    id: 'nwc-navigation'
                }));
                initialControls.push(new OpenLayers.Control.ZoomBox({
                    id: 'nwc-zoom'
                }));
                
                var wmsGetFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
                    id: 'nwc-streamflow-gage-identify-control',
                    title: 'gage-identify-control',
                    hover: false,
                    autoActivate: false,
                    layers: [
                        gageFeatureLayer
                    ],
                    queryVisible: true,
                    output: 'object',
                    drillDown: true,
                    infoFormat: 'application/vnd.ogc.gml',
                    vendorParams: {
                        radius: 5
                    }
                });
                
                var wmsGetFeatureInfoHandler = function(responseObject){
                    if(responseObject.features && responseObject.features.length){
                        //OpenLayers stores the actual features in a weird spot of the response
                        if(responseObject.features[0].features && responseObject.features[0].features.length){
                            var realFeatures = responseObject.features[0].features;
                            realFeatures = realFeatures.map(util.rejectGeometry);
                            CommonState.ambiguousGages = realFeatures;//rare instance in which it is ok to write directly to CommonState; we don't need to enable state restoration for ambiguous clicks
                            $state.go('workflow.streamflowStatistics.disambiguateGages');
                        }
                    }
                };
                
                wmsGetFeatureInfoControl.events.register("getfeatureinfo", {}, wmsGetFeatureInfoHandler);
                initialControls.push(wmsGetFeatureInfoControl);
                
                var hucsGetFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
                    id: 'nwc-streamflow-huc-identify-control',
                    title: 'huc-identify-control',
                    hover: false,
                    layers: [
                        hucLayer
                    ],
                    queryVisible: true,
                    output: 'object',
                    drillDown: true,
                    infoFormat: 'application/vnd.ogc.gml',
                    vendorParams: {
                        radius: 5
                    },
                    autoActivate: false
                });
                
                var minStatDate = new Date('1980/10/01');
                var maxStatDate = new Date('2010/09/29');
                var featureInfoHandler = function (responseObject) {
                    //for some reason the real features are inside an array
                    var actualFeatures = responseObject.features[0].features;
                    actualFeatures = actualFeatures.map(util.rejectGeometry);
                    var hucCount = actualFeatures.length;
                    if (0 === hucCount) {
                        //nothing
                    }
                    else {
                        var sortedFeatures = actualFeatures.sort(function(a, b){
                            return b.data.mi2 - a.data.mi2;
                        });
                        StoredState.streamFlowStatsHuc = sortedFeatures[0];
                        CommonState.streamFlowStatMinDate = minStatDate;
                        CommonState.streamFlowStatMaxDate = maxStatDate;
                        StoredState.siteStatisticsParameters = {};
                        var statisticsParameters = StoredState.siteStatisticsParameters;
                        statisticsParameters.startDate = new Date(minStatDate);
                        statisticsParameters.endDate = new Date(maxStatDate);
                        $state.go('workflow.streamflowStatistics.setSiteStatisticsParameters');
                    }
                };
                hucsGetFeatureInfoControl.events.register("getfeatureinfo", {}, featureInfoHandler);
                initialControls.push(hucsGetFeatureInfoControl);
                
                map = BaseMap.new({
                    layers: mapLayers,
                    controls: initialControls
                });

                map.events.register(
                        'zoomend',
                        map,
                        function () {
                            var zoom = map.zoom;
                            $log.info('Current map zoom: ' + zoom);
                            flowlineRaster.updateFromClipValue(flowlineRaster.getClipValueForZoom(zoom));
                        },
                        true
                );

                var mapZoomForExtent = map.getZoomForExtent(map.extent);
                map.setCenter(map.extent.getCenterLonLat(), mapZoomForExtent);
                flowlineRaster.setStreamOrderClipValues(map.getNumZoomLevels());
                flowlineRaster.updateFromClipValue(flowlineRaster.getClipValueForZoom(map.zoom));
                
                /**
                 * 
                 * @param {String} interest one of 'observed' or 'modeled'
                 */
                map.switchToInterest = function(interest){
                    if('observed' === interest){
                        hucsGetFeatureInfoControl.deactivate();
                        hucLayer.setVisibility(false);
                        StoredState.streamFlowStatsHuc = undefined;
                        
                        gageFeatureLayer.setVisibility(true);
                        flowlineRaster.setVisibility(true);
                        wmsGetFeatureInfoControl.activate();
                    }
                    else if('modeled' === interest){
                        
                        gageFeatureLayer.setVisibility(false);
                        flowlineRaster.setVisibility(false);
                        wmsGetFeatureInfoControl.deactivate();
                        StoredState.gage = undefined;

                        hucLayer.setVisibility(true);
                        hucsGetFeatureInfoControl.activate();

                    }
                    else{
                        throw Error('unknown interest supplied: ' + interest);
                    }
                };
                map.switchGageStyle = function(styleName) {
                    gageFeatureLayer.mergeNewParams({STYLES: styleName});
                };
                return map;
            };
            var getMap = function () {
                if (!map) {
                    initMap();
                }
                return map;
            };
            
            
            
            return {
                initMap: initMap,
                getMap: getMap
            };
        }
    ]);

}());