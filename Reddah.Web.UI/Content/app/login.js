angular.module("reddahApp", [])
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
    }
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
        }
    }
}]);