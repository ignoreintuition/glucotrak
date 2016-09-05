var glucotrak 	= glucotrak || {};
var vm 			= vm || {};

glucotrak.range = {"high": 110, "low": 70};
glucotrak.log = [];
glucotrak.user = '';

glucotrak.getData = function() {
	try {
		$.getJSON("/user", function(result){
			glucotrak.user = result.username || "";
		}).done(function() {
			$.getJSON("/req", function(result){
				$.each(result, function(i, field){
					field.date = moment(field.date).format('YYYY-MM-DDThh:mm');
					field.dateFormat = moment(field.date).format('llll');
					glucotrak.log.push(field);
				})		
			}).done(function(){
				console.log('successfully parsed log')
			}).fail(function(){
				console.log('failed to parse log')
			}).always(function(){
				glucotrak.render();		
			})
		}).fail(function(){
			console.log('fail to parse user');
		}).always(function(){
			glucotrak.render();
		});
	}
	catch(err){
		console.log(err);
	}
}

glucotrak.getData();

glucotrak.render = function() {
	vm = new Vue({
		el: '#app',
		data: {
			newBloodSugar: null,
			log: glucotrak.log,
			name: glucotrak.user,
			writable: false
		},
		methods: {
			addBloodSugar: function() {
				var val = this.newBloodSugar.trim();
				var id = uuid.v1();
				if (val) {
					this.log.splice(0, 0, {
						guid: id,
						value: val,
						date: moment().format('YYYY-MM-DDThh:mm'),
						dateFormat: moment().format('llll'),
						writable:false
					});
					$.post('/resp', {
						guid: id,
						value: val,
						date: moment().format('YYYY-MM-DDThh:mm'),
						dateFormat: moment().format('llll'),
						writable: false
					});
				}
				this.newBloodSugar = null;
				this.avg = glucotrak.calcAvg(this.log);
			},
			delete: function(item){
				$.post('/del', {
					guid: item.guid
				});					
				this.log.$remove(item);
				this.avg = glucotrak.calcAvg(this.log);
			},
			edit: function(item){
				item.writable = true
			},			
			cancel: function(item){
				item.writable = false
			},

			moment: function(){
				return moment();
			}
		},
		computed: {
			avg: {
				cache: false,
				get: function () {
					return glucotrak.calcAvg(this.log);
				}
			}
		},
		filters: {
			limit: function(arr, limit) {
				return arr.slice(0, limit)
			}
		}
	})	
}

glucotrak.calcAvg = function(log){
	var sum = 0;
	for( var i = 0; i < log.length; i++ ){
		sum += parseInt( log[i].value, 10 ); 
	}
	avg = glucotrak.round(sum / log.length, 2);
	return avg;
}


glucotrak.round = function(number, precision) {
	var factor = Math.pow(10, precision);
	var tempNumber = number * factor;
	var roundedTempNumber = Math.round(tempNumber);
	return roundedTempNumber / factor;
};

$.webshims.polyfill('forms forms-ext');