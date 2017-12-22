function startTimeline(){
  /*
    Calls:
      fillCloropleth(product)
      refreshBarChart()
      toggleFlowChoroplethMap(bool choropleth_map,bool flow_map)
    Defines:
      toggleButtons()
      selectProduct()
  */
  $('.timeline .options p').click(toggleButtons);
  $('.description > div').click(selectProduct);
  $( ".timeline .slider .slide" ).slider({
    range: "max",
    min: 1989,
    max: 2015,
    value: year,
    slide: function( event, ui ) {
      $( "#amount" ).val( ui.value );
      if(ui.value == 1989 || ui.value == 2015)
        $('.timeline .slider .slide span .year').text('')
      else
        $('.timeline .slider .slide span .year').text(ui.value);
      year = ui.value
      if(currentView == 'Product'){
        mapObj.fillCloropleth(getSelectedProduct())
      }
      //
      refreshBarChart()
      refreshDotMatrixChart(selectedCountry,chart_options)
      if(!firstTime)
        clevChart.update(generateDataDot(selectedCountry, " World",year))

    }
  });
  $('.timeline .slider .slide').append("<div class='left-slide'><div class='min-max-year'>1989</div></div><div class='right-slide'><div class='min-max-year'>2015</div></div>")
  $('.timeline .slider .slide span').append("<div class='year'></div>")
  for(var i = min_year+3 ; i < max_year ; i+= 5){
    var scale = d3.scale.linear().range([0, 100]).domain([1989, 2015])
    $('.timeline .slider .slide').append("<div style='left:"+scale(i)+"%; position:absolute;height:10px;width:2px;background:black;top:-4px;'><p style='position:absolute; left:-17px; top:8px;'>"+i+"</p></div>    ")
  }
  $( "#amount" ).val( $( "#slider-range-max" ).slider( "value" ) );
  $('.timeline .slider .slide span .year').text(year+'')

  function toggleButtons(){
    $(this).parent().find('p').toggleClass('hidden-class')
    if($(this).parent().find('p:not(.hidden-class)').text() == "Country"){
      if( $('.timeline .buttons > div:last-child input').val() == 0){
        alert("Please select a country!")
        $(this).parent().find('p').toggleClass('hidden-class')
      }else{
        currentView = "Country"
        toggleViews()
      }
    }else if ($(this).parent().find('p:not(.hidden-class)').text() == "Product") {
      currentView = "Product"
      toggleViews()
      refreshBarChart();
    }else if  ($(this).parent().find('p:not(.hidden-class)').text() == "Export"){
      flow = "Export"
      if(currentView != "Product"){
        checkFirstTime()
        refreshViews()
      }else{
        refreshBarChart()
      }
    }else if  ($(this).parent().find('p:not(.hidden-class)').text() == "Import"){
      flow = "Import"
      if(currentView != "Product"){
        checkFirstTime()
        refreshViews()
      }else{
        refreshBarChart()
      }
    }
    mapObj.updateMap(currentView)
  }
  function selectProduct(){
    $(this).parent().children().removeClass('selected')
    $(this).addClass('selected')
    mapObj.fillCloropleth($(this).attr('product'))
    refreshBarChart()
    refreshTitleBarChart()

  }
}
function checkFirstTime(){
  if(firstTime == true){
    console.log("FIRST TIME")
    currentView = "Country"
    toggleViews()
    clevelandDotPlot()
    firstTime = false
  }
}
function toggleViews(){
  if(currentView == "Product"){
    $('.country_view').addClass('hide');
    $('.cleveland_dot_plot').addClass('hide');
    $('.bar-chart_container').removeClass('hide')
    $('.description').removeClass('country-view')
  }else{
    $('.country_view').removeClass('hide');
    $('.cleveland_dot_plot').removeClass('hide');
    $('.bar-chart_container').addClass('hide')
    $('#bar_chart svg > *').remove();
    $('.description').addClass('country-view')
  }
}

function filterCountries(){
  var that = this, $allListElements = $('.timeline .buttons > div:last-child > .list .item');

  var $matchingListElements = $allListElements.filter(function(i, li){
      var listItemText = $(li).text().toUpperCase(), searchText = that.value.toUpperCase();
      return ~listItemText.indexOf(searchText);
  });

  $allListElements.hide();
  $matchingListElements.show();
}
