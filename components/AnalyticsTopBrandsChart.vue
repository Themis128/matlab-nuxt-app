<template>
  <div>
    <apexcharts type="bar" height="350" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'

  const props = defineProps<{ brands?: Record<string, number>; selectedBrand?: string }>()

  const brandNames = props.brands ? Object.keys(props.brands) : []
  const brandCounts = props.brands ? Object.values(props.brands) : []

  const series = ref([
    {
      name: 'Phones',
      data: brandCounts,
    },
  ])

  const chartOptions = ref({
    chart: {
      id: 'top-brands',
      toolbar: { show: false },
    },
    xaxis: {
      categories: brandNames,
      title: { text: 'Brand' },
    },
    yaxis: {
      title: { text: 'Number of Phones' },
      min: 0,
    },
    title: {
      text: 'Top Brands by Phone Count',
      align: 'left',
    },
    plotOptions: {
      bar: { distributed: true },
    },
    colors: brandNames.map(name => (name === props.selectedBrand ? '#f97316' : '#6366f1')),
  })

  watch(
    () => props.brands,
    newVal => {
      if (newVal) {
        if (!series.value[0]) {
          series.value[0] = {
            name: 'Phones',
            data: [],
          }
        }
        series.value[0].data = Object.values(newVal)
        chartOptions.value.xaxis.categories = Object.keys(newVal)
        // rebuild colors map when brands change
        chartOptions.value.colors = Object.keys(newVal).map(name =>
          name === props.selectedBrand ? '#f97316' : '#6366f1'
        )
      }
    }
  )

  watch(
    () => props.selectedBrand,
    newVal => {
      // update color mapping when selected brand changes
      const brandNamesNow = chartOptions.value.xaxis.categories || []
      chartOptions.value.colors = brandNamesNow.map((name: string) =>
        name === newVal ? '#f97316' : '#6366f1'
      )
    }
  )
</script>
