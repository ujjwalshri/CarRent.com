angular.module('myApp').service('ChartService', function(){
    this.createPieChart = (labels, data,label,htmlElementId )=>{
        // create the pie chart
      
   
          // Initialize the chart configuration after fetching users
      var chartConfig = {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              backgroundColor: ["#FF6384", "#36A2EB"],
              data:data,
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: label,
          },
        },
         
    }
    var ctx = document.getElementById(htmlElementId).getContext('2d');
    new Chart(ctx, chartConfig);
    },
    this.createBarChart = (type,labels, data,label,text,htmlElementId )=>{
        // create the bar chart
       
        var chartConfig = {
            type: type,
            data: {
              labels: labels,
              datasets: [
                {
                  label: label,
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                  data: data,
                },
              ],
            },
            options: {
              title: {
                display: true,
                text: text,
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: true,
                    },
                  },
                ],
              },
            },
          };
          // Create the chart instance
          var ctx = document.getElementById(htmlElementId).getContext("2d");
          new Chart(ctx, chartConfig);
    }
})