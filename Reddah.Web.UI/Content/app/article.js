angular.module("reddahApp")
.controller("searchCtrl", ['$scope', function ($scope) {
    $scope.keyword = "";
    $scope.search = function (locale) {
        let url = `/${locale}/search/${$scope.keyword}/`;
        window.open(url, '_self');
    };
}])
.controller("articleCtrl", ['$scope', '$sce', 'articleSvc', function ($scope, $sce, articleSvc) {
    $scope.trustAsResourceUrl = function (url) {
        return $sce.trustAsResourceUrl(url);
    };
    $scope.subpost = function (str, n) {
        var r = /[^\u4e00-\u9fa5]/g;
        if (str.replace(r, "mm").length <= n) { return str; }
        var m = Math.floor(n / 2);
        for (var i = m; i < str.length; i++) {
            if (str.substr(0, i).replace(r, "mm").length >= n) {
                return str.substr(0, i) + "...";
            }
        }
        return str;
    };
    $scope.toTop = function () {
        $("html,body").animate({ scrollTop: 0 }, 500);
    }
    
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
                data.result.Articles.forEach(function (article) {
                    $scope.aiArticles.push(article);
                    if ($scope.loadedArticleIds.indexOf(article.Id)==-1)
                        $scope.loadedArticleIds.push(article.Id);
                });   
            }

            $scope.loading = false;
            $scope.isLoadingMore = false;
            
        });
    };
    $scope.isLoadingMore = false;
    $scope.loadMore = function (locale, menu, sub, user, keyword) {
        if ($scope.isLoadingMore == false) {
            $scope.getUserProfileArticles(locale, menu, sub, user, keyword);
        }
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
        s = s.replace(/&#183;/g, "\·");

        return s;
    };
    $scope.urlDecode = function (str) {
        var s = "";
        if (str.length == 0) return "";

        s = $scope.htmlDecode(str).replace(/ /g, "-");
        s = s.replace(/--/g, "-");
        s = s.replace(/[^a-zA-Z0-9\-\u4e00-\u9fa5]/g, "");

        return s;
    };
    $scope.summary = function (str, n) {
        str = $scope.htmlDecode(str).replace(/<[^>]+>/g, "");
        return $scope.subpost(str, n);
    };
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
        });
    };
    $scope.viewArticle = function (locale, group, id, title) {
        let url = `/${locale}/r/${group}/comments/${id}/${title}/`;
        
        window.open(url, '_blank');
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