// this wraps all your code into Angular
define(['angular', 'components/shared/index'], function (angular) { var myApp = angular.module('myModule', ['powerSchoolModule']);
// this is your controller, Angular calls this function when the page is loaded // as it encounters the data­ng­controller directive
myApp.controller('myController', function($scope, $http) {
// $scope is a built­in Angular object. It contains everything that is bound // to the HTML elements. This line initializes an array within the $scope // object called “myData”
$scope.myData = [];
//$httpisabuilt­inAngularobject. Itcontainsallthemethodsfor // accessing web resources... such as this one: $http.get
$http.get('mydata.json')
// .then is executed after $http.get returns data ... it  gets the web page // (mydata.json)  then runs a function with the data from the web page placed // into the myJSON object
.then(function(myJSON) {
// .pop removes the last item in the array, which should be empty (see your // t_listsql)
myJSON.data.pop();
// copy the data array from myJSON to the $scope object variable, myData, which // is bound to the grid widget
$scope.myData = myJSON.data; });
	});
});
