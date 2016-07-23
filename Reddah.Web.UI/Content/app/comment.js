angular.module("reddahApp")
.controller("commentCtrl", ['$scope', 'commentSvc', function ($scope, commentSvc) {
    $scope.loading = false;
    $scope.model = {
        Content: "",
        ArticleId: -1,
        ParentId: -1,
        Error: "",
        Token: ""
    };
    $scope.add = function (parentId) {
        $scope.loading = true;
        $scope.model.Token = $scope.antiForgeryToken;
        $scope.model.ArticleId = $scope.articleId;
        $scope.model.ParentId = parentId;
        commentSvc.add($scope.model).then(function (data) {
            if (data.success == true) {
                
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
}])
.factory("commentSvc", ['$http', '$q', function ($http, $q) {
    return {
        add: function (data) {
            var defer = $q.defer();
            $http({
                method: 'post',
                url: '/en-us/Article/JsonAddComment',
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
