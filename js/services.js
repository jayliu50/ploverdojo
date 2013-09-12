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

        var appendAttributes = function (data) {

            for (var item in data) {

                var word = data[item].word;
                if (mastery !== null && mastery.hasOwnProperty(word)) {
                    data[item].mastery = mastery[word];
                }

                if (commonWords !== null && commonWords.hasOwnProperty(word)) {
                    data[item].ranking = parseInt(commonWords[word].Rank);
                }
            }

        };

        wordService.populateWordsFromFilter = function (queryString, sc) {
            // not sure if I should be using the sc (scope) in here, but I didn't know what else I could do

            sc.busy = true;

            http({method: 'GET', url: 'disciple/dictionary?' + queryString }).
                success(function (data, status, headers, config) {

                    appendAttributes(data);

                    sc.words = data;
                    sc.busy = false;
                }).
                error(function (data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    sc.busy = false;
                    console.error('getting custom dictionary failed');
                });

            wordService.populateWordsFromRecent = function (sc) {
                // not sure if I should be using the sc (scope) in here, but I didn't know what else I could do

                sc.busy = true;

                http({method: 'GET', url: 'disciple/dictionary?' }).
                    success(function (data, status, headers, config) {

                        appendAttributes(data);

                        sc.words = data;
                        sc.busy = false;
                    }).
                    error(function (data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        sc.busy = false;
                        console.error('getting custom dictionary failed');
                    });
            };

            var commonWords = null;


            wordService.appendWithRanking = function (words) {
                if (commonWords) {
                    for (var word in words) {
                        words[word].ranking = parseInt(commonWords[words[word].word].Rank);
                    }
                }
            };

            return wordService;
        }
        ])

        .
        factory('LessonService', ['$http', function (http) {

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

                userDataService.updateFilterHistory = function (filter) {

                    var data = {};
                    data[filter.include + '|' + filter.require] = { timestamp: (Math.floor(new Date().getTime()) / 1000), title: filter.title };

                    http({
                        method: 'POST',
                        url: 'disciple/profile/history/filters',
                        data: JSON.stringify(data)
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
                    http({method: 'GET', url: 'disciple/profile/history/filters?timestamp=' + new Date().getTime() })
                        .success(function (data, status, headers, config) {
                            for (var i in data) {
                                var newFilterData = {};
                                var filter = i.split('|');
                                newFilterData.include = filter[0];
                                newFilterData.require = filter[1];
                                newFilterData.title = data[i].title;
                                newFilterData.timestamp = new Date(parseInt(data[i].timestamp, 10) * 1000).toLocaleString();

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

                controllerSyncService.currentFilter = {};

                controllerSyncService.customMode = false;

                controllerSyncService.updateCurrentFilter = function (data) {
                    this.currentFilter = data;
                    $rootScope.$broadcast('updateFilter');
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