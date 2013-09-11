/* Controllers */
angular.module('ploverdojo.lessonbrowser', ['ploverdojo.services'])
    .controller('LessonBrowserCtrl', ['$scope', 'LessonService', 'UserDataService',
        function (sc, lessonService, userDataService) {

            sc.currentLesson = {};

            sc.currentSection = {};

            sc.loadSection = function (section) {
                sc.currentSection.lessons = lessonService(sc, "group-" + section);
            };

            sc.loadlesson = function (lesson) {
                sc.currentLesson = lesson;
                userDataService.updateCurrentLesson({include: lesson['include'], require: lesson['require']});
            };

            sc.scaffold_enterCustomMode = function () {
                userDataService.updateCustomMode(true);
            };
        }
    ])
;




