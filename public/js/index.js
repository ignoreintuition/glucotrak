var glucotrak = glucotrak || {}

glucotrak.log = [];
glucotrak.user = '';

$.getJSON("/user", function(result){
	glucotrak.user = result.username;
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
		render()		
	})
}).fail(function(){
	console.log('fail to parse user');
}).always(function(){
	render();
});

function render() {
	var vm = new Vue({
		el: '#app',
		data: {
			newBloodSugar: null,
			log: glucotrak.log,
			name: glucotrak.user,
			avg: 0
		},
		methods: {
			addBloodSugar: function() {
				var val = this.newBloodSugar.trim();
				if (val) {
					this.log.splice(0, 0, {
						value: val,
						date: Date(Date.now()).toLocaleString('en-US')
					});
					$.post('/resp', {
						value: val,
						date: Date(Date.now()).toLocaleString('en-US')
					});
				}
				this.newBloodSugar = null;
			},
			avgBloodSugar: function(){
				var sum = 0;
				for( var i = 0; i < this.log.length; i++ ){
					sum += parseInt( this.log[i].value, 10 ); 
				}
				this.avg = sum / this.log.length;
			}
		}
	})
	
}