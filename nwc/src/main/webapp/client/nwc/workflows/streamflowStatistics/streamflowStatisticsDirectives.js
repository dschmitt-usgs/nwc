/*global angular SCE */
(function () {
    var streamflowStatistics = angular.module('nwc.directives.streamflowStatistics', ['nwc.sharedStateServices', 'nwc.plotter', 'nwc.conversion']);
    streamflowStatistics.directive('plotData', ['CommonState', 'StoredState', 'Plotter', 'Units',
        function(CommonState, StoredState, Plotter, Units) {
            var plotDivSelector = '#modeledQPlot';
            var legendDivSelector = '#modeledQLegend';
            var plotTimeDensity  = 'daily';
            var measurementSystem = 'usCustomary';

            /**
             * {String} category the category of data to plot (daily or monthly)
             */
            var plotModeledQ = function(){
                var values = CommonState.ModeledHucDataSeries.getDataAs(measurementSystem, "streamflow");
                var labels = CommonState.ModeledHucDataSeries.getSeriesLabelsAs(
                        measurementSystem, "streamflow", plotTimeDensity);
                var ylabel = Units[measurementSystem].streamflow[plotTimeDensity];
                var title = "Modeled Streamflow for the " + StoredState.streamFlowStatHucFeature.data.HU_12_NAME + " Watershed.";
                Plotter.getPlot(plotDivSelector, legendDivSelector, values, labels, ylabel, title);
            };

            var buildName = function(selectionName, selectionId, series) {
                var filename = selectionName;
                filename += '_' + selectionId;
                filename += '_' + series;
                filename += '.csv';
                filename = filename.replace(/ /g, '_');
                filename = escape(filename);
                return filename;
            };

            return {
                restrict: 'E',
                link: function(scope, element, attrs) {
                    var getFilename = function (series) {
                        var filename = 'data.csv';
                        if (StoredState.streamFlowStatHucFeature) {
                            filename = buildName(StoredState.streamFlowStatHucFeature.data.HU_12_NAME,
                                StoredState.streamFlowStatHucFeature.data.HUC12, series);
                        }
                        return filename;
                    };

                    scope.getFilename = getFilename;

                    scope.$watch('CommonState.newModeledHucData', function(newValue, oldValue){
                        if(newValue){
                            CommonState.newModeledHucData = false;
                            plotModeledQ(scope);
                        }
                    });
                    
                    scope.$watch('CommonState.showStreamflowPlot', function(newValue, oldValue) {
                        if (newValue) {
                            plotModeledQ(scope);
                        }
                    });
                },
                templateUrl: '../client/nwc/workflows/streamflowStatistics/plotData.html'
            };
        }]);
    streamflowStatistics.directive('downloadStatistics', ['CommonState', 'StoredState',
        function(CommonState, StoredState) {

            var buildStatisticsName = function(selectionName, selectionId) {
                var filename = selectionName;
                filename += selectionId;
                filename += '.tsv';
                filename = escape(filename);
                return filename;
            };

            return {
                restrict: 'E',
                link: function(scope, element, attrs) {
                    var getStatisticsFilename = function () {
                        var filename = 'data.csv';
                        if (StoredState.gage) {
                            filename = buildStatisticsName('eflowstats_NWIS_', StoredState.gage.data.STAID);
                        }
                        else if (StoredState.streamFlowStatHucFeature) {
                            filename = buildStatisticsName('eflowstats_HUC_', StoredState.streamFlowStatHucFeature.data.HUC12);
                        }
                        return filename;
                    };

                    scope.getStatisticsFilename = getStatisticsFilename;
                },
                templateUrl: '../client/nwc/workflows/streamflowStatistics/downloadStatistics.html'
            };
        }]);
}());