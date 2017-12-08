define(['angular', 'components/shared/index'], function (angular) {
	var myApp = angular.module('myModule', ['powerSchoolModule']);

	myApp.controller('myController', function($scope, $http) {

		$scope.attendanceData = [];

		$http.get('attendance.json').then(function(myJSON) {
		    myJSON.data.pop();
            $scope.attendanceData = myJSON.data;
		});

	});
});
