
var app = angular.module("flapperNews",['ui.router'])
.config(
  function($stateProvider,$urlRouterProvider){
    $stateProvider
      .state('home',{
        url:'/home',
        templateUrl:'/home.html',
        controller:'FlapperNewsController',
        resolve:{
          postPromise:['posts',function(posts){
            return posts.getAll();
          }]
        }
      })
      .state('posts',{
        url:'/posts/{id}',
        templateUrl:'/posts.html',
        controller:'PostsController',
        resolve:{
          post:['$stateParams','posts',function($stateParams, posts){
            return posts.get($stateParams.id);
          }]
        }
      });
      $urlRouterProvider.otherwise('home');
  }).factory('posts',['$http',function($http){
  var o ={
    posts:[]
  };
  o.get = function(id){
    return $http.get('/posts/'+id).then(function(res){
      return res.data;
    });
  };
  o.create = function(post){
    return $http.post('/posts',post).success(function(data){
      o.posts.push(data);
    });
  };
  o.getAll = function(){
      return $http.get('/posts').success(function(data){
        angular.copy(data, o.posts);
      });
  };

  o.addComment = function (id, comment){
    return $http.post('/posts/'+id+'/comments',comment);
  };
  o.upvote=function(post){
    return $http.put('/posts/'+post._id+'/upvote')
        .success(function(data){
          post.upvote +=1;
        });
  };

  o.upvoteComment = function(post,comment){
    return $http.put('/posts/'+post._id+'/comments/'+comment._id+'/upvote')
        .success(function(data){
          comment.upvote +=1;
        });
  };

  return o;
}]);

app.controller('FlapperNewsController',[
'$scope',
'posts',
function($scope,posts){
  $scope.posts = posts.posts;
  $scope.incrementUpvotes = function(post){
    posts.upvote(post);
  };
  $scope.addPost=function(){
    if(!$scope.title || $scope.title ===''){return;}
    posts.create({
      title:$scope.title,
      link:$scope.link,
    });
    $scope.title='';
    $scope.link='';
  };
}]);


app.controller('PostsController',[
'$scope',
'posts',
'post',
function($scope,posts,post){
  $scope.post = post;

  $scope.addComment = function(){
  if($scope.body === '') { return; }
  posts.addComment(post._id, {
    body: $scope.body,
    author: 'user',
  }).success(function(comment) {
    $scope.post.comments.push(comment);
  });
  $scope.body = '';
};

$scope.incrementUpvotes = function(comment){
  posts.upvoteComment(post, comment);
};


}]);
