'use strict';

var viewport = document.createElement("meta");
viewport.setAttribute('name', 'viewport');
viewport.setAttribute('content', 'width=device-width, initial-scale=1, minimal-ui');
document.getElementsByTagName('head')[0].appendChild(viewport);

var app = angular.module('dribbble', [
    'ngResource',
    'ngRoute',
    'akoenig.deckgrid'
]).
    config(function ($httpProvider) {
        $httpProvider.defaults.headers.common['Authorization'] = "Bearer 37ae78310cee9a19507d02ce7f14db11382588ed921cf0153fbde23489a775ed";
    });

app.filter("sanitize", ['$sce', function ($sce) {
    return function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }
}]);

app.factory("Shots", function ($resource) {
    return $resource("https://api.dribbble.com/v1/shots");
});

app.service("ShotsService", function ($filter, Shots) {
    var self = {
        'page': 0,
        'isLoading': false,
        'shots': [],
        'loadShots': function ($scope) {
            self.isLoading = true;
            self.page++;
            Shots.query({page: self.page},
                function (data) { // onSucess
                    angular.forEach(data, function (shot) {
                        self.shots.push(angular.extend(new Shot(), shot));
                        //self.shots.push(shot);
                    });

                    console.log(self.shots);
                    self.isLoading = false;
                },
                function (data) { // onError
                    self.isLoading = false;
                });
        },
        'getShot': function (id) {
            return $filter('filter')(self.shots, {id: id}, true)[0];
        }
    };

    function Shot() {
        this.getUserAvatar = function (str) {
            return this.user.avatar_url.replace('/normal/', '/' + str + '/')
        };
        this.getAnimatedImageUrl = function () {
            return (this.animated && angular.isString(this.images.hidpi) ? this.images.hidpi : this.images.teaser);
        };
        this.getImageUrl = function () {
            return angular.isString(this.images.hidpi) ? this.images.hidpi : this.images.normal;
        };
    }

    return self;
});

app.controller('ShotsController', function ($scope, ShotsService) {
    $scope.api = ShotsService;
    $scope.selectedShot = undefined;
    $scope.showDetail = false;
    $scope.loadMore = function () {
        ShotsService.loadShots($scope);
    };
    $scope.displayShot = function (id) {
        $scope.selectedShot = $scope.api.getShot(id);
        $scope.showDetail = true;
    };

    $scope.loadMore();
});