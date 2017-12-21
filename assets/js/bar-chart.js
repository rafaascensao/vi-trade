/* BARCHART */
function startBarchart(){
  var l = getCountryExport(15)
  categories = ['']
  dollars = []

  opacity = 1.0
  l.forEach(function(element){
    color = productsColors[products.indexOf(getSelectedProduct())]
    element.push(color)
    element.push(opacity-=0.02)
    element[1] = Math.floor(parseFloat(element[1])/1000000)
  });
  var colors = ['#0000b4','#0082ca','#0094ff','#0d4bcf','#0066AE','#074285','#00187B','#285964','#405F83','#416545','#4D7069','#6E9985','#7EBC89','#0283AF','#79BCBF','#99C19E'];

  var w = $('.bar-chart_container').width() - 10
  var h = $('.bar-chart_container').height()
  var padding_left = 70
  var padding_bottom = 15
  var xscale = d3.scale.linear()
                 .domain([0,l.length])
                 .range([0,h-padding_bottom])
  var hscale = d3.scale.linear()
                 .domain([0,l[0][1]])
                 .range([0,w-padding_left])

  var yaxis = d3.svg.axis()
                .orient('Bottom')
                .scale(hscale)
                .tickSize(1)
                .ticks(3)
              //  .tickValues(d3.range(4))

  var xaxis = d3.svg.axis()
                .orient('left')
                .scale(xscale)
                .tickSize(0)
                .tickFormat(function(d,i){ return l[i][0]; })
                .tickValues(d3.range(15));

  var svg, tooltip;
  var grid = [];

  if($(".bar-chart_container svg").length > 0){
    svg = d3.select(".bar-chart_container svg")
    tooltip = d3.select("body .toolTip")

    svg.select("#country_axis").call(xaxis)
    .selectAll(".tick text")
    .call(wrap, padding_left)
    svg.select("#dollars_axis").call(yaxis)

    svg.selectAll("rect")
      .data(l)
       .attr("height",Math.floor(w/l.length)-1)
       .attr("fill",function(d,i){ return 'rgba('+d[2][0]+','+d[2][1]+','+d[2][2]+','+d[3]+')'; })
       .attr("y", function(d, i){ return xscale(i)})
       .attr("x", function(d){ return padding_left })
       .on("mousemove", function(d){
             val = d[1]
               tooltip
                 .style("left", d3.event.pageX - 50 + "px")
                 .style("top", d3.event.pageY - 70 + "px")
                 .style("display", "inline-block")
                 .html(val+" US($) Millions");
           })
       		.on("mouseout", function(d){ tooltip.style("display", "none");});

    svg.select("#dollars_axis").selectAll(".tick").each(function(element){
      var tick = d3.select(this)
      var translate = d3.transform(tick.attr("transform")).translate;
      grid.push(translate[0])
    })

    svg.select("#names_axis")
       .selectAll("rect")
       .remove()
    svg.select("#names_axis")
       .selectAll("rect")
        .data(grid)
          .enter().append("rect")
          .attr("height",h-(padding_bottom*1.5))
          .attr("width", "1")
          .attr("x" , function(d){ return d; })
          .style({'stroke':'#adadad','stroke-width':'1px'})
  }else{
    svg = d3.select(".bar-chart_container").append("svg")
                                           .attr("width",w)
                                           .attr("height",h);

    svg.append("g")
      .attr("transform","translate("+padding_left+","+(h-(padding_bottom*1.5))+")")
      .attr("id","dollars_axis")
      .call(yaxis)


    tooltip = d3.select("body").append("div").attr("class", "toolTip");

    svg.append("g")
      .attr("id","country_axis")
      .attr("transform", "translate("+padding_left+",11)")
      .call(xaxis)
        .selectAll("text")
        .attr("font-size","12px")
        .call(wrap, padding_left)

    svg.selectAll("rect")
      .data(l)
       .enter().append("rect")
       .attr("height",Math.floor(w/l.length)-1)
       .attr("width", 0)
       .attr("fill",function(d,i){ return 'rgba('+d[2][0]+','+d[2][1]+','+d[2][2]+','+d[3]+')'; })
       .attr("y", function(d, i){ return xscale(i)})
       .attr("x", function(d){ return padding_left })
       .on("mousemove", function(d){
             val = d[1]
               tooltip
                 .style("left", d3.event.pageX - 50 + "px")
                 .style("top", d3.event.pageY - 70 + "px")
                 .style("display", "inline-block")
                 .html(val+" US($) Millions");
           })
       		.on("mouseout", function(d){ tooltip.style("display", "none");});

    svg.select("#dollars_axis").selectAll(".tick").each(function(element){
      var tick = d3.select(this)
      var translate = d3.transform(tick.attr("transform")).translate;
      grid.push(translate[0])
    })
    svg.append("g")
       .attr("transform","translate("+padding_left+",0)")
       .attr("id","names_axis")
       .selectAll("rect")
        .data(grid)
          .enter().append("rect")
          .attr("height",h-(padding_bottom*1.5))
          .attr("width", "1")
          .attr("x" , function(d){ return d; })
          .style({'stroke':'#adadad','stroke-width':'1px'})
  }

  var transit_bars = svg.selectAll("rect")
    .data(l)
    .transition()
    .duration(500)
    .attr("width",function(d){ return hscale(d[1])});

}
