d3.csv("data.csv", // 1.a Connect to the data
    function(d) {
      return {
        Country: d.Country,
        Income: +d.Income,
        EcoLoss: +d.EcoLoss,
        HumanLoss: +d.HumanLoss,
        EcoTop: +d.EcoTop,
        HumanTop: +d.HumanTop,
        type: 0
      };
    })
  .then(function(dataset) { // 1.c Do stuff with the data

    console.log(dataset);

    var numDataPoints = dataset.length;

    var width = 500,
      height = 300,
      paddingLarge = 100,
      paddingSmall = 32,
      paddingChart = 50,
      paddingLegend = width / 8,
      scale = 3;

    var greenColors = [
      "rgba(72,224,154,0.3)",
      "rgba(72,224,154,0.6)",
      "rgba(72,224,154,0.9)",
      "rgba(0, 0, 0, 0.4)"
    ];

    var redColors = [
      "rgba(229,16,62,0.3)",
      "rgba(229,16,62,0.6)",
      "rgba(229,16,62,0.9)",
      "rgba(0, 0, 0, 0.4)"
    ];

    var forces,
      forceSimulation,
      forceSimulationEco,
      forceSimulationHuman;

    createSVGEco();
    createSVGHuman();
    createSVGLegend();
    mayTheForceBe();

    makeTheEcoCircles();
    createForceSimulationEco();
    makeTheHumanCircles();
    createForceSimulationHuman();
    addGroupingListeners();


    function createSVGEco() {
      svgEco = d3.select("#EcoContent")
        .append("svg")
        .attr("width", width + paddingLarge)
        .attr("height", height + paddingLarge);
    }

    function createSVGHuman() {
      svgHuman = d3.select("#HumanContent")
        .append("svg")
        .attr("width", width + paddingLarge)
        .attr("height", height + paddingLarge);
    }

    function createSVGLegend() {
      svgLegend = d3.select("#EcoContentLegend")
        .append("svg")
        .attr("width", width + paddingLarge)
        .attr("height", height + paddingLarge);
    }

    function createSVGBar() {
      svgBar = d3.select("#barContent")
        .append("svg")
        .attr("width", width + paddingLarge)
        .attr("height", height + paddingLarge);
    }

    function makeTheEcoCircles() {
      circlesEco = svgEco.selectAll("Eco")
        .data(dataset)
        .enter()
        .append("circle")
        .classed(" ", true)
        .attr("class", "Eco")
        .attr("id", function(d) {
          return d.Income;
        })
        .attr("r", function(d) {
          if (d.EcoLoss == "0") {
            var dataMean = d3.mean(dataset, function(d) {
              return d.EcoLoss;
            });
            return Math.sqrt((dataMean / 2) / Math.PI);
          } else {
            return Math.sqrt(d.EcoLoss / Math.PI);
          }
        })
        .attr("fill", function(d) {
          return greenColors[d.Income];
        })
        .on("mouseover", function(d) {
          console.log(d.Country);
          updateCountryInfo(d.Country + " had " + d3.format(",.3r")(d.EcoLoss) + " USD Losses from natural disasters");
        })
        .on("mouseout", function(d) {
          updateCountryInfo("...");
        });

      function updateCountryInfo(number) {
        d3.select("#HoverInfo")
          .text(number);
        d3.select("#HoverInfo2")
          .text(number);
        d3.select("#HoverInfo3")
          .text(number);
      }
    }

    function makeTheHumanCircles() {
      circlesHuman = svgHuman.selectAll("Human")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("class", "Human")
        .attr("id", function(d) {
          return d.Income;
        })
        .attr("r", function(d) {
          if (d.HumanLoss <= 0) {
            var dataMean = d3.mean(dataset, function(d) {
              return d.HumanLoss;
            });
            return Math.sqrt((dataMean / 2) / Math.PI);
          } else {
            return Math.sqrt(d.HumanLoss / Math.PI);
          }
        })
        .attr("fill", function(d) {
          return redColors[d.Income];
        })
        .on("mouseover", function(d) {
          console.log(d.Country);
          updateCountryInfo(d.Country + " had " + d3.format(",.3r")(d.HumanLoss) + " deaths from natural disasters");
        })
        .on("mouseout", function(d) {
          updateCountryInfo("...");
        });

      function updateCountryInfo(number) {
        d3.select("#HoverInfo")
          .text(number);
        d3.select("#HoverInfo2")
          .text(number);
        d3.select("#HoverInfo3")
          .text(number);
      }
    }

    function mayTheForceBe() {
      var forceStrength = 0.05;

      forces = {
        center: centerForce(),
        sortIncomeBracket: sortIncomeBracketForce(),
        sortTopCountries: sortTopCountriesForce(),
        barScatter: barScatterForce()
      };

      function barScatterForce() {
        return {
          x: d3.forceX(width / 2).strength(forceStrength),
          y: d3.forceY(-1000).strength(forceStrength)
        };
      }

      function centerForce() {
        return {
          x: d3.forceX(centerForceX).strength(forceStrength),
          y: d3.forceY(centerForceY).strength(forceStrength)
        };

        function centerForceX(d) {

          if (this.className == "Eco") {
            console.log(this.className);
            return width * 2;
          } else {
            return width / 2;
          }

        }

        function centerForceY(d) {

          if (this.className == "Eco") {
            console.log(this.className);
            return height * 2 - paddingSmall;
          } else {
            return height / 2;
          }

        }

        function centerScreenForceX() {
          return d3.forceX(width / 2).strength(forceStrength);
        }

        function centerScreenForceY() {
          return d3.forceY(height / 2).strength(forceStrength);
        }

        function offScreenForceX() {
          return d3.forceX(width * 20 * Math.random()).strength(forceStrength);
        }

        function offScreenForceY() {
          return d3.forceY(width * 20 * Math.random()).strength(forceStrength);
        }

      }

      function sortIncomeBracketForce() {
        var sortIncomeBracketStrength = 0.03;
        return {
          x: d3.forceX(incomeBracketForceX).strength(sortIncomeBracketStrength),
          y: d3.forceY(incomeBracketForceY).strength(sortIncomeBracketStrength)
        };

        function incomeBracketForceX(d) {
          if (d.Income == "0") {
            return lowX(width);
          } else if (d.Income == "1") {
            return middleX(width);
          } else if (d.Income == "2") {
            return heighX(width);
          } else if ((d.Income == "3")) {
            return noDataX(width);
          } else {
            return 20 * Math.random();
          }
        }

        function incomeBracketForceY(d) {
          if (d.Income == "0") {
            return lowY(height);
          } else if (d.Income == "1") {
            return middleY(height);
          } else if (d.Income == "2") {
            return heighY(height);
          } else if ((d.Income == "3")) {
            return noDataY(height);
          } else {
            return 20 * Math.random();
          }
        }

        function lowY(dimension) {
          return dimension * (1 / 2);
        }

        function middleY(dimension) {
          return dimension * (1 / 2);
        }

        function heighY(dimension) {
          return dimension * (1 / 2);
        }

        function noDataY(dimension) {
          return dimension - paddingChart;
        }

        function lowX(dimension) {
          return paddingChart;
        }

        function middleX(dimension) {
          return dimension * (1 / 2);
        }

        function heighX(dimension) {
          return dimension - paddingChart;
        }

        function noDataX(dimension) {
          return dimension - paddingChart;
        }
      }

      function sortTopCountriesForce() {
        return {
          x: d3.forceX(TopCountriesForceX).strength(forceStrength),
          y: d3.forceY(TopCountriesForceY).strength(forceStrength)
        };

        function TopCountriesForceX(d) {
          if (d.EcoTop || d.HumanTop >= 1) {
            return width / 2;
          } else {
            return width * 2;
          }
        }

        function TopCountriesForceY(d) {
          if (d.EcoTop || d.HumanTop >= 1) {
            return height / 2;
          } else {
            return height * 2;
          }
        }
      }
    }

    function createForceSimulationHuman() {

      forceSimulationHuman = d3.forceSimulation()
        .force("x", forces.center.x)
        .force("y", forces.center.y)
        .force('collision',
          d3.forceCollide().radius(forceCollideHuman));

      forceSimulationHuman.nodes(dataset)
        .on("tick", function() {
          circlesHuman
            .attr("cx", function(d) {
              return d.x;
            })
            .attr("cy", function(d) {
              return d.y;
            });
        });
    }

    function createForceSimulationEco() {

      forceSimulationEco = d3.forceSimulation()
        .force("x", forces.center.x)
        .force("y", forces.center.y)
        .force('collision',
          d3.forceCollide().radius(forceCollideEco));

      forceSimulationEco.nodes(dataset)
        .on("tick", function() {
          circlesEco
            .attr("cx", function(d) {
              return d.x;
            })
            .attr("cy", function(d) {
              return d.y;
            });
        });
    }

    function addGroupingListeners() {
      addListener("#Home", forces.center);
      addListener("#reset", forces.center);
      addListener("#IncomeBracket", forces.sortIncomeBracket);
      addListener("#TopCountries", forces.sortTopCountries);
      addListener("#Bar", forces.barScatter);

      function addListener(selector, forces) {
        d3.select(selector).on("click", function() {
          updateEcoForces(forces);
          updateHumanForces(forces);
        });
      }
    }

    function updateEcoForces(forces) {
      forceSimulationEco
        .force("x", forces.x)
        .force("y", forces.y)
        .force('collision',
          d3.forceCollide().radius(forceCollideEco))
        .alphaTarget(0.5)
        .restart();
    }

    function updateHumanForces(forces) {
      forceSimulationHuman
        .force("x", forces.x)
        .force("y", forces.y)
        .force('collision',
          d3.forceCollide().radius(forceCollideHuman))
        .alphaTarget(0.5)
        .restart();
    }

    function forceCollideEco(d) {
      if (d.EcoLoss <= 0) {
        var dataMean = d3.mean(dataset, function(d) {
          return d.EcoLoss;
        });
        return Math.sqrt((dataMean / 2) / Math.PI) + 2;
      } else {
        return Math.sqrt(d.EcoLoss / Math.PI) + 2;
      }

    }

    function forceCollideHuman(d) {
      if (d.HumanLoss <= 0) {
        var dataMean = d3.mean(dataset, function(d) {
          return d.HumanLoss;
        });
        return Math.sqrt((dataMean / 2) / Math.PI) + 2;
      } else {
        return Math.sqrt(d.HumanLoss / Math.PI) + 2;
      }
    }

    var xScale = d3.scaleBand()
      // 3.a. Set the domain to the countries
      .domain(dataset.map(
        function(d) {
          return d.years;
        }
      ))
      .rangeRound([paddingSmall, width - paddingSmall])
      .paddingInner(0.05);

    var yScale = d3.scalePow()
      // 3.b. Set the domain to the s
      .exponent(1)
      .domain([0, d3.max(dataset,
        function(d) {
          return d.EcoLoss;
        })])
      .range([height - paddingSmall, paddingSmall]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // CODE OF THIS SECTION IS MODIFIDED FROM THIS SITE: https://bl.ocks.org/lorenzopub/90d90746af84f1fe3d782d47f3739a30

    // The scale you use for bubble size
    var size = d3.scaleSqrt()
      .domain([0, 1]) // What's in the data, let's say it is percentage
      .range([1, 50]); // Size in pixel
    var EcoDataMax = d3.max(dataset, function(d) {
      return d.EcoLoss;
    });
    var valuesToShow = [
      d3.format(",.3r")(Math.abs(EcoDataMax)),
      d3.format(",.3r")(Math.abs(EcoDataMax / 2)),
      d3.format(",.3r")(Math.abs(EcoDataMax / 4))
    ];
    var xCircle = width - paddingLegend;
    var xLabel = width - 16;
    var yCircle = height;

    // Add legend: circles
    svgLegend
      .selectAll("legend")
      .data(valuesToShow)
      .enter()
      .append("circle")
      .attr("cx", xCircle)
      .attr("cy", function(d) {
        return yCircle - size(d);
      })
      .attr("r", function(d) {
        return size(d);
      })
      .style("fill", "transparent")
      .attr("stroke", "rgba(229,16,62,0.9)");

    console.log(valuesToShow);

    // Add legend: Lines
    svgLegend
      .selectAll("legend")
      .data(valuesToShow)
      .enter()
      .append("line")
      .attr('x1', function(d) {
        return xCircle + size(d);
      })
      .attr('x2', xLabel)
      .attr('y1', function(d, i) {
        return yCircle - size(d) + 3 * i;
      })
      .attr('y2', function(d, i) {
        return yCircle - size(d) + 3 * i;
      })
      .attr('stroke', 'rgba(229,16,62,0.9)')
      .style('stroke-dasharray', ('2,2'));

    // Add legend: labels
    svgLegend
      .selectAll("legend")
      .data(valuesToShow)
      .enter()
      .append("text")
      .attr("class", "LegendText")
      .attr('x', xLabel)
      .attr('y', function(d, i) {
        return yCircle - size(d) + 3 * i;
      })
      .text(function(d) {
        return d;
      })
      .style("font-size", 10)
      .style("fill", "rgba(229,16,62,0.9)")
      .attr('alignment-baseline', 'middle');

    d3.select("#showLegend").on("click", function() {

      svgLegend
        .transition()
        .ease(d3.easePolyInOut)
        .attr('y', -100);

    });

  });
