
'use strict';
angular.module("myApp").controller('indexCtrl', function($scope, $http) {
	var self = this;

	var usersList = [];
	var brandsList = [];
	var interactionsList = [];
	var users = [];
	var totalInteractions = [];
	var brandFilter = [];
	var brandUsers = [];
	var brandUsersFilter = [];

	//BINDS
	self.brandUsersFilter = [];
	self.brandFilter = [];
	self.brandName = "";
	self.brandImg = "";
	self.totalInteractions = 0;
	self.totalShare = 0;
	self.totalFavorites = 0;
	self.totalComments = 0;

	//REQUISIÇÕES
	//FUNÇÃO QUE FARÁ AS REQUISIÇÕES DOS ARQUIVOS .JSON PARA USO NA APLICAÇÃO.
	//APÓS A CHAMADA DE HTTP, ESTA IMPLEMENTAÇÃO IRÁ INICIAR O TRATAMENTO DOS DADOS PARA SEREM USADOS NOS GRÁFICOS.
	//TAMBÉM CHAMA A FUNÇÃO QUE VERIFICA O TOTAL DE INTERAÇÕES E OS CONTABILIZA DE ACORDO COM SEU TIPO
	function loadData (){
		$http.get('./frontend_data/users.json').then(function(response) {
			usersList = response.data
			return $http.get('./frontend_data/brands.json');
		 }).then(function(response){
			brandsList = response.data
			return $http.get('./frontend_data/interactions.json');
		}).then(function(response){
			interactionsList = response.data
			self.totalInteractions = interactionsList.length
			interactionsType()
		}).then(function(){
			setBrandFilter();
		})
	}
	
	//FUNÇÃO QUE CONTABILIZA AS INTERAÇÕES DE ACORDO COM SEU TIPO
	function interactionsType(){
		angular.forEach(interactionsList, function(item){
			if(item.type == "SHARE"){
				self.totalShare ++
			}else if(item.type == "FAVORITE"){
				self.totalFavorites ++
			}else if(item.type == "COMMENT"){
				self.totalComments ++
			}
		})
	}

	//LISTA TODAS AS MARCAS DO JSON EM UMA LISTA E DEPOIS FILTRA AS MARCAS REPETIDAS
	function setBrandFilter(){
		angular.forEach(brandsList, function(item){
			brandFilter.push({brand_id:item.id, brand_name: item.name, interactions: [], brand_img : item.image})
		})
		brandFilter = removeEqualData(brandFilter, 'brand_id');
		self.brandFilter = brandFilter;
		setUsersInteractions()
	}

	//FUNÇÃO QUE IRÁ FILTAR TODAS AS INTERAÇÕES DE ACORDO COM A MARCA.
	//ELA IRÁ VARRER A LISTA DE INTERAÇÕES, DE USUÁRIOS E RELACIONAR A MARCA COM A INTERAÇÃO, CASO EXISTA,
	//A FUNÇÃO IRÁ VER O USUÁRIO QUE FEZ DETERMINADA INTERAÇÃO E SALVAR ESTA INFORMAÇÃO NA MARCA ESPECÍFICA.
	function setUsersInteractions(){
		angular.forEach(interactionsList, function(item){
			angular.forEach(usersList, function(subitem){
				angular.forEach(brandFilter, function(underItem){
					if(item.brand == underItem.brand_id){
						if(item.user == subitem.id){
							underItem.interactions.push({user_id: subitem.id, user_name: subitem.name.first})
						}
					}
				})
			})
		})
		mainUserInteraction();
	}

	//FUNÇÃO QUE SOMA O TOTAL DE INTERAÇÕES DE UM USUÁRIO DE ACORDO COM A MARCA NA LISTA "BRANDFILTER"
	//PRIMEIRO ELA CRIA UMA LISTA DE TODOS OS USUÁRIOS QUE ESTÃO INTERAGINDO COM ELA, SENDO REPETIDOS OU NÃO.
	//POÍS DESTA FORMA O ALGORÍTIMO SABE QUANTAS VEZES UM DETERMINADO USUÁRIO SE COMUNICOU COM A MARCA, JÁ QUE É VERIFICADO
	//QUANTAS VEZES DETERMINADO USUÁRIO REPETIU NESTA LISTA, ACUSANDO ASSIM SUA INTERAÇÃO. 
	function mainUserInteraction(){
		angular.forEach(brandFilter, function(item){
			angular.forEach(item.interactions, function(subitem){
				brandUsers.push({brand_id: item.brand_id, brand_name: item.brand_name,  brand_img: item.brand_img, user_id: subitem.user_id, user_name: subitem.user_name, total_interactions: 0})
			})
			angular.forEach(brandUsers, function(subitem){
				angular.forEach(brandUsers, function(underItem){
					if(subitem.user_id == underItem.user_id){
						subitem.total_interactions ++
					}
				})
			})
			brandUsers = removeEqualData(brandUsers, 'user_id');
			brandUsersFilter.push(brandUsers)
			brandUsers = []
		})
		sortUsersInteraction(brandUsersFilter)
	}

	//FILTRA DADOS IGUAIS DE UMA LISTA QUALQUER DE ACORDO COM UM PARÂMETRO ESPECIFICADO.
	function removeEqualData(list, prop){
		var newArray = [];
    var lookup  = {};
    for(var i in list) {
        lookup[list[i][prop]] = list[i];
    }
    for(i in lookup) {
			newArray.push(lookup[i]);
		}
		return newArray;
	}

	//ORDENA OS USUÁRIOS DE ACORDO COM O TOTAL DE INTERAÇÕES QUE OS USUÁRIOS TIVERAM COM A MARCA.
	//GERA GRÁFICO DA PRIMEIRA MARCA DA LISTA, PARA NÃO CARREGAR A TELA SEM DADOS
	function sortUsersInteraction(list){
		angular.forEach(list, function(item){
			item.sort(function(a, b) {
				return b.total_interactions - a.total_interactions;
			});
		})
		self.getChart(1);
	}

	//GERAR OS GRÁFICOS DE ACORDO COM A MARCA SELECIONADA
	//A FUNÇÃO VARRERÁ A LISTA BRANDUSERSFILTER PARA CARREGAR AS INFORMAÇÕES DA MARCA, A QUANTIDADE DE INTERAÇÕES E OS USUÁRIOS QUE
	//INTERAGIRAM COM ELA. DESTA MANEIRA, JÁ APLICANDO O FILTRO DOS DADOS DE ACORDO COM A MARCA
	self.getChart = function(brandId){
		users = [];
		totalInteractions = [];
		
		angular.forEach(brandUsersFilter, function(item){
			angular.forEach(item, function(subitem){
				if(subitem.brand_id == brandId){
					self.brandName = subitem.brand_name;
					self.brandImg = subitem.brand_img;
					users.push(subitem.user_name)
					totalInteractions.push(subitem.total_interactions)
				}
			})
		})
		createCharts()
	}


	//PLUGIN DE GRÁFICOS CHARTIST
	//ELE RECEBE AS LABELS E OS DADOS RELACIONADOS DE ACORDO COM A ORDEM, DETERMINA ALGUMAS CONFIGURAÇÕES DE VISUAL
	//E PASSA PARA O PLUGIN ESSES DADOS E CONFIGURAÇÕES PARA CONSTRUIR O GRÁFICO NO ELEMENTO SELECIONADO ATRAVÉS DA CLASSE
	function createCharts(){

		var data = {
			labels: users,
			series: [totalInteractions]
		};
		var options = {
			seriesBarDistance: 10,
			height: '200px'
		};
		var responsiveOptions = [
			['screen and (max-width: 640px)', {
				seriesBarDistance: 5,
				axisX: {
				labelInterpolationFnc: function (value) {
					return value[0];
				}
				}
			}]
		];
		new Chartist.Bar('.ct-chart', data, options, responsiveOptions);
	}
	loadData();

});

