<template>
  <div>
    <apexcharts type="bar" height="350" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'

  const props = defineProps<{ importance?: Record<string, number> }>()

  const featureNames = props.importance ? Object.keys(props.importance) : []
  const featureScores = props.importance ? Object.values(props.importance) : []

  const series = ref([
    {
      name: 'Importance',
      data: featureScores,
    },
  ])

  const chartOptions = ref({
    chart: {
      id: 'feature-importance',
      toolbar: { show: false },
    },
    xaxis: {
      categories: featureNames,
      title: { text: 'Feature' },
    },
    yaxis: {
      title: { text: 'Importance (%)' },
      min: 0,
      max: 100,
    },
    title: {
      text: 'Feature Importance',
      align: 'left',
    },
    colors: ['#f59e42'],
  })

  watch(
    () => props.importance,
    newVal => {
      if (newVal) {
        if (!series.value[0]) {
          series.value[0] = {
            name: 'Importance',
            data: [],
          }
        }
        if (series.value[0]) {
          series.value[0].data = Object.values(newVal)
        }
        chartOptions.value.xaxis.categories = Object.keys(newVal)
      }
    }
  )
</script>
