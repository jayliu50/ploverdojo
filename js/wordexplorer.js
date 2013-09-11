'use strict';

$(document).ready(function () {

//    $(".steno-key").click(function (something) {
//        alert('here: ' + something);
//    });


});

// Declare app level module which depends on filters, and services
angular.module('ploverdojo', ['ploverdojo.controllers', 'ploverdojo.services', 'ploverdojo.directives'])
    .config(function ($interpolateProvider) {
        $interpolateProvider.startSymbol('//');
        $interpolateProvider.endSymbol('//');
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

angular.module('ploverdojo.controllers', ['ploverdojo.wordexplorer', 'ploverdojo.lessonbrowser']);


/* Controllers */

angular.module('ploverdojo.wordexplorer', ['ploverdojo.services'])
    .controller('WordExplorerCtrl', ['$scope', 'WordService', 'UserDataService', 'StenoService',
        function (sc, wordService, userDataService, stenoService) {

            var KeyStateEnum = {
                'None': 0,
                'Include': 1,
                'Required': 2
            };

            var KeyStateLookup = {
                0: 'None',
                1: 'Include',
                2: 'Required'
            };

            sc.wordFilter = {}; // the object representing the filter for the dictionary
            var includeParamString = '';
            var requiredParamString = '';

            sc.words = []; //  {'value': 'my word', 'stroke': 'STROKE', 'mastery': 0}
            sc.busy = false;

            sc.queryString = function () {
                var queryString = 'keys=' + includeParamString;

                if (requiredParamString !== '') {
                    queryString += '&require=' + requiredParamString;
                }

                return queryString;
            };

            sc.runQuery = function () {
                wordService(sc.queryString(), sc);
            };

            sc.buildParamStrings = function () {
                includeParamString = '';
                requiredParamString = '';

                var includeParamStringShouldPrepend = true;
                var requiredParamStringShouldPrepend = true;


                var testExistenceInFilter = function (key, code, isLeftHand) {
                    if (sc.wordFilter.hasOwnProperty(key)) {
                        if (sc.wordFilter[key] === KeyStateEnum.Include) {
                            includeParamString += code;

                            if (isLeftHand) {
                                includeParamStringShouldPrepend = false;
                            }
                        }
                        else if (sc.wordFilter[key] === KeyStateEnum.Required) {
                            includeParamString += code;
                            requiredParamString += code;

                            if (isLeftHand) {
                                requiredParamStringShouldPrepend = false;
                            }
                        }
                    }
                };

                // build parameter string

                testExistenceInFilter('S-', 'S', true);
                testExistenceInFilter('T-', 'T', true);
                testExistenceInFilter('K-', 'K', true);
                testExistenceInFilter('P-', 'P', true);
                testExistenceInFilter('W-', 'W', true);
                testExistenceInFilter('H-', 'H', true);
                testExistenceInFilter('R-', 'R', true);
                testExistenceInFilter('A-', 'A', true);
                testExistenceInFilter('O-', 'O', true);
                testExistenceInFilter('*', '*', true);
                testExistenceInFilter('-E', 'E', true);
                testExistenceInFilter('-U', 'U', true);

                testExistenceInFilter('-F', 'F', false);
                testExistenceInFilter('-R', 'R', false);
                testExistenceInFilter('-P', 'P', false);
                testExistenceInFilter('-B', 'B', false);
                testExistenceInFilter('-L', 'L', false);
                testExistenceInFilter('-G', 'G', false);
                testExistenceInFilter('-T', 'T', false);
                testExistenceInFilter('-S', 'S', false);
                testExistenceInFilter('-D', 'D', false);
                testExistenceInFilter('-Z', 'Z', false);

                if (includeParamStringShouldPrepend && includeParamString !== '') {
                    includeParamString = '-' + includeParamString;
                }

                if (requiredParamStringShouldPrepend && requiredParamString !== '') {
                    requiredParamString = '-' + requiredParamString;
                }
            };

            sc.$on('updateLesson', function () {
                includeParamString = userDataService.currentLesson.include;
                requiredParamString = userDataService.currentLesson.require;

                // update UI keyboard
                sc.wordFilter = [];
                var keys = [];
                keys = stenoService.expandBrief(includeParamString);
                for (var i = 0; i < keys.length; i++) {
                    sc.wordFilter[keys[i]] = KeyStateEnum.Include;

                }

                keys = stenoService.expandBrief(requiredParamString);
                for (var i = 0; i < keys.length; i++) {
                    sc.wordFilter[keys[i]] = KeyStateEnum.Required;
                }

                sc.runQuery();
            });

            sc.customMode = true;
            sc.asterisk = false;

            sc.$on('updateCustomMode', function () {
                sc.customMode = userDataService.customMode;
            });

            sc.toggle = function (code) {

                if (!sc.customMode) {
                    return;
                }

                if (sc.wordFilter.hasOwnProperty(code)) {
                    switch (sc.wordFilter[code]) {
                        case KeyStateEnum.None:
                            sc.wordFilter[code] = KeyStateEnum.Include;
                            break;
                        case KeyStateEnum.Include:
                            sc.wordFilter[code] = KeyStateEnum.Required;
                            break;
                        default:
                            sc.wordFilter[code] = KeyStateEnum.None;
                    }

                }
                else {
                    sc.wordFilter[code] = KeyStateEnum.Include;
                }


                sc.buildParamStrings();
            };

            sc.clear = function (codes) {
                for (var i = 0; i < codes.length; i++) {
                    sc.wordFilter[codes[i]] = KeyStateEnum.None;
                }
                sc.buildParamStrings();
            };

            sc.include = function (codes) {
                for (var i = 0; i < codes.length; i++) {
                    sc.wordFilter[codes[i]] = KeyStateEnum.Include;
                }
                sc.buildParamStrings();
            };

            sc.require = function (codes) {
                for (var i = 0; i < codes.length; i++) {
                    sc.wordFilter[codes[i]] = KeyStateEnum.Required;
                }
                sc.buildParamStrings();
            };

            sc.title = function (code) {
                if (sc.wordFilter.hasOwnProperty(code)) {
                    return KeyStateLookup[sc.wordFilter[code]];
                }
                else {
                    return KeyStateLookup[0];
                }
            };

            sc.class = function (code) {
                if (sc.wordFilter.hasOwnProperty(code)) {
                    return sc.wordFilter[code];
                }
                else {
                    return KeyStateEnum.None;
                }
            };


        }
    ])
;




