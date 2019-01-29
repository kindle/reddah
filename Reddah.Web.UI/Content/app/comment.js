angular.module("reddahApp")
.controller("commentCtrl", ['$scope', 'commentSvc','$window', function ($scope, commentSvc, $window) {
    $scope.loading = false;
    $scope.model = {
        Content: "",
        ArticleId: -1,
        ParentId: -1,
        Error: "",
        Token: "",
        Locale: "en-us"
    };
    $scope.add = function (locale, parentId) {
        $scope.loading = true;
        $scope.model.Token = $scope.antiForgeryToken;
        $scope.model.Locale = locale;
        $scope.model.ArticleId = $scope.articleId;
        $scope.model.ParentId = parentId;
        commentSvc.add($scope.model).then(function (data) {
            if (data.success == true) {
                $scope.model.Content = "";
                //todo:insert html via js on top
                ///$route.reload();
                $window.location.reload();
            }
            else {
                var str = '';
                for (var error in data.errors) {
                    str += data.errors[error] + '\n';
                }
                $scope.model.Error = str;
            }

            $scope.loading = false;
        })
    };
    $scope.delComment = function (locale, commentId) {
        var r = confirm("Are you sure to remove the comment?");
        if (r) {

            $scope.loading = true;
            $scope.model.Token = $scope.antiForgeryToken;
            $scope.model.Locale = locale;
            $scope.model.ArticleId = commentId;

            commentSvc.delComment($scope.model).then(function (data) {
                if (data.success == true) {
                    $scope.model.Content = "";
                    //todo:insert html via js on top
                    ///$route.reload();
                    $window.location.reload();
                }
                else {
                    var str = '';
                    for (var error in data.errors) {
                        str += data.errors[error] + '\n';
                    }
                    $scope.model.Error = str;
                }

                $scope.loading = false;
            })
        }
    }
}])
.factory("commentSvc", ['$http', '$q', function ($http, $q) {
    return {
        add: function (data) {
            var defer = $q.defer();
            $http({
                method: 'post',
                url: '/' + data.Locale + '/Article/JsonAddComment',
                data: data,
                headers: { 'RequestVerificationToken': data.Token }
            }).success(function (data, status, headers, config) {
                defer.resolve(data);
            }).error(function (data, status, headers, config) {
                defer.reject(data)
            });
            return defer.promise;
        },
        delComment: function (data) {
            var defer = $q.defer();
            $http({
                method: 'post',
                url: '/'+data.Locale+'/Article/JsonDelComment',
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
}])
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
            count:'@',
            parentid: '@',
            status: '@',
            msg:'@'
        },
        transclude: true
    };
})
.directive('collapser', function () {
    return {
        restrict: 'EAC',
        templateUrl: '/content/app/collapser.html',
        scope: {
            caption: '@',
            del: '@',
            delfun:'&'
        },
        transclude: true
    };
})