/* Controllers */
angular.module('ploverdojo.lessonbrowser', ['ploverdojo.services', 'ploverdojo.wordexplorer', 'ngCookies'])
    .controller('LessonBrowserCtrl', ['$scope', '$cookies', 'LessonService', 'ControllerSyncService', 'UserDataService',
        function (sc, cookies, lessonService, controllerSyncService, userDataService) {

            sc.init = function () {
                sc.loadSection(cookies.currentSection ? parseInt(cookies.currentSection) : 0);

                if (cookies.currentFilter) {
                    sc.loadFilter(JSON.parse(cookies.currentFilter));
                }
            };

            sc.currentFilter = {};

            sc.currentSection = {};

            sc.history = userDataService.getFilterHistory(sc);

            sc.loadSection = function (section) {
                sc.currentSection.number = section;
                sc.currentSection.lessons = lessonService(sc, "group-" + section);
                cookies.currentSection = section + "";
            };

            sc.loadFilter = function (filter, index) {
                if (index !== undefined) {
                    filter.index = index;
                }
                sc.currentFilter = filter;
                controllerSyncService.updateCurrentFilter(filter);
                cookies.currentFilter = JSON.stringify(filter);
            };


        }
    ])
;




