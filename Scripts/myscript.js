define(['angular', 'components/shared/index'], function (angular) {
	var myApp = angular.module('myModule', ['powerSchoolModule']);

	myApp.controller('myController', function($scope, $http) {

		$scope.myData = [];

		$http.get('mydata.json').then(function(myJSON) {
		    myJSON.data.pop();
            $scope.myData = myJSON.data;
		});

	});
});
