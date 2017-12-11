/* BARCHART */
/*Simple Bar Chart*/
function barchart() {
  var svg = d3.select("#bar_chart svg"),
      margin = {top: 20, right: 20, bottom: 30, left: 80},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

  var tooltip = d3.select("body").append("div").attr("class", "toolTip");

  var x = d3.scale.linear().range([0, width]);
  var y = d3.ordinal().range([height, 0]);

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = globalProducts[getSelectedProduct()][year]
    data.sort(function(a, b) { return a.value - b.value; });

    x.domain([0, d3.max(data, function(d) { return d.value; })]);
    y.domain(data.map(function(d) { return d.area; })).padding(0.1);

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height]));

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    g.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", function(d) { return y(d.area); })
        .attr("width", function(d) { return x(d.value); })
        .on("mousemove", function(d){
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html((d.area) + "<br>" + "£" + (d.value));
        })
        .on("mouseout", function(d){ tooltip.style("display", "none");});
};

function refreshBarChart(){
  $('#bar_chart svg > *').remove();
  startBarchart()
}

function startBarchart(){
 var l = getCountryExport(15)
 categories = ['']
 dollars = []
  l.forEach(function(element){
  	categories.push(element[0])
  	dollars.push(Math.floor(parseFloat(element[1])/1000000))
  });

  //  var categories= ['','Accessories', 'Audiophile', 'Camera', 'Cell Phones', 'Computers','eBook Readers','Gadgets','GPS ','Home Audio','Office','Portable Audio','Portable Video','Security ','Service','Television ','Car & Vehicle'];
  //  var dollars = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
  var colors = ['#0000b4','#0082ca','#0094ff','#0d4bcf','#0066AE','#074285','#00187B','#285964','#405F83','#416545','#4D7069','#6E9985','#7EBC89','#0283AF','#79BCBF','#99C19E'];

  /* Y2 ALTURA DO GRAFICO */
  var grid = d3.range(8).map(function(i){
    return {'x1':0,'y1':0,'x2':0,'y2':$('.bar-chart_container').height() - 10 };
  });

  var tickVals = grid.map(function(d,i){
    /*if(i>0){ return i*22; }
    else if(i===0){ return "100";}*/
    return 0
  });


  /* DOMAIN [MININO , MAXIMO EXPORTADO]
     RANGE [0, LARGURA DA DIV]
  */
  var xscale = d3.scale.linear()
    .domain([1,dollars[0]])
    .range([0,$('.bar-chart_container').width() - 110]);


  /* DOMAIN [0, NUMERO PAISES]
     RANGE [0, ALTURA DA DIV]
  */
  var yscale = d3.scale.linear()
    .domain([0,categories.length])
    .range([0,$('.bar-chart_container').height() - 30]);


  var colorScale = d3.scale.quantize()
    .domain([0,categories.length])
    .range(colors);

  var canvas = d3.select('#bar_chart svg');
  var tooltip = d3.select("#bar_chart").append("div").attr("class", "toolTip");

  var grids = canvas.append('g')
    .attr('id','grid')
    .attr('transform','translate(100,10)')
    .selectAll('line')
    .data(grid)
    .enter()
    .append('line')
    .attr({'x1':function(d,i){ return i*30; },
      'y1':function(d){ return d.y1; },
      'x2':function(d,i){ return i*30; },
      'y2':function(d){ return d.y2 - 35; },
    })
    .style({'stroke':'#adadad','stroke-width':'1px'});

  var	xAxis = d3.svg.axis();
  xAxis
    .orient('bottom')
    .scale(xscale)
    .tickSize(2)
    .tickValues(tickVals);

  var	yAxis = d3.svg.axis();
  yAxis
    .orient('left')
    .scale(yscale)
    .tickSize(2)
    .tickFormat(function(d,i){ return categories[i]; })
    .tickValues(d3.range(17));


  var y_xis = canvas.append('g')
    .attr("transform", "translate(100,0)")
    .attr('id','yaxis')
    .call(yAxis);

  var x_xis = canvas.append('g')
    .attr("transform", "translate(100,450)")
    .attr('id','xaxis')
    .call(xAxis);

  color = productsColors[products.indexOf(getSelectedProduct())]
  opacity = 1.0
  //rgbacolor = 'rgba('+color[0]+','+color[1]+','+color[2]+','+(opacity-=0.05)+')'
  var chart = canvas.append('g')
    .attr("transform", "translate(100,0)")
    .attr('id','bars')
    .selectAll('rect')
    .data(dollars)
    .enter()
    .append('rect')
    .attr('height',19)
    .attr({'x':0,'y':function(d,i){ return yscale(i)+19; }})
    .style('fill',function(d,i){ return 'rgba('+color[0]+','+color[1]+','+color[2]+','+(opacity-=0.02)+')'; })
    .attr('width',function(d){ return 0; })
    .on("mousemove", function(d){
          val = Math.floor(parseFloat(getCountryExport(15)[dollars.indexOf(d)][1])/1000)
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html(val+" US($) Millions");
        })
    		.on("mouseout", function(d){ tooltip.style("display", "none");});;


  var transit = d3.select("svg").selectAll("rect")
    .data(dollars)
    .transition()
    .duration(1000)
    .attr("width", function(d) {return xscale(d); });

  /*
  var transitext = d3.select('#bars')
    .selectAll('text')
    .data(dollars)
    .enter()
    .append('text')
    .attr({'x':function(d) {return xscale(d)-100; },'y':function(d,i){ return yscale(i)+35; } })
    .text(function(d){ return d+"$"; }).style({'fill':'#fff','font-size':'14px'});
  */

  d3.select('#bar_chart svg #yaxis').selectAll('text').attr('font-size','12px')

}
