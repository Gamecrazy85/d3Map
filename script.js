//Loops though each record looking for matching id values
//If none are found, return a 0 value for the ID 
function search(idKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].id === idKey) {
            return myArray[i];
        } else if (i === myArray.length - 1) {
			return {'id': idKey, 'qty': 0};
		}
   }
}
//aggrigates data
function sum_qty(rawData){
	var theData = new jinqJs()
				.from(rawData)
				.groupBy('id')
				.sum('qty')
				.select();
	return theData;
}
function count_qty(rawData) {
	var theData = new jinqJs()
		.from(rawData)
		.groupBy('qty')
		.count('id')
		.select();
	return 	theData;
}
function high(theData){
	var temp_max = new jinqJs()
		.from(theData)
		.max('qty')
		.select();
	return temp_max;
}
//Aggrigated data is attached to svg paths via loop
function attach(theData) {	
	//Assigns a color value that coresponds to the scale in the domain
	var color = d3.scale.linear()
		.domain([0,high(theData)])
		.range(['#ffffff', '#990000']);

	d3.selectAll('path').each(function(d, i) { 
		d3.select(this)
		//Calls search function to ensure correct data is attached to each path
		.datum(search(this.id,theData))
		//Calls color variable to add fill style to the path
		.style('fill',function(d) { return color(d.qty); }
		);
	});
}
function map(){ 
	d3.tsv('path.tsv', function(error, path_data) {
		d3.select('#viz')
		.selectAll('path')
		.data(path_data)
		.enter()
		.append('path')
		.attr('d', function(d) {return d.path;})
		.attr('id', function columnid(d) {return d.column;});
	});
	
	function get_data(file_name) {
		d3.csv(file_name, function(error, rawData) {
				rawData.forEach(function(d) {
					d.qty = +d.qty;
				});
				var aggrigation = sum_qty(rawData);
				attach(aggrigation);
			});	
	}
	
	d3.select('#measure').on('change', function () {
		var choice = this.options[this.selectedIndex].value;
		if (choice === '1') {
			d3.select('#viz')
				.selectAll('path')
				.style('fill', '#ffffff');
		} else if (choice === '2') { 
			get_data('data2.csv');
		} else if (choice ==='3') {
			get_data('picks.csv');
		}
	});
}

function bars() {
	d3.csv('data2.csv', function(error, rawData) {
		rawData.forEach(function(d) {
			d.qty = +d.qty;
		});
		
		var theData = count_qty(rawData);
		var width = 1869.9;
		var height = 401.9;
		var barWidth = height / theData.length;
		
		var y = d3.scale.linear()
  		  .range([height-15, 0])
		  .domain([0, d3.max(theData, function(d) { return d.id; })]);
		
		var bar = d3.select('#viz')
			.selectAll('g')
			.data(theData)
			.enter().append('g')
			.attr('transform', function(d, i) { return 'translate(' + i * barWidth + ',0)'; });
		
		bar.append('rect')
			.attr('class', 'bars')
			.attr('width', barWidth - 1)
			.attr('height', function(d) { return height - y(d.id); })
      		.attr('y', function(d) { return y(d.id); });
			
		bar.append('text')
	    	.attr("x", barWidth / 4)
    		.attr("y", function(d) { return y(d.id) - 15; })
    		.attr("dy", ".75em")
    		.text(function(d) { return d.id; });
	});		
}

function reset_svg() {
	 d3.selectAll("svg *").remove();
}

function show_measures() {
	d3.select('svg, #measure').style('display', 'unset');	
}

function hide_measures() {
	d3.select('svg, #measure').style('display', 'none');
}


//hide elements till ready for then
d3.select('svg, #measure').style('display', 'none');

//Selection of view type triggers functionality
d3.select('#view').on('change', function() {
	if (this.options[this.selectedIndex].value === '1') {
		reset_svg();
		hide_measures();
	} else if (this.options[this.selectedIndex].value === '2') {
		reset_svg();	
		show_measures();
		map();
	} else if (this.options[this.selectedIndex].value === '3') {
		reset_svg();
		show_measures();
		bars();
	}
});






