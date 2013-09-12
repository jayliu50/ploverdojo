/* Controllers */
angular.module('ploverdojo.lessonbrowser', ['ploverdojo.services'])
    .controller('LessonBrowserCtrl', ['$scope', 'LessonService', 'ControllerSyncService', 'UserDataService',
        function (sc, lessonService, controllerSyncService, userDataService) {

            sc.currentFilter = {};

            sc.currentSection = {};

            sc.history = userDataService.getFilterHistory(sc);


            sc.loadSection = function (section) {
                sc.currentSection.lessons = lessonService(sc, "group-" + section);
            };

            sc.loadFilter = function (filter) {
                sc.currentFilter = filter;
                controllerSyncService.updateCurrentFilter(filter);
            };
        }
    ])
;




