angular.module('myApp').service('ChartService', function() {

  //======================================================
  // CHART CREATION FUNCTIONS
  //======================================================
  
  /**
   * function to create a pie chart using the params 
   * @param {*} labels 
   * @param {*} data 
   * @param {*} label 
   * @param {*} htmlElementId 
   */
  this.createPieChart = (labels, data, label, htmlElementId) => {
    // Store chart instances in a map to manage multiple charts
    if (!this.chartInstances) {
        this.chartInstances = {};
    }

    // Check if a chart already exists for the given element ID and destroy it
    if (this.chartInstances[htmlElementId]) {
        this.chartInstances[htmlElementId].destroy();
    }

    var chartConfig = {
        type: "pie",
        data: {
            labels: labels,
            datasets: [
                {
                    backgroundColor: ["#FF6B6B", "#1E90FF", "#FFD166", "#06D6A0", "#8338EC"],
                    borderColor: "#ffffff",
                    borderWidth: 2,
                    data: data,
                },
            ],
        },
        options: {
            title: {
                display: true,
                text: label,
                fontSize: 16,
                fontColor: "#333"
            },
            legend: {
                position: "bottom",
                labels: { fontColor: "#555", fontSize: 14 }
            },
        }
    };
    var ctx = document.getElementById(htmlElementId).getContext('2d');
    // Create a new chart and store its instance
    this.chartInstances[htmlElementId] = new Chart(ctx, chartConfig);
  };

  /*
  function to createABarChart for the given data
  @params type, labels, data, label, text, htmlElementId
  @returns creates bar chart
  */
  this.createBarChart = (type, labels, data, label, text, htmlElementId) => {
    console.log(data, htmlElementId, labels);
    // Store chart instances in a map to manage multiple charts
    if (!this.chartInstances) {
        this.chartInstances = {};
    }

    // Check if a chart already exists for the given element ID and destroy it
    if (this.chartInstances[htmlElementId]) {
        this.chartInstances[htmlElementId].destroy();
    }

    // Check if this is an earnings-related chart
    const isEarningsChart = htmlElementId === 'topHighestEarningCities' || 
                           htmlElementId === 'top3CarsWithMostEarning' ||
                           text.toLowerCase().includes('earning') ||
                           text.toLowerCase().includes('revenue') ||
                           label.toLowerCase().includes('₹') ||
                           label.toLowerCase().includes('earning') ||
                           label.toLowerCase().includes('revenue');

    var chartConfig = {
        type: type,
        data: {
            labels: labels,
            datasets: [
                {
                    label: label,
                    backgroundColor: [
                        'rgba(255, 107, 107, 0.7)', // Red
                        'rgba(30, 144, 255, 0.7)', // Blue
                        'rgba(255, 209, 102, 0.7)', // Yellow
                        'rgba(6, 214, 160, 0.7)',  // Green
                        'rgba(131, 56, 236, 0.7)'  // Purple
                    ],
                    borderColor: [
                        'rgba(255, 107, 107, 1)',
                        'rgba(30, 144, 255, 1)',
                        'rgba(255, 209, 102, 1)',
                        'rgba(6, 214, 160, 1)',
                        'rgba(131, 56, 236, 1)'
                    ],
                    borderWidth: 1.5,
                    data: data,
                },
            ],
        },
        options: {
            title: {
                display: true,
                text: text,
                fontSize: 16,
                fontColor: "#333"
            },
            legend: {
                position: "top",
                labels: { fontColor: "#555", fontSize: 14 }
            },
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            fontColor: "#555",
                            fontSize: 14,
                            callback: function(value) {
                                if (isEarningsChart) {
                                    return '₹' + value.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    });
                                }
                                return value;
                            }
                        },
                        gridLines: { color: "rgba(200, 200, 200, 0.3)" }
                    },
                ],
                xAxes: [
                    {
                        ticks: { fontColor: "#555", fontSize: 14 },
                        gridLines: { color: "rgba(200, 200, 200, 0.3)" }
                    },
                ],
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, chartData) {
                        if (isEarningsChart) {
                            return new Intl.NumberFormat('en-IN', { 
                                style: 'currency', 
                                currency: 'INR',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(tooltipItem.value);
                        }
                        return tooltipItem.value;
                    }
                }
            }
        }
    };

    var ctx = document.getElementById(htmlElementId).getContext("2d");
    // Create a new chart and store its instance
    this.chartInstances[htmlElementId] = new Chart(ctx, chartConfig);
  };
  
  // Helper function to generate a random color for each line
  getColor = (index) => {
    const colors = [
      'rgba(255, 107, 107, 0.7)', // Red
      'rgba(30, 144, 255, 0.7)', // Blue
      'rgba(255, 209, 102, 0.7)', // Yellow
      'rgba(6, 214, 160, 0.7)',  // Green
      'rgba(131, 56, 236, 0.7)'  // Purple
    ];
    return colors[index % colors.length];
  };
  
  /**
   * Creates a line chart with customizable options
   * @param {string} canvasId - The ID of the canvas element
   * @param {Object} chartData - The data configuration object
   * @param {string[]} chartData.labels - Array of labels for the x-axis
   * @param {number[]} chartData.data - Array of data points
   * @param {string} chartData.title - Chart title
   * @param {Object} [chartData.colors] - Optional custom colors
   * @param {string} [chartData.label] - Dataset label
   * @returns {Chart} Chart instance
   */
  this.createLineChart = function(canvasId, chartData) {
      console.log(canvasId);
      // Set default colors if not provided
      const colors = chartData.colors || {
          backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(54, 162, 235, 0.2)'
          ],
          borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(54, 162, 235, 1)'
          ]
      };

      // Get canvas context
      var ctx = document.getElementById(canvasId).getContext("2d");

      // Create and return chart
      return new Chart(ctx, {
          type: 'line',
          data: {
              labels: chartData.labels,
              datasets: [{
                  label: chartData.label || 'Data',
                  data: chartData.data,
                  backgroundColor: colors.backgroundColor,
                  borderColor: colors.borderColor,
                  borderWidth: 1
              }]
          },
          options: {
              title: {
                  display: true,
                  text: chartData.title
              },
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: true
                      }
                  }]
              }
          }
      });
  };

  /**
   * Creates a line chart showing city-wise review counts over time
   * 
   * @param {Object} rawData - The data containing city review counts
   * @param {string} canvasId - The ID of the canvas element to render the chart on
   * @returns {Chart} The created chart instance
   */
  this.createMultilineChart = function(rawData, canvasId) {
      // Step 1: Extract all unique dates
      const allDates = new Set();
      rawData.forEach(city => {
          city.reviewCounts.forEach(rc => allDates.add(rc.date));
      });
      const sortedDates = Array.from(allDates).sort();
  
      // Step 2: Define colors for the chart
      const colors = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4'];
  
      // Step 3: Prepare datasets for up to 5 cities
      const datasets = rawData
          .filter(city => city._id) // Ignore entries with null _id
          .slice(0, 5) // Ensure only up to 5 cities
          .map((city, index) => {
              const data = sortedDates.map(date => {
                  const match = city.reviewCounts.find(rc => rc.date === date);
                  return match ? match.count : 0;
              });
      
              return {
                  label: city._id,
                  data,
                  fill: false,
                  borderColor: colors[index],
                  backgroundColor: colors[index],
                  tension: 0.3
              };
          });
  
      // Step 4: Store chart instances in a map to manage multiple charts
      if (!this.chartInstances) {
          this.chartInstances = {};
      }
  
      // Step 5: Check if a chart already exists for the given element ID and destroy it
      if (this.chartInstances[canvasId]) {
          this.chartInstances[canvasId].destroy();
      }
  
      // Step 6: Check if the canvas element exists
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
          console.warn(`Canvas element with ID ${canvasId} not found in the DOM`);
          return null;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
          console.warn(`Could not get 2D context for canvas ${canvasId}`);
          return null;
      }
      
      // Step 7: Create and return the chart
      this.chartInstances[canvasId] = new Chart(ctx, {
          type: 'line',
          data: {
              labels: sortedDates,
              datasets
          },
          options: {
              responsive: true,
              plugins: {
                  legend: {
                      position: 'top'
                  },
                  title: {
                      display: true,
                      text: 'Review Counts by City'
                  }
              },
              scales: {
                  y: {
                      beginAtZero: true,
                      title: {
                          display: true,
                          text: 'Review Count'
                      }
                  },
                  x: {
                      title: {
                          display: true,
                          text: 'Date'
                      }
                  }
              }
          }
      });
      
      return this.chartInstances[canvasId];
  };
});