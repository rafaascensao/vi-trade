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
    }
  });
  $('.timeline .slider .slide').append("<div class='left-slide'><div class='min-max-year'>1989</div></div><div class='right-slide'><div class='min-max-year'>2015</div></div>")
  $('.timeline .slider .slide span').append("<div class='year'></div>")
  $( "#amount" ).val( $( "#slider-range-max" ).slider( "value" ) );
  $('.timeline .slider .slide span .year').text(year+'')

  function toggleButtons(){
    $(this).parent().find('p').toggleClass('hidden-class')
    if($(this).parent().find('p:not(.hidden-class)').text() == "Country"){
      currentView = "Country"
      toggleViews()
    }else if ($(this).parent().find('p:not(.hidden-class)').text() == "Product") {
      currentView = "Product"
      toggleViews()
      refreshBarChart();
    }
    mapObj.updateMap(currentView)
  }
  function selectProduct(){
    $(this).parent().children().removeClass('selected')
    $(this).addClass('selected')
    mapObj.fillCloropleth($(this).attr('product'))
    refreshBarChart()
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
