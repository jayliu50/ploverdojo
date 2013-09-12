angular.module('ploverdojo.services', [])
    .factory('WordService', ['$http', function (http) {

        var wordService = {};


        var mastery = null; // {}
        http({method: 'GET', url: 'disciple/profile/mastery?timestamp=' + new Date().getTime() })
            .success(function (data, status, headers, config) {
                mastery = data;
            })
            .error(function (data, status, headers, config) {
                console.error('getting mastery list for user failed');
            });


        wordService.populateWords = function (queryString, sc) {
            // not sure if I should be using the sc (scope) in here, but I didn't know what else I could do

            sc.busy = true;

            http({method: 'GET', url: 'disciple/dictionary?' + queryString }).
                success(function (data, status, headers, config) {

                    if (mastery !== null) {
                        for (var item in data) {
                            if (mastery.hasOwnProperty(data[item].word)) {
                                data[item].mastery = mastery[data[item].word];
                            }
                        }
                    }

                    sc.words = data;
                    sc.busy = false;
                }).
                error(function (data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    sc.busy = false;
                    console.error('getting custom dictionary failed')
                });
        };

        var commonWords = null;

        // if (!commonWords) {

        http({method: 'GET', url: 'assets/common.json' }).
            success(function (data, status, headers, config) {
                commonWords = data;
            }).
            error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.error('getting common word list failed');
            });
        // }

        wordService.appendWithRanking = function (words) {
            if (commonWords) {
                for (word in words) {
                    words[word].ranking = commonWords[words[word].word].Rank;
                }
            }
        };

        return wordService;
    }])

    .factory('LessonService', ['$http', function (http) {

        var lessonData = null;

        http({method: 'GET', url: 'assets/lessons.json'})
            .success(function (data, status, headers, config) {
                lessonData = data;
            })
            .error(function (data, status, headers, config) {
                console.error('getting list of lessons failed');
            });

        var lessonService = function (sc, filterTags) {

            var result = [];

            if (filterTags) {
                filterTags = filterTags.split(' ');
                for (var i = 0; i < lessonData.length; i++) {
                    for (var j = 0; j < filterTags.length; j++) {
                        if (lessonData[i].tags.indexOf(filterTags[j]) > -1) {
                            result.push(lessonData[i]);
                            break;
                        }
                    }
                }
            }
            else {
                result = data;
            }


            return result;
        };

        return lessonService;
    }])

    .factory('UserDataService', ['$http', function (http) {

        var userDataService = {};

        userDataService.updateFilterHistory = function (include, require) {

            http({
                method: 'POST',
                url: 'disciple/profile/history',
                data: include + '|' + require
            })
                .success(function (data, status, headers, config) {
                })
                .error(function (data, status, headers, config) {
                    // not sure why but this was always erroring, even when a 200 is passed back
                    //console.error('posting filter history failed');
                });

        };

        userDataService.getFilterHistory = function () {

            var filterData = [];
            http({method: 'GET', url: 'disciple/profile/history?timestamp=' + new Date().getTime() })
                .success(function (data, status, headers, config) {
                    for (var i in data) {
                        var newFilterData = {};
                        var filter = i.split('|');
                        newFilterData.include = filter[0];
                        newFilterData.require = filter[1];
                        newFilterData.timestamp = new Date(parseInt(data[i], 10) * 1000).toLocaleString();

                        filterData.push(newFilterData);
                    }
                })
                .error(function (data, status, headers, config) {
                    console.error('getting filter history failed');
                });

            return filterData;
        };

        return userDataService;

    }])

    .factory('ControllerSyncService', function ($rootScope) {

        var controllerSyncService = {};

        controllerSyncService.userData = {};

        controllerSyncService.currentLesson = {};

        controllerSyncService.customMode = false;

        controllerSyncService.updateCurrentLesson = function (data) {
            this.currentLesson = data;
            $rootScope.$broadcast('updateLesson');
        };

        controllerSyncService.updateCustomMode = function (mode) {
            this.customMode = mode;
            $rootScope.$broadcast('customMode');
        };

        return controllerSyncService;

    })

    .factory('StenoService', function () {
        var stenoService = {};

        stenoService.expandBrief = function (brief) {

            var output = [];

            if (brief === undefined || brief === "") {
                return output;
            }

            var right_hand = false;
            var vowel_visited = false;

            for (var i = 0; i < brief.length; i++) {
                var x = brief[i];
                if (x === '-') {
                    right_hand = true;
                }
                else if (x === '#') {
                    output = output + x;
                }
                else if (x === '*') {
                    output.push(x);
                    right_hand = true;
                }
                else {
                    if (x === 'E' || x === 'U') {
                        right_hand = true;
                    }
                    if (right_hand) {
                        output.push("-" + x);
                    }
                    else {
                        if (x === 'A' || x === 'O') {
                            vowel_visited = true;
                            output.push(x + "-");
                        }
                        else if (vowel_visited) {
                            right_hand = true;
                            output.push('-' + x);
                        }

                        else {
                            output.push(x + "-");
                        }
                    }

                }
            }
            return output;
        };

        return stenoService;
    })

;