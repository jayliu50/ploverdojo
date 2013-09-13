/* Controllers */

angular.module('ploverdojo.wordexplorer', ['ploverdojo.services'])
    .controller('WordExplorerCtrl', ['$scope', 'ControllerSyncService', 'StenoService',
        function (sc, controllerSyncService, stenoService) {

            var KeyStateEnum = {
                None: 0,
                Include: 1,
                Required: 2
            };

            var KeyStateLookup = {
                0: 'None',
                1: 'Include',
                2: 'Required'
            };

            sc.wordFilter = {}; // the object representing the filter for the dictionary

            var filter = {};

            sc.init = function() {
                updateFilter();
            }

            sc.buildParamStrings = function () {
                filter.include = '';
                filter.require = '';

                var includeParamStringShouldPrepend = true;
                var requiredParamStringShouldPrepend = true;


                var testExistenceInFilter = function (key, code, isLeftHand) {
                    if (sc.wordFilter.hasOwnProperty(key)) {
                        if (sc.wordFilter[key] === KeyStateEnum.Include) {
                            filter.include += code;

                            if (isLeftHand) {
                                includeParamStringShouldPrepend = false;
                            }
                        }
                        else if (sc.wordFilter[key] === KeyStateEnum.Required) {
                            filter.include += code;
                            filter.require += code;

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

                if (includeParamStringShouldPrepend && filter.include !== '') {
                    filter.include = '-' + filter.include;
                }

                if (requiredParamStringShouldPrepend && filter.require !== '') {
                    filter.require = '-' + filter.require;
                }

                filter.title = "Custom";
                delete filter.index;

                controllerSyncService.updateCurrentFilter(filter);
            };

            var updateFilter = function () {
                filter = controllerSyncService.currentFilter;

                // update UI keyboard
                sc.wordFilter = [];
                var keys = [];
                keys = stenoService.expandBrief(filter.include);
                for (var i = 0; i < keys.length; i++) {
                    sc.wordFilter[keys[i]] = KeyStateEnum.Include;

                }

                keys = stenoService.expandBrief(filter.require);
                for (var j = 0; j < keys.length; j++) {
                    sc.wordFilter[keys[j]] = KeyStateEnum.Required;
                }
            };

            sc.$on('updateFilter', updateFilter);

            sc.customMode = false;
            sc.asterisk = false;

            sc.toggle = function (code) {

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




