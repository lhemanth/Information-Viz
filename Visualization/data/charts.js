//JavaScript code for pie chart, bar graph and scatterPlot
queue()
    .defer(d3.csv, "a1-cars.csv")
    .await(makeGraphs);

//adding colours to car manufacturers
var mfrColors = d3.scale.ordinal()
    .domain(["amc","audi","bmw","buick","cadillac","capri","chevrolet","chrysler","citroen","datsun","dodge","fiat","ford","hi","honda","mazda","mercedes","mercury","nissan","oldsmobile","peugeot","plymouth","pontiac","renault","saab","subaru","toyota", "triumph", "volvo", "vw"])
    .range(["#6D214F","#B33771","##F97F51","##182C61","##3B3B98","##1B9CFC","##FC427B","##FD7272","#EAB543","##82589F","##ffa801","#f53b57" , "#ef5777", "#3c40c6","#3c40c6","#575fcf","#05c46b","#0be881","#f7b731","#fa8231","#eb3b5a","#2d98da","#3867d6","#8854d0","#0fb9b1","#f39c12","#d35400","#c0392b","#8e44ad", "#2980b9 "])
//mfr,mpg,cylinders,displacement,horsepower,weight,acceleration,modelyear
function makeGraphs(error, carsData) {
    var ndx = crossfilter(carsData);
    carsData.forEach(function(d) {
        d.mpg = parseInt(d.mpg);
        d.cylinders = parseInt(d.cylinders);
        d.displacement = parseInt(d.displacement);
        d.weight = parseInt(d.weight);
        d.acceleration = parseInt(d.acceleration);
        d.modelyear = parseInt(d.modelyear);
        //d.sodium = parseInt(d.sodium);
    })
//full manufacturer names (dataset just contains letters)
/*    carsData.forEach(function(d) {
        if (d.mfr === "K") {
            d.mfr = "Kellogg's"
        }else if (d.mfr === "G") {
            d.mfr = "General Mills"
        }else if (d.mfr === "P") {
            d.mfr = "Post"
        }else if (d.mfr === "Q") {
            d.mfr = "Quaker Oats"
        }else if (d.mfr === "R") {
            d.mfr = "Ralston Purina"
        } else if (d.mfr === "A") {
            d.mfr = "American Home Food Products"
        } else if (d.mfr === "N") {
            d.mfr = "Nabisco"
        }
    })
*/
    showCerealSelector(ndx);
    showManufacturer(ndx);
    showCalorieContent(ndx);
    showServingSizeCalorieCorrelation(ndx);
    /*showdisplacementPerProduct(ndx);
    showmpgPerProduct(ndx);
    showCarbsPerProduct(ndx);
    showSodiumPerProduct(ndx);
    showaccelerationPerProduct(ndx);
    showSugarPerProduct(ndx);
    */
      dc.renderAll();
}

//dynamice width for responsivene charts
 var width = $(".chart").offsetWidth;

//allows users to select their own cereal preference
function showCerealSelector(ndx) {
    nameDim = ndx.dimension(dc.pluck("name"));
    nameGroup = nameDim.group();

    var name = dc.selectMenu("#cerealSelector")
    name
        .dimension(nameDim)
        .group(nameGroup)
        .title(function(d) {
            return d.key;
        })
}

// Pie Chart looking at number of products per manufacturer
function showManufacturer(ndx) {
    var manufacturerDim = ndx.dimension(dc.pluck("mfr"));
    var manufacturerGroup = manufacturerDim.group();
    var radius = $("#productsPerManufacturer").offsetWidth;

    dc.pieChart("#productsPerManufacturer")
        .height(390)
        .radius(180)
        .innerRadius(100)
        .useViewBoxResizing(true)
        .transitionDuration(1500)
        .colors(mfrColors)
        .colorAccessor(function(d) {
            return d.key
        })
        .dimension(manufacturerDim)
        .group(manufacturerGroup)
        .legend(dc.legend().x(0).y(5).itemHeight(30).gap(25))
        .label(function(d) {
            return d.value;
        })
}

//Bar Chart examing average calorie content by manufacturer
function showCalorieContent(ndx) {

    var manfacturerDim = ndx.dimension(dc.pluck("mfr"));
    var averageCaloriePerProduct = manfacturerDim.group().reduce(
        function(p, v) {
            p.count++;
            p.total += v.acceleration;
            p.average = p.total / p.count;
            return p;
        },
        //remove an entry
        function(p, v) {
            p.count--;
            if (p.count == 0) {
                p.total = 0;
                p.average = 0;
            }
            else {
                p.total -= v.acceleration;
                p.average = p.total / p.count;
            }
            return p;
        },
        //initialise values
        function() {
            return { count: 0, total: 0, average: 0 }
        }
    );

    dc.barChart("#calorieContent")
        .width(850)
        .height(420)
        .transitionDuration(2000)
        .dimension(manfacturerDim)
        .group(averageCaloriePerProduct)
        .valueAccessor(function(d) {
            return d.value.average;
        })
        .colors(mfrColors)
        .colorAccessor(function(d) {
            return d.key
        })
        .barPadding(.3)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxis().ticks(10);
}




//weight of serving size (cups) to calorie correlation
function showServingSizeCalorieCorrelation(ndx) {
    var servingDim = ndx.dimension(dc.pluck("horsepower"));

    //var minServing = servingDim.bottom(1)[0].mpg;
    //var maxServing = servingDim.top(1)[0].mpg;


    var calorieDim = ndx.dimension(function(d) {
        return [d.horsepower, d.weight, d.name, d.mfr];
    })

    var calorieGroup = calorieDim.group();

    dc.scatterPlot("#servingSizeCalorieCorrelation")
        .width(width)
        .height(450)
        .transitionDuration(200)
        .x(d3.scale.linear().domain([0,250]))
        .xAxisLabel("horsepower")
        .brushOn(false)
        .symbolSize(8)
        .clipPadding(30)
        .yAxisLabel("weight")
        .title(function(d) {
            return "The car " + d.key[2] + " weights " + d.key[1] + " pounds with a horsepower of " + d.key[0];
        })
        .colors(mfrColors)
        .colorAccessor(function(d) {
            return d.key[3];
        })
        .dimension(calorieDim)
        .group(calorieGroup)
        .xAxis().ticks(10)
}


// d3.select('#resetButton')
//     .on('click', function() {
//       dc.filterAll();
//   		dc.redrawAll();
//
//       dc.filterAll();
//       dc.redrawAll();
// });