
'use strict';
angular.module("myApp").controller('headerController', function($scope) {
	var self = this;
	self.name = "Rafael Estevam"

	$("#btn-notifications").click(function(){
		$("#modal-notifications").modal("show");
	})

	$("#btn-search").click(function(){
		$("#search").toggleClass('mobile')
		$("#search").toggleClass('desktop')
	})

	$("#btn-menu").click(function(){
		$("#main-sidebar").toggleClass('mobile')
	})

});

