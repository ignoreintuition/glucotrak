var glucotrak = glucotrak || {}

glucotrak.log = [];

$.getJSON("/req", function(result){
	$.each(result, function(i, field){
		glucotrak.log.push(field);
	});
});

new Vue({
	el: '#app',
	data: {
		newBloodSugar: null,
		log: glucotrak.log,
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
				var sum = 0;
				for( var i = 0; i < this.log.length; i++ ){
					sum += parseInt( this.log[i].value, 10 ); 
				}
				this.avg = sum / this.log.length;
				this.newBloodSugar = null;
			}
		}
	}
})