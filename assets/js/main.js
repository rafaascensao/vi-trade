// Trade dataset
var dataset;
var countries_map;
var min_year = 1989, max_year = 2015;
var year = 2004;
var countries;
var products = ["Textiles and Clothing","Wood","Minerals","Food Products", "Chemicals", "Plastic or Rubber","Animal", "Fuels", "Mach and Elec"];
//var productfile = {"Textiles and Clothing", "Wood","Minerals","Food Products", "Chemicals", "Plastic or Rubber","Animal", "Fuels", "Mach and Elec"}
var globalProducts;
var countriesCodes = {};
var productsColors = [[42,147,0],[102,51,0],[102,204,255],[0,51,153],[255,255,0],[112,48,160],[192,0,0],[255,153,0],[255,153,255]]
//Include html
w3.includeHTML(startViews);

// MAIN INSIDE THIS FUNCTION ONLY
function startViews(){
  //Removes loading
  open();
  startTimeline()
  startMap()
}



/* Open file and shit */
function open(){
  d3.csv("../../dataGather/exports.csv", function(data){
    dataset = data;
    generateCountriesList();   //set countries
    generateCodesDic();        //set countriesCodes[country]
    getSumProducts(products);  //set globalProducts
    $('.loader').addClass('hidden')
    $('.row').removeClass('hidden')
  })
}

//set countriesCodes[country]
function generateCodesDic(){
  var codes;
  d3.csv("../../dataGather/countryCodes.csv", function(data){
    codes = data;
    countries.forEach(function(country){
      code = codes.filter(function(el){ return el["Name"] == country})
      countriesCodes[country] = code[0]["Code"];
    })

  })
}

//set countries
function generateCountriesList(){
  x = []
  dataset.filter(function(element){
    if( x.indexOf(element["Reporter Name"]) < 0){
	  x.push(element["Reporter Name"])
    }
  })
  dataset.filter(function(element){
    if( x.indexOf(element["Partner Name"]) < 0){
	  x.push(element["Partner Name"])
    }
  })
  countries = x
}

function getSelectedProduct(){
  return $('.description > div.selected').attr('product')
}

//set globalProducts
function getSumProducts(listProducts){
  // QUERY
  all = {}
  var sums;
  d3.csv("../../dataGather/derived.csv", function(data){
  listProducts.forEach(function(product){
  	 console.log("Computing " + product)
  	 count = {}
  	 countries.forEach(function(country){
        results = data.filter(function(element){
          return element["Product Group"] == product && element["Reporter Name"] == country && element["Trade Flow"] == 'Export'; })
		    count[country] = {}
        for(i = min_year; i <= max_year; i++){
          count[country][i] = results[0][i]
        }
      })
    all[product] = count
  	})
  	globalProducts = all
  })
  }

function computeQuintiles(product){
  x = []
  countries.forEach(function(count){
    if (count != " World" && count != "European Union"){
    x.push(parseFloat(globalProducts[product][count][year]))}
  })

  x = x.sort(function(a,b){ return a-b})
  step = Math.floor(x.filter(function(el){ return el != 0 }).length*0.25)

  return step
}

//associative array=> country_key: export_value
function getCountryExport(top){
  //associative array=> country_key: export_value
  cur_product = getSelectedProduct()
  var country_export={};
  countries.forEach(function(c){
    if (c != " World" && c != "European Union"){
      country_export[c]=globalProducts[cur_product][c][year]
    }
  })
  //sorts the array by value
  var items = Object.keys(country_export).map(function(key) {
    return [key, country_export[key]];
  });

  // Sort the array based on the second element
  items.sort(function(first, second) {
      return second[1] - first  [1];
  });
    //returns the first 15 elements of an array
    return items.slice(0,top)
}
