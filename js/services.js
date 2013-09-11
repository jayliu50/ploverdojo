
angular.module('ploverdojo.services', [])
    .factory('WordService', ['$http', function (http) {

        var wordService = function (queryString, sc) {
            // not sure if I should be using the sc (scope) in here, but I didn't know what else I could do

            sc.busy = true;

            var mastery = null; // {}

            http({method: 'GET', url: 'disciple/profile?item=mastery&timestamp=' + new Date().getTime() })
                .success(function(data, status, headers, config) {
                    mastery = data;
                });

            http({method: 'GET', url: 'disciple/dictionary?' + queryString }).
                success(function (data, status, headers, config) {

                    if(mastery !== null) {
                        for(var item in data) {
                            if(mastery.hasOwnProperty(data[item].word)) {
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
                });
        };

        return wordService;
    }])

    .factory('LessonService', ['$http', function (http) {

        var lessonService = function (sc, filterTags) {

            var result = [];

            http({method: 'GET', url: 'assets/lessons.json'})
                .success(function (data, status, headers, config) {

                    if (filterTags) {

                        filterTags = filterTags.split(' ');
                        for (var i = 0; i < data.length; i++) {
                            for (var j = 0; j < filterTags.length; j++) {
                                if (data[i].tags.indexOf(filterTags[j]) > -1) {
                                    result.push(data[i]);
                                    break;
                                }
                            }

                        }
                    }
                    else {
                        result = data;
                    }
                })
                .error(function (data, status, headers, config) {

                });

            return result;
        };

        return lessonService;
    }])

    .factory('UserDataService', function ($rootScope) {

        var userDataService = {};

        userDataService.userData = {};

        userDataService.currentLesson = {};

        userDataService.customMode = false;

        userDataService.updateCurrentLesson = function (data) {
            this.currentLesson = data;
            $rootScope.$broadcast('updateLesson');
        };

        userDataService.updateCustomMode = function (mode) {
            this.customMode = mode;
            $rootScope.$broadcast('customMode');
        };

        return userDataService;

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