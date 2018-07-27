
define(['angular', 'components/shared/index'], function (angular) {

	var myApp = angular.module('myModule', ['powerSchoolModule']);

	myApp.controller('parentSearchController', function($scope, $http) {
			$scope.myData = [];
			$http.get('parentData.json')
			.then(function(myJSON) {
					myJSON.data.pop();
					$scope.myData = myJSON.data; });
		});


	myApp.controller('groupRosterController', function($scope, $http) {

			$scope.myData = [];
			$http.get('rosterData.json')
			.then(function(myJSON) {
					myJSON.data.pop();
					$scope.myData = myJSON.data; });
		});


	});
