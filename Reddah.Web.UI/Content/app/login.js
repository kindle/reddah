﻿angular.module("reddahApp", [])
.controller("loginCtrl", ['$scope', 'loginSvc', function ($scope, loginSvc) {
    $scope.loadingLogin = false;
    $scope.loginModel = {
        UserName: "",
        Password: "",
        RememberMe: false,
        ReturnUrl: window.location.href,
        Error: "",
        Token: ""
    };
    $scope.login = function () {
        $scope.loadingLogin = true;
        $scope.loginModel.Token = $scope.antiForgeryToken;
        loginSvc.login($scope.loginModel).then(function (data) {
            if (data.success == true) {
                window.location.replace(data.redirect);
            }
            else {
                $scope.loadingLogin = false;
                var str = '';
                for (var error in data.errors) {
                    str += data.errors[error] + '\n';
                }
                $scope.loginModel.Error = str;
            }
        })
    };

    $scope.loadingRegister = false;
    $scope.registerModel = {
        UserName: "",
        Password: "",
        ConfirmPassword: "",
        Email: "",
        RememberMe: false,
        ReturnUrl: window.location.href,
        Error: "",
        Token: ""
    };
    $scope.register = function () {
        $scope.loadingRegister = true;
        $scope.registerModel.Token = $scope.antiForgeryToken;
        loginSvc.register($scope.registerModel).then(function (data) {
            if (data.success == true) {
                window.location.replace(data.redirect);
            }
            else {
                $scope.loadingRegister = false;
                var str = '';
                for (var error in data.errors) {
                    str += data.errors[error] + '\n';
                }
                $scope.registerModel.Error = str;
            }
        })
    };
    
}])
.controller("appCtrl", ['$scope', 'loginSvc', function ($scope, loginSvc) {
    $scope.loginModel = { UserName: "", Password: "", RememberMe: false, ReturnUrl: window.location.href, Error: "", Token: "" };
    $scope.showPanel = function () {
        $('div#BroswerOpacify').show();
        $('div#LoginRegisterPanel').show();
        var toAlign = $('div#LoginRegisterPanel');
        toAlign.css('top', (($(window).height() - toAlign.outerHeight()) / 2) + $(window).scrollTop() + 'px');
        toAlign.css('left', (($(window).width() - toAlign.outerWidth()) / 2) + $(window).scrollLeft() + 'px');
    };
    $scope.hidePanel = function () {
        $('div#BroswerOpacify').hide();
        $('div#LoginRegisterPanel').hide();
    }
    $scope.showImage = function (box, index) {
        if ($('.' + box +' img#org_image_' + index).attr("src") === "/content/images/noimage.jpg")
            return;
        $('.' + box +' img#org_image_'+index).toggle();
    }
    $scope.toggleArticle = function (box, index) {
        $('.' + box + ' div#org_article_' + index).toggle();
    }
    $scope.vote = function (articleId, value, orgCount) {
        $scope.voteModel = {
            ArticleId: articleId,
            Value: value
        };
        loginSvc.vote($scope.voteModel).then(function (data) {
            if (data.success == true) {
                var newCount = value == "up" ? orgCount + 1 : orgCount - 1;
                $('.post span#vote-count-post-' + articleId).text(newCount);
            }
            else {
                var str = '';
                for (var error in data.errors) {
                    str += data.errors[error] + '\n';
                }
                alert(str);
            }
        })
    }
}])
.controller("nextprevbox", ['$scope', function ($scope) {
    $scope.currentIndex = 1;
    $scope.next = function (total) {
        if ($scope.currentIndex < total) {
            $scope.currentIndex++;
        }
        else {
            $scope.currentIndex = 1;
        }
        $scope.showPost();
    }
    $scope.prev = function (total) {
        if ($scope.currentIndex > 1) {
            $scope.currentIndex--;
        }
        else
        {
            $scope.currentIndex = total;
        }
        $scope.showPost();
    }
    $scope.showPost = function () {
        $('div.upcomingPost').hide();
        $('div#upcomingPost-' + $scope.currentIndex).show();
    };
}])
.factory("loginSvc", ['$http', '$q', function ($http, $q) {
    return {
        login: function (data) {
            var defer = $q.defer();
            $http({
                method: 'post',
                url: '/en-us/Account/JsonLogin',
                data: data,
                headers: { 'RequestVerificationToken': data.Token }
            }).success(function (data, status, headers, config) {
                defer.resolve(data);
            }).error(function (data, status, headers, config) {
                defer.reject(data)
            });
            return defer.promise;
        },
        register: function (data) {
            var defer = $q.defer();
            $http({
                method: 'post',
                url: '/en-us/Account/JsonRegister',
                data: data,
                headers: { 'RequestVerificationToken': data.Token }
            }).success(function (data, status, headers, config) {
                defer.resolve(data);
            }).error(function (data, status, headers, config) {
                defer.reject(data)
            });
            return defer.promise;
        },
        vote: function (data) {
            var defer = $q.defer();
            $http({
                method: 'post',
                url: '/en-us/Articles/JsonVote',
                data: data
            }).success(function (data, status, headers, config) {
                defer.resolve(data);
            }).error(function (data, status, headers, config) {
                defer.reject(data)
            });
            return defer.promise;
        }
    }
}])
.directive('collapser', function () {
    return {
        restrict: 'EAC',
        templateUrl: '/content/app/collapser.html',
        scope: {
            caption: '@'
        },
        transclude: true
    };
})
.directive('collapserComment', function () {
    return {
        restrict: 'EAC',
        templateUrl: '/content/app/collapser-comment.html',
        scope: {
            toggle1: '@',
            toggle2: '@',
            locale: '@',
            username: '@',
            createdon: '@',
            content: '@',
            parentid: '@'
        },
        transclude: true
    };
})
