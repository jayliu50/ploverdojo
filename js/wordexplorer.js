'use strict';

$(document).ready(function () {

//    $(".steno-key").click(function (something) {
//        alert('here: ' + something);
//    });


});

// Declare app level module which depends on filters, and services
angular.module('ploverdojo', ['ploverdojo.controllers'])
    .config(function ($interpolateProvider) {
        $interpolateProvider.startSymbol('//');
        $interpolateProvider.endSymbol('//');
    });


//    .
//    config(['$routeProvider', function ($routeProvider) {
//        $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
//        $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
//        $routeProvider.otherwise({redirectTo: '/view1'});
//    }])

/* Controllers */

angular.module('ploverdojo.controllers', []).
    controller('WordExplorerCtrl', ['$scope', '$http',
        function (sc, http) {

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

            sc.filter = {}; // the object representing the filter for the dictionary

            sc.words = []; //  {'value': 'my word', 'stroke': 'STROKE', 'mastery': 0}

            var includeParamString = '';
            var requiredParamString = '';

            var busy = false;

            sc.status = function () {
                if (!sc.words.length) {
                    if (!busy) {
                        return "No matches found.";
                    }
                    else
                        return "Please wait.";
                }
                return "";
            }

            sc.runQuery = function () {
                var wordService = function (include, required) {

                    var getString = 'disciple/dictionary?keys=' + include;

                    if (required !== '') {
                        getString += '&require=' + required;
                    }

                    busy = true;

                    http({method: 'GET', url: getString }).
                        success(function (data, status, headers, config) {
                            sc.words = data;
                            busy = false;
                        }).
                        error(function (data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            busy = false;
                        });

                };


                sc.words = wordService(includeParamString, requiredParamString);
            };

            sc.updateWords = function () {
                includeParamString = '';
                requiredParamString = '';

                var includeParamStringShouldPrepend = true;
                var requiredParamStringShouldPrepend = true;


                var testExistenceInFilter = function (key, code, isLeftHand) {
                    if (sc.filter.hasOwnProperty(key)) {
                        if (sc.filter[key] === KeyStateEnum.Include) {
                            includeParamString += code;

                            if (isLeftHand) {
                                includeParamStringShouldPrepend = false;
                            }
                        }
                        else if (sc.filter[key] === KeyStateEnum.Required) {
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

            sc.toggle = function (code) {
                if (sc.filter.hasOwnProperty(code)) {
                    switch (sc.filter[code]) {
                        case KeyStateEnum.None:
                            sc.filter[code] = KeyStateEnum.Include;
                            break;
                        case KeyStateEnum.Include:
                            sc.filter[code] = KeyStateEnum.Required;
                            break;
                        default:
                            sc.filter[code] = KeyStateEnum.None;
                    }

                }
                else {
                    sc.filter[code] = KeyStateEnum.Include;
                }


                sc.updateWords();
            };

            sc.clear = function (codes) {
                for(var i=0; i < codes.length; i++){
                    sc.filter[codes[i]] = KeyStateEnum.None;
                }
                sc.updateWords();
            };

            sc.include = function (codes) {
                for(var i=0; i < codes.length; i++){
                    sc.filter[codes[i]] = KeyStateEnum.Include;
                }
                sc.updateWords();
            };

            sc.require = function (codes) {
                for(var i=0; i < codes.length; i++){
                    sc.filter[codes[i]] = KeyStateEnum.Required;
                }
                sc.updateWords();
            };



            sc.title = function (code) {
                if (sc.filter.hasOwnProperty(code)) {
                    return KeyStateLookup[sc.filter[code]];
                }
                else {
                    return KeyStateLookup[0];
                }
            };

            sc.class = function (code) {
                if (sc.filter.hasOwnProperty(code)) {
                    return sc.filter[code];
                }
                else {
                    return KeyStateEnum.None;
                }
            };

        }

    ]);