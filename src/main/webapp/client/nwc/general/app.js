/*global angular*/
var nwcApp = angular.module('nwcApp', [
    'nwc.sharedStateServices',
    'nwc.util',
    'nwc.watch',
    'nwc.dataSeriesStore',
    'nwc.sosSources',
    'nwc.sosResponseParser',
    'nwc.controllers.waterBudget',
    'nwc.controllers.aquaticBiology',
    'nwc.controllers.streamflowStatistics',
    'ui.router',
    'ui.bootstrap',
    'nwc.waterBudgetPlot',
    'nwc.waterUsageChart',
    'nwc.map.base',
    'nwc.map.waterBudget',
    'nwc.map.aquaticBiology',
    'nwc.map.streamflow',
    'checklist-model'
]);

nwcApp.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/workflow/aquatic-biology/select-biodata-site');
        var clientBasePath = '../../client/nwc/';
        var workflowsBasePath = clientBasePath + 'workflows/';
        var generalBasePath = clientBasePath + 'general/partials/';
        $stateProvider
            .state('restore', {
                url: '/state/restore/:stateId',
                templateUrl: generalBasePath + 'Restoring.html',
                controller: 'Restore'
            })
            .state('workflow', {
                url: '/workflow',
                templateUrl: workflowsBasePath + 'AllWorkflowShell.html',
                abstract: true
            });
        var waterBudgetBasePath = workflowsBasePath + 'waterBudget/';
        $stateProvider
            .state('workflow.waterBudget', {
                url: '/water-budget',
                templateUrl: waterBudgetBasePath + 'waterBudgetTemplate.html',
                controller: 'WaterBudget'
            })
            .state('workflow.waterBudget.selectHuc', {
                url: '/select-huc',
                templateUrl: waterBudgetBasePath + 'selectHuc.html',
                controller: 'SelectHuc'
            })
            .state('workflow.waterBudget.disambiguateClick', {
                url: '/disambiguate-click',
                templateUrl: waterBudgetBasePath + 'disambiguateClick.html',
                controller: 'DisambiguateClick'
            })
            .state('workflow.waterBudget.plotData', {
                url: '/plot-data',
                templateUrl: waterBudgetBasePath + 'plotData.html',
                controller: 'PlotData'
            })
            .state('workflow.waterBudget.selectCounty', {
                url: '/plot-data',
                templateUrl: waterBudgetBasePath + 'selectHuc.html',
                controller: 'SelectCounty'
            });
            var bioBasePath = workflowsBasePath + 'aquaticBiology/';
            $stateProvider
                .state('workflow.aquaticBiology', {
                    url: '/aquatic-biology',
                    templateUrl: bioBasePath + 'aquaticBiologyTemplate.html',
                    controller: 'AquaticBiology'
                })
                .state('workflow.aquaticBiology.selectBioDataSites', {
                    url: '/select-biodata-site',
                    templateUrl: bioBasePath + 'selectBioDataSite.html',
                    controller: 'SelectBioDataSite'
                })
                .state('workflow.aquaticBiology.showSelectedBioDataSites', {
                    url: '/show-selected-biodata-sites',
                    templateUrl: bioBasePath + 'showSelectedBioDataSites.html',
                    controller: 'ShowSelectedBioDataSites'
                })
                .state('workflow.aquaticBiology.sendToBioData', {
                    url: '/send-to-biodata',
                    templateUrl: bioBasePath + 'sendToBioData.html',
                    controller: 'SendToBioData'
                })
                .state('workflow.waterBudget.FinalStep', {
                    url: '/final',
                    templateUrl: bioBasePath + 'FinalWaterBudget.html',
                    controller: 'FinalStep'
                });
            var streamStatsBasePath = workflowsBasePath + 'streamflowStatistics/';
                $stateProvider.state('workflow.streamflowStatistics', {
                    url: '/streamflow-statistics',
                    templateUrl: streamStatsBasePath + 'streamflowStatisticsTemplate.html',
                    controller: 'StreamflowStatistics'
                })
                .state('workflow.streamflowStatistics.selectSite', {
                    url: '/select-site',
                    templateUrl: streamStatsBasePath + 'selectSite.html',
                    controller: 'SelectSite'
                })
                .state('workflow.streamflowStatistics.disambiguateGages', {
                    url: '/disambiguate-gages',
                    templateUrl: streamStatsBasePath + 'disambiguateGages.html',
                    controller: 'DisambiguateGages'
                })
                .state('workflow.streamflowStatistics.setSiteStatisticsParameters', {
                    url: '/set-site-statistics-parameters',
                    templateUrl: streamStatsBasePath + 'setSiteStatisticsParameters.html',
                    controller: 'SetSiteStatisticsParameters'
                })
                .state('workflow.streamflowStatistics.displayStatistics', {
                    url: '/display-statistics',
                    templateUrl: streamStatsBasePath + 'displayStatistics.html',
                    controller: 'DisplayStatistics'
                });
    }
]);
