'use strict';

(function () {
  
  angular
    .module("tradeapp", ["ngResource"])
    .controller("appController", ["$scope", "$resource", "$http", function ($scope, $resource, $http) {
      
      var list = [];
      
      $scope.showModal = false;
      $scope.tradeModal = false;
      $scope.checkMine = false;
      $scope.checkOthers = false;
      $scope.showAdd = false;
      
      var loginCheck = $resource("/api/login");
      loginCheck.get(function (res) {
        $scope.logged = res.logged;
        if($scope.logged) {
          $scope.loginName = res.userid.username;
        } else {
          $scope.loginName = "guest";
        }
      });
      
      $scope.openForm =  function () {
        $scope.showModal = true;  
      };
      
      $scope.closeModal = function () {
        $scope.showModal = false;
        $scope.tradeModal = false;
        $scope.showAdd = false;
        $scope.checkMine = false;
        $scope.checkOthers = false;
      };
      
      $scope.updateProfile = function () {
        $scope.showModal = false;
        if (!$scope.fullName) {$scope.fullName = ""}
        if (!$scope.city) {$scope.city = ""}
        if (!$scope.state) {$scope.state = ""}
        if (!$scope.email) {$scope.email = ""}
        var details = {user:$scope.loginName, name: $scope.fullName, city: $scope.city, state: $scope.state, email: $scope.email};
        $http.post("/api/profile", details).then(function successCallback(response) {
          // this callback will be called asynchronously when the response is available
        }, function errorCallback(response) {}); // called asynchronously if an error occurs or server returns response with an error status
        
        var person = $resource("/api/:user", {user: "@username"});
        person.get({user: $scope.loginName}, function (res) {
          res = res.profile;
          alert("UPDATED PROFILE: " + res.fullname + "\ncity: " + res.city + " State: " + res.state + "\ne-mail: "+ res.email);
        });        
      };
            
      var totalRequests = function (listOfBooks) {
        var myReq = 0;
        var usReq = 0;
        for(var i=0; i<listOfBooks.length; i++){
          if (listOfBooks[i].borrower == $scope.loginName || listOfBooks[i].requester == $scope.loginName) {
            myReq++;
          }else {
            if(listOfBooks[i].user == $scope.loginName ) {
              if (listOfBooks[i].borrower !== "" || listOfBooks[i].requester !== "") { usReq++; }
            }
          }          
        }
        $scope.myTrade = myReq;
        $scope.othersTrade = usReq;
      };
      
      var bookList = $resource("/list/book");
      bookList.get(function (res) {
        list = res.list;
        $scope.numBooks = list.length;
        $scope.list = res.list;
        totalRequests(list);
      });      
      
      $scope.allBooks = function () {
        bookList.get(function (res) {
          list = res.list;
          $scope.numBooks = list.length;
          $scope.list = res.list;
          totalRequests(list);
        });
      };
      
      $scope.myBooks = function () {
        var userList = [];
        for(var i=0; i<list.length; i++) {
          if(list[i].user == $scope.loginName) {
            userList.push(list[i]);
          }
        }
        $scope.list = userList;
      };
      
      $scope.openAdd = function () {
        $scope.showAdd = true;
        $scope.bookTitle = "";
      };
      
      var searchTitle = $resource("/book/:title", {title: "@title"});
      $scope.addBook = function () {
        $scope.showAdd = false;
        if($scope.bookTitle){
          searchTitle.get({title: $scope.bookTitle}, function (res){
            if(res) {
              var newBook = {user: $scope.loginName, title: res.results.title, author: res.results.authors, img: res.results.thumbnail, 
                            available: true, requester:"", borrower: ""};
              $http.post("/book/:title", newBook).then(function successCallback(response) {
                $scope.update = true;// this callback will be called asynchronously when the response is available
              }, function errorCallback(response) {}); // called asynchronously if an error occurs or server returns response with an error status              
            }
          });
        }
      };
      
      $scope.$watch("update", function () {
        if($scope.update) {
          $scope.update = false;
          bookList.get(function (res) {
            list = res.list;
            $scope.numBooks = list.length;
            $scope.list = res.list;
            totalRequests(list);
          });          
        }                
      });
      
      var indexSearch = function (arr, item) {
        var index;
        for(var i=0; i<arr.length; i++) {
          if(item.requester == arr[i].requester) {
            if(item.title == arr[i].title && item.user == arr[i].user) {
              index = i;
              break;
            }
          }
        }
        arr.splice(index, 1);
      };
            
      $scope.sendRequest = function (book, disponible) {
        var info = book;
        info.requester = $scope.loginName;
        info.available = disponible;
        if(disponible) {
          indexSearch($scope.myBooksList, info);
          info.requester = "";
        }
        $http.post("/list/book", info).then(function successCallback(response) {
          $scope.update = true; // this callback will be called asynchronously when the response is available
        }, function errorCallback(response) {}); // called asynchronously if an error occurs or server returns response with an error status        
      };
      
      $scope.openMyTrade = function () {
        $scope.tradeModal = true;
        $scope.checkMine = true;
        $scope.checkOthers = false;
        var info = {user: $scope.loginName, trade: $scope.checkMine};
        var tradeInfo = $resource("/api/:user/:trade", {user: "@user", trade: "@trade"});
        tradeInfo.get(info, function (res){
          $scope.myBooksList = res.data;
        });
      };
      
      var tradeInfo = $resource("/api/:user/:trade", {user: "@user", trade: "@trade"});      
      $scope.openOthersTrade = function () {
        $scope.tradeModal = true;
        $scope.checkMine = false;
        $scope.checkOthers = true;
        var info = {user: $scope.loginName, trade: $scope.checkMine};
        tradeInfo.get(info, function (res){
          $scope.userBooksList = res.data;
        });        
      }
      
      $scope.acceptReq = function (book, val) {
        var info;
        if(val) {
          info = book;
          info.borrower = book.requester;
          info.requester = "";
          info.available = false;
          $http.post("/list/book", info).then(function successCallback(response) {
            $scope.update = true; // this callback will be called asynchronously when the response is available
            tradeInfo.get({user: $scope.loginName, trade: false}, function (newList) {
              $scope.userBooksList = newList.data;
            });
          }, function errorCallback(response) {}); // called asynchronously if an error occurs or server returns response with an error status           
        } else {
          info = book;
          indexSearch($scope.userBooksList, info);
          info.requester = "";
          info.available = true;          
          $http.post("/list/book", info).then(function successCallback(response) {
            $scope.update = true; // this callback will be called asynchronously when the response is available
            tradeInfo.get({user: $scope.loginName, trade: false}, function (newList) {
              $scope.userBooksList = newList.data;
            });            
          }, function errorCallback(response) {}); // called asynchronously if an error occurs or server returns response with an error status     
        } 
      };
      
      $scope.deleteBook = function (book) {
        tradeInfo.delete({user:book.user, trade: book.title}, function (res) { $scope.update = true; });
      };
      
    }])
  
})();