<template>
  <div>
    <apexcharts type="bar" height="350" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'

  const props = defineProps<{ geo?: { regions: string[]; avg_prices: number[] } }>()

  const series = ref([
    {
      name: 'Avg Price',
      data: props.geo?.avg_prices || [],
    },
  ])

  const chartOptions = ref({
    chart: {
      id: 'geographical-analysis',
      toolbar: { show: false },
    },
    xaxis: {
      categories: props.geo?.regions || [],
      title: { text: 'Region' },
    },
    yaxis: {
      title: { text: 'Average Price' },
      min: 0,
    },
    title: {
      text: 'Geographical Price Analysis',
      align: 'left',
    },
    colors: ['#8b5cf6'],
  })

  watch(
    () => props.geo,
    newVal => {
      if (newVal) {
        if (series.value && series.value[0]) {
          series.value[0].data = newVal.avg_prices
        }
        if (chartOptions.value && chartOptions.value.xaxis) {
          chartOptions.value.xaxis.categories = newVal.regions
        }
      }
    }
  )
</script>
