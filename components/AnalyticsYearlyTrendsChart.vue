<template>
  <div>
    <apexchart type="line" height="350" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  // ...existing code...

  const props = defineProps<{
    trends?: { years: number[]; avg_price: number[]; avg_ram: number[]; avg_battery: number[] }
    selectedTarget?: string
  }>()

  const buildSeries = (trends: any, target?: string) => {
    const s: any[] = []
    if (!target || target === 'All' || target === 'Price') {
      s.push({ name: 'Avg Price', data: trends?.avg_price || [] })
    }
    if (!target || target === 'All' || target === 'RAM') {
      s.push({ name: 'Avg RAM', data: trends?.avg_ram || [] })
    }
    if (!target || target === 'All' || target === 'Battery') {
      s.push({ name: 'Avg Battery', data: trends?.avg_battery || [] })
    }
    return s
  }

  const series = ref(buildSeries(props.trends, props.selectedTarget))

  const chartOptions = ref({
    chart: {
      id: 'yearly-trends',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    xaxis: {
      categories: props.trends?.years || [],
      title: { text: 'Year' },
    },
    yaxis: {
      title: { text: 'Value' },
      min: 0,
    },
    title: {
      text: 'Yearly Trends: Price, RAM, Battery',
      align: 'left',
    },
    colors: ['#6366f1', '#10b981', '#f59e42'],
  })

  watch([() => props.trends, () => props.selectedTarget], ([newTrends, newTarget]: [any, any]) => {
    if (newTrends) {
      // rebuild series based on selectedTarget
      series.value = buildSeries(newTrends as any, newTarget as string | undefined)
      chartOptions.value.xaxis.categories = (newTrends as any).years || []
    }
  })
</script>
