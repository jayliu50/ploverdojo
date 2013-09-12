/* Controllers */
angular.module('ploverdojo.lessonbrowser', ['ploverdojo.services'])
    .controller('LessonBrowserCtrl', ['$scope', 'LessonService', 'ControllerSyncService', 'UserDataService',
        function (sc, lessonService, controllerSyncService, userDataService) {

            sc.currentLesson = {};

            sc.currentSection = {};

            sc.history = userDataService.getFilterHistory();

            sc.loadSection = function (section) {
                sc.currentSection.lessons = lessonService(sc, "group-" + section);
            };

            sc.loadFilter = function (lesson) {
                sc.currentLesson = lesson;
                controllerSyncService.updateCurrentLesson({include: lesson['include'], require: lesson['require']});
            };

            sc.scaffold_enterCustomMode = function () {
                controllerSyncService.updateCustomMode(true);
            };
        }
    ])
;




