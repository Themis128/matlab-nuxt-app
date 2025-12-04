<template>
  <div>
    <h1>Dashboard</h1>
    <ApexCharts type="bar" :options="chartOptions" :series="series"></ApexCharts>
  </div>
</template>

<script setup>
import ApexCharts from 'vue3-apexcharts';

const chartOptions = {
  chart: {
    type: 'bar',
  },
  series: [
    {
      name: 'sales',
      data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
    },
  ],
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  },
};

const series = [
  {
    name: 'sales',
    data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
  },
];
</script>
