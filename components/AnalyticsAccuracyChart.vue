<template>
  <div>
    <apexcharts type="line" height="350" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'

  // Props: pass analytics data from parent
  const props = defineProps<{ accuracyTrends?: number[]; labels?: string[] }>()

  const series = ref([
    {
      name: 'Accuracy',
      data: props.accuracyTrends || [98.24, 95.16, 94.77, 65.22],
    },
  ])

  const chartOptions = ref({
    chart: {
      id: 'accuracy-trends',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    xaxis: {
      categories: props.labels || ['Price', 'RAM', 'Battery', 'Brand'],
    },
    yaxis: {
      min: 0,
      max: 100,
      title: { text: 'Accuracy (%)' },
    },
    title: {
      text: 'Model Accuracy Trends',
      align: 'left',
    },
    colors: ['#10b981'],
  })

  watch(
    () => props.accuracyTrends,
    newVal => {
      if (series.value[0]) {
        series.value[0].data = newVal || []
      }
    }
  )
  watch(
    () => props.labels,
    newVal => {
      chartOptions.value.xaxis.categories = newVal || []
    }
  )
</script>
