angular.module("reddahApp")
.controller("articleCtrl", ['$scope', 'articleSvc', function ($scope, articleSvc) {
    $scope.aiArticles = [];
    $scope.loading = false;
    $scope.getUserProfileArticles = function (locale) {
        $scope.userProfileModel = {
            Token: $scope.antiForgeryToken,
            Locale: locale
        };
        $scope.loading = true;
        $scope.isLoadingMore = true;

        articleSvc.getArticles($scope.userProfileModel).then(function (data) {
            if (data.success == true) {
                data.result.Articles.forEach(function (article) {
                    $scope.aiArticles.push(article);
                });
            }

            $scope.loading = false;
            $scope.isLoadingMore = false;
        })
    };
    $scope.isLoadingMore = false;
    $scope.loadMore = function (locale) {
        if($scope.isLoadingMore == false)
            $scope.getUserProfileArticles(locale);
    };
    $scope.htmlDecode = function (str) {
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&amp;/g, "&");
        s = s.replace(/&lt;/g, "<");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&nbsp;/g, " ");
        s = s.replace(/&#39;/g, "\'");
        s = s.replace(/&quot;/g, "\"");
        return s;
    }
}])
.factory("articleSvc", ['$http', '$q', function ($http, $q) {
    return {
        getArticles: function (data) {
            var defer = $q.defer();
            $http({
                method: 'post',
                url: '/' + data.Locale + '/AI/JsonUserProfileArticles',
                data: data,
                headers: { 'RequestVerificationToken': data.Token }
            }).success(function (data, status, headers, config) {
                defer.resolve(data);
            }).error(function (data, status, headers, config) {
                defer.reject(data)
            });
            return defer.promise;
        },
    }
}])
.directive('whenScrolled', function () {
    return function (scope, elm, attr) {
        angular.element(window).bind('scroll', function () {
            let sm = $(this).scrollTop() + $(window).height();
            let dsm = $(document).height();
            if (sm == dsm) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
});