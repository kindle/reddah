﻿angular.module("reddahApp")
.controller("loginCtrl", ['$scope', 'loginSvc', function ($scope, loginSvc) {
    
    $scope.actions =
    {
        setCurrent: function (param) {
            $scope.data.current = param;
        }
    }

    $scope.loginOnEnter = function (e) {
        var keycode = window.event ? e.keyCode : e.which;
        if (keycode == 13) {
            $scope.login();
        }
    };
    $scope.loadingLogin = false;
    $scope.loginModel = {
        UserName: "",
        Password: "",
        RememberMe: false,
        ReturnUrl: window.location.href,
        Error: "",
        Token: "",
        Locale: "en-us"
    };
    $scope.login = function () {
        $scope.loadingLogin = true;
        $scope.loginModel.Token = $scope.antiForgeryToken;
        $scope.loginModel.Locale = $scope.locale; 
        loginSvc.login($scope.loginModel).then(function (data) {
            if (data.success == true) {
                if (data.redirect.indexOf("?")!=-1)
                    data.redirect += "&login=true";
                else 
                    data.redirect += "?login=true";
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
        Token: "",
        Locale: "en-us"
    };
    $scope.register = function () {
        $scope.loadingRegister = true;
        $scope.registerModel.Token = $scope.antiForgeryToken;
        $scope.registerModel.Locale = $scope.locale; 
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
                url: '/' + data.Locale + '/Account/JsonLogin',
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
                url: '/' + data.Locale + '/Account/JsonRegister',
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
                url: '/' + data.Locale + '/Articles/JsonVote',
                data: data
            }).success(function (data, status, headers, config) {
                defer.resolve(data);
            }).error(function (data, status, headers, config) {
                defer.reject(data)
            });
            return defer.promise;
        },
    }
}])
