//Use strict mode for angularjs environment.
// 'use strict'

const mainApp = angular
    .module(
        'mainApp',
        [
            'ui.router', //Dependency for UI Router
            'ngAnimate', //Dependency for Angular Animate
            'ngCookies', //Dependency for Angular Cookies
        ]
    )

    .config(['$locationProvider', function ($locationProvider) {
        //Uncomment the following line to enable HTML5 Mode true
        //$locationProvider.html5Mode(true);
    }])

    .run(['dbService', function (dbService) {
        try {
            //Instantiate the dbService and handle error accordingly.
            dbService.init().then(() => { console.log("DBService :: Connection Successful"); }).catch((error) => { console.log("DBService :: Error ", error) });
        } catch (error) {
            console.log("DbService :: Catched Error", error);
        }
    }])