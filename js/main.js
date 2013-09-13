'use strict';

$(document).ready(function () {

//    $(".steno-key").click(function (something) {
//        alert('here: ' + something);
//    });


});

// Declare app level module which depends on filters, and services
angular.module('ploverdojo', ['ploverdojo.controllers', 'ploverdojo.services', 'ploverdojo.directives', 'ngCookies', 'joyride.ng'])
    .config(function ($interpolateProvider) {
        $interpolateProvider.startSymbol('~{');
        $interpolateProvider.endSymbol('}~');
        //$routeProvider.when("/filter",  {controller:MainCtrl});
    });

angular.module('ploverdojo.directives', [])
    .directive('stenokey', function () {
        return {
            restrict: 'E',
            scope: {}, // do not share scope with other stenokey objects
            template: '<a href="" ><div class="// class //" id="// id //" ng-transclude></div></a>',
            controller: function ($scope) {

            },
            link: function (scope, element, attrs) {
                element.addClass(attrs[key]);
            }
        };
    })
;

angular.module('ploverdojo.controllers', ['ploverdojo.lessonbrowser', 'ploverdojo.wordexplorer', 'ngCookies'])
    .controller('MainCtrl', ['$scope', '$cookies', 'ControllerSyncService', 'UserDataService', 'WordService',
        function (sc, cookies, controllerSyncService, userDataService, wordService) {

            sc.filter = {};


            sc.init = function () {
                var stuff = userDataService.getSettings(function (data, status, headers, config) {
                    sc.limit = data.quiz_size;
                });
            };

            sc.busy = false;

            sc.saveSettings = function () {
                userDataService.updateSettings({ quiz_size: sc.limit });
            };

            sc.words = []; //  {'word': 'my word', 'stroke': 'STROKE', 'mastery': 0}


            var WordSourceEnum = {
                Filter: 0,
                History: 1
            };

            sc.wordSource = WordSourceEnum.Filter;

            var queryString = function () {

                var queryString = '';
                if (sc.filter.include) {

                    queryString = 'keys=' + sc.filter.include;

                    if (sc.filter.require !== '') {
                        queryString += '&require=' + sc.filter.require;
                    }
                }
                return queryString;
            };

            sc.$on('updateFilter', function () {

                sc.busy = true;
                sc.words = [];

                sc.filter = controllerSyncService.currentFilter;
                wordService.populateWordsFromFilter(queryString(controllerSyncService.currentFilter), function (data) {
                    sc.words = data;
                    sc.busy = false;
                });


                cookies.currentFilter = JSON.stringify(controllerSyncService.currentFilter);

            });

            sc.loadRecent = function () {
                sc.busy = true;
                sc.words = [];
                sc.filter = {title: 'recent'};
                wordService.populateWordsFromRecent(sc);
                sc.busy = false;
                sc.wordSource = WordSourceEnum.History;
            };


            sc.limit = 10;

            sc.practice = function () {

                var testdata = [];

                if (sc.wordSource === WordSourceEnum.Filter) {
                    // which words will be the ones that get sent? Well, let's favored the ones that have not been mastered
                    // we'll also favor the ones with higher frequency ranking


                    var masteredTestData = [];

                    // convert to testdata format
                    sc.words.forEach(function (thisWord) {

                        var d = [];
                        d[0] = thisWord.word;
                        d[1] = thisWord.stroke;
                        d[2] = thisWord.ranking;

                        if (thisWord.mastery === 100) {
                            masteredTestData.push(d);
                        }
                        else {
                            testdata.push(d);
                        }

                    });

                    var sortFn = function (a, b) {
                        return a[2] - b[2];
                    };

                    testdata.sort(sortFn);
                    masteredTestData.sort(sortFn);


                    while (testdata.length < sc.limit && masteredTestData.length > 0) {
                        var mastered = masteredTestData.pop();
                        if (mastered) {
                            testdata.push(mastered);
                        }
                    }
                    userDataService.updateFilterHistory(controllerSyncService.currentFilter);
                }

                else if (sc.wordSource === WordSourceEnum.History) {
                    sc.words.forEach(function (thisWord) {
                        var d = [];
                        d[0] = thisWord.word;
                        d[1] = thisWord.stroke;
                        d[2] = thisWord.ranking;

                        testdata.push(d);

                    });
                }

                var send = testdata.splice(0, sc.limit);
                send.forEach(function (element) {
                    element.splice(2, 1);
                });
                cookies.testdata = JSON.stringify(send);
                cookies.quiz_mode = 'WORD';

                window.location.href = '/quiz?mode=word';
            };

            sc.$on('updateWordList', function () {
                sc.words = controllerSyncService.words;
            });

            sc.joyride = function () {

                return 'data-joyride';
            };

        }]);
