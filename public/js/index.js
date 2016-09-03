var glucotrak = glucotrak || {}

glucotrak.log = [];
glucotrak.user = '';
try {
	$.getJSON("/user", function(result){
		glucotrak.user = result.username || "";
	}).done(function() {
		$.getJSON("/req", function(result){
			$.each(result, function(i, field){
				glucotrak.log.push(field);
			})		
		}).done(function(){
			console.log('successfully parsed log')
		}).fail(function(){
			console.log('failed to parse log')
		}).always(function(){
			render();		
		})
	}).fail(function(){
		console.log('fail to parse user');
	}).always(function(){
		render();
	});
}
catch(err){
	console.log(err);
}

function render() {
	var vm = new Vue({
		el: '#app',
		data: {
			newBloodSugar: null,
			log: glucotrak.log,
			name: glucotrak.user,
			avg: calcAvg(glucotrak.log)
		},
		methods: {
			addBloodSugar: function() {
				var val = this.newBloodSugar.trim();
				var id = uuid.v1();
				if (val) {
					this.log.splice(0, 0, {
						guid: id,
						value: val,
						date: Date(Date.now()).toLocaleString('en-US')
					});
					$.post('/resp', {
						guid: id,
						value: val,
						date: Date(Date.now()).toLocaleString('en-US')
					});
				}
				this.newBloodSugar = null;
				this.avg = calcAvg(this.log);
			},
			delete: function(item){
				$.post('/del', {
					guid: item.guid
				});					
				this.log.$remove(item);

			}
		}
	})	
}

function calcAvg(log){
	var sum = 0;
	for( var i = 0; i < log.length; i++ ){
		sum += parseInt( log[i].value, 10 ); 
	}
	avg = sum / log.length;
	return avg;
}