var groupdata =[];
d3.csv("data/a1-cars.csv", function(error, data) {
            if (error) {
               throw error;
            }
            BarChart(data); 
                });

function BarChart(data){

    var readData = d3.nest()
                    .key(function(d) { return d["Model Year"]; })
                    .key(function(d) { return d.Origin; })                                   
                    .rollup(function(v) { return d3.mean(v, function(d) { return d.MPG; }); })
                    .object(data);

var keys= d3.keys(readData);
 keys.forEach(function(element)
{
   var storeData = {};

   storeData["Year"] = +element;
     storeData["Japanese"] = readData[element].Japanese;

   groupdata.push(storeData);
 });


var container = d3.select('#d3'),
    width = 1200,
    height = 500,
    margin = {top: 30, right: 20, bottom: 30, left: 50},
    axisTicks = {qty: 6, outerSize: 0, dateFormat: '%m-%d'},
    barPadding = .1;

var svgContainer = container
   .append("svg")
   .attr("width", width)
   .attr("height", height)
   .append("g")
   .attr("transform", `translate(${margin.left},${margin.top})`);

var xPadding = d3.scaleBand()
	.range([0, width - margin.left - margin.right])
	.padding(barPadding)
	.domain(groupdata.map(d => d.Year));
var xScale = d3.scaleBand();
xScale.domain(['Japanese']).range([0, xPadding.bandwidth()]);
var xAxis = d3.axisBottom(xPadding).tickSizeOuter(axisTicks.outerSize);


var yScale = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);
yScale.domain([0, 50]);   //Domain
var yAxis = d3.axisLeft(yScale).ticks(axisTicks.qty).tickSizeOuter(axisTicks.outerSize);  //Drawing Axis

var model_name = svgContainer.selectAll(".Year")
  .data(groupdata)
  .enter().append("g")
  .attr("class", "Year")
  .attr("transform", d => `translate(${xPadding(d.Year)},0)`);

svgContainer.append("g")
   .attr("class", "x axis")
   .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
   .call(xAxis);
svgContainer.append("g")
   .attr("class", "y axis")
   .call(yAxis);
   
   
   //labelling the data

   svgContainer.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x",-200)
      .attr("dy", "1em")
	  .attr("font-size", "14px")
      .style("text-anchor", "middle")
      .text("Average MPG");
	   svgContainer.append("text")
	.attr('x', 500)
	.attr('y', 468 )
	.attr("font-size", "18px")
	.text("Year")



svgContainer.append("rect")
.attr('x', width-200 )
.attr('y', height - 480 )
.attr('height', '15px')
.attr('width', '15px')
.attr('fill', '#808000')
svgContainer.append("text")
.attr('x', width-180 )
.attr('y', height - 468 )
.text("Japanese")

svgContainer.append("text")
    
	.attr('x', 500)
	.attr('y', height-480)
	.attr("font-size", "20px")
	.text("Average MPG by ModelYears")
	
model_name.selectAll(".bar.Japanese")
  .data(d => [d])
  .enter()
  .append("rect")
  .transition().duration(1000).delay(100)
  .attr("class", "bar Japanese")
  .style("fill","#808000")
  .attr("x", d => xScale('Japanese'))
  .attr("y", d => yScale(d.Japanese))
  .attr("width", xScale.bandwidth())
  .attr("height", d => {
    return height - margin.top - margin.bottom - yScale(d.Japanese)
  })
  .on("mouseover", function(d){tooltip.text(d.Japanese); return tooltip.style("visibility", "visible");})
      .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
  ;
}