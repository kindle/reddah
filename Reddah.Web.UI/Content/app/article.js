angular.module("reddahApp")
.controller("searchCtrl", ['$scope', function ($scope) {
    $scope.keyword = "";
    $scope.search = function (locale) {
        let url = `/${locale}/search/${$scope.keyword}/`;
        window.open(url, '_self');
    };
    $scope.searchOnEnter = function (e, locale) {
        var keycode = window.event ? e.keyCode : e.which;
        if (keycode == 13) {
            $scope.search(locale);
        }
    };
}])
.controller("groupCtrl", ['$scope', 'groupSvc', function ($scope, groupSvc) {
    $scope.group = {
        Locale: "",
        Name: "",
        Desc: ""
    }
    $scope.groupLoading = false;
    $scope.getGroup = function (name, locale) {
        $scope.group = {
            Locale: locale,
            Name: name,
            Desc: ""
        }
        $scope.loading = true;
        groupSvc.getGroup($scope.group).then(function (data) {
            if (data.success == true) {
                $scope.group = data.result.Group;
            }
            $scope.groupLoading = false;
        },
        function (data) {
            $scope.groupLoading = false;
        });
    };
}])
.controller("articleCtrl", ['$scope', '$sce', 'articleSvc', function ($scope, $sce, articleSvc) {
    $scope.trustAsResourceUrl = function (url) {
        return $sce.trustAsResourceUrl(url);
    };
    $scope.playVideo = function (id) {
        let v = $('#video_' + id).get(0);
        if (v.paused) {
            v.play();
        } else {
            v.pause();
        }
    };
    $scope.aiArticles = [];
    $scope.loadedArticleIds = [0];
    $scope.loading = false;
    $scope.getUserProfileArticles = function (locale, menu, sub, user, keyword) {
        $scope.UserProfileModel = {
            LoadedIds: $scope.loadedArticleIds,
            Locale: locale,
            Token: $scope.antiForgeryToken,
            Menu: menu,
            Sub: sub,
            User: user,
            Keyword: keyword
        };
        $scope.loading = true;
        $scope.isLoadingMore = true;

        articleSvc.getArticles($scope.UserProfileModel).then(function (data) {
            if (data.success == true) {
                if (data.result.Articles.length==0)
                    $scope.noMoreResult = true;
                data.result.Articles.forEach(function (article) {
                    $scope.aiArticles.push(article);
                    if ($scope.loadedArticleIds.indexOf(article.Id) == -1)
                        $scope.loadedArticleIds.push(article.Id);
                });
            }

            $scope.loading = false;
            $scope.isLoadingMore = false;

        },
        function (data) {
            $scope.loading = false;
            $scope.isLoadingMore = false;
            $scope.serverError = true;
        });
    };
    $scope.isLoadingMore = false;
    $scope.loadMore = function (locale, menu, sub, user, keyword) {
        if ($scope.isLoadingMore == false) {
            $scope.getUserProfileArticles(locale, menu, sub, user, keyword);
        }
    };
    $scope.viewArticle = function (locale, group, id, title) {
        let url = `/${locale}/r/${group}/comments/${id}/${title}/`;
        
        window.open(url, '_blank');
    };
}])
.controller("rightBoxCtrl", ['$scope', 'articleSvc', function ($scope, articleSvc) {
    $scope.aiRightBoxItems = [];
    $scope.getRightBox = function (locale) {
        $scope.rightBoxModel = {
            Token: $scope.antiForgeryToken,
            Locale: locale
        };
        $scope.rightBoxLoading = true;
        articleSvc.getRightBox($scope.rightBoxModel).then(function (data) {
            if (data.success == true) {
                data.result.RightBoxModules.forEach(function (item) {
                    $scope.aiRightBoxItems.push(item);
                });
            }

            $scope.rightBoxLoading = false;
        }, function (data) {
            $scope.rightBoxLoading = false;
        });
    };
}])
.factory("articleSvc", ['$http', '$q', function ($http, $q) {
    return {
        getArticles: function (data) {
            var defer = $q.defer();
            $http({
                method: 'post',
                url: '/' + data.Locale + '/AI/JsonUserProfileArticles',
                data: JSON.stringify(data),
                dataType: "json",
                headers: {'RequestVerificationToken': data.Token}
            }).success(function (data, status, headers, config) {
                defer.resolve(data);
            }).error(function (data, status, headers, config) {
                defer.reject(data)
            });
            return defer.promise;
        },
        getRightBox: function (data) {
            var defer = $q.defer();
            $http({
                method: 'post',
                url: '/' + data.Locale + '/AI/JsonRightBoxItems',
                data: data,
                headers: { 'RequestVerificationToken': data.Token }
            }).success(function (data, status, headers, config) {
                defer.resolve(data);
            }).error(function (data, status, headers, config) {
                defer.reject(data)
            });
            return defer.promise;
        },
    };
}])
.factory("groupSvc", ['$http', '$q', function ($http, $q) {
    return {
        getGroup: function (data) {
            var defer = $q.defer();
            $http({
                method: 'post',
                url: '/' + data.Locale + '/AI/JsonGetGroup',
                data: JSON.stringify(data),
                dataType: "json"
            }).success(function (data, status, headers, config) {
                defer.resolve(data);
            }).error(function (data, status, headers, config) {
                defer.reject(data)
            });
            return defer.promise;
        }
    };
}])
.directive('whenScrolled', function () {
    return function (scope, elm, attr) {
        angular.element(window).bind('scroll', function () {
            let sm = $(this).scrollTop() + window.innerHeight;
            let dsm = $(document).height();
            if (sm === dsm) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
})
.directive('onFinishRenderPosts', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope) {
            if (scope.$last === true) {
                $timeout(function () {
                    $("img.lazy").lazyload({
                        container: $("#ai-list"),
                        placeholder: "/content/Images/noimage.jpg",
                        effect: "fadeIn",
                        threshold: 200,
                        failure_limit: 20,
                        skip_invisible: false
                    });
                });
            }
        }
    }
}]);