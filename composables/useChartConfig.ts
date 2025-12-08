/**
 * Nuxt 4 composable for chart configuration
 * Provides ApexCharts configuration helpers
 */
import type { ApexOptions } from 'apexcharts';

export const useChartConfig = () => {
  const getChartOptions = (
    type: 'line' | 'bar' | 'pie' | 'area' | 'donut',
    customOptions?: Partial<ApexOptions>
  ): ApexOptions => {
    const baseOptions: ApexOptions = {
      chart: {
        type,
        toolbar: {
          show: true,
        },
        animations: {
          enabled: true,
          speed: 800,
        },
      },
      theme: {
        mode: 'light',
      },
      stroke: {
        curve: 'smooth',
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        enabled: true,
        shared: true,
      },
      legend: {
        show: true,
        position: 'bottom',
      },
    };

    // Type-specific options
    switch (type) {
      case 'line':
      case 'area':
        baseOptions.stroke = {
          curve: 'smooth',
          width: 2,
        };
        baseOptions.markers = {
          size: 4,
          hover: {
            size: 6,
          },
        };
        break;
      case 'bar':
        baseOptions.plotOptions = {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            borderRadius: 4,
          },
        };
        break;
      case 'pie':
      case 'donut':
        baseOptions.plotOptions = {
          pie: {
            donut:
              type === 'donut'
                ? {
                    size: '70%',
                  }
                : undefined,
            expandOnClick: true,
          },
        };
        baseOptions.dataLabels = {
          enabled: true,
          formatter: (val: number) => `${val.toFixed(1)}%`,
        };
        break;
    }

    return {
      ...baseOptions,
      ...customOptions,
    };
  };

  const getMobileDatasetChartOptions = (
    chartType: 'price' | 'brand' | 'year' | 'ram' | 'battery'
  ): ApexOptions => {
    const colorSchemes = {
      price: ['#9333ea', '#2563eb'],
      brand: ['#059669', '#dc2626', '#fbbf24', '#3b82f6'],
      year: ['#8b5cf6', '#ec4899'],
      ram: ['#10b981', '#f59e0b'],
      battery: ['#ef4444', '#06b6d4'],
    };

    const colors = colorSchemes[chartType] || colorSchemes.price;

    return getChartOptions('bar', {
      colors,
      title: {
        text: `Mobile Dataset - ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Analysis`,
        align: 'left',
      },
      xaxis: {
        type: chartType === 'year' ? 'numeric' : 'category',
      },
      yaxis: {
        title: {
          text:
            chartType === 'price'
              ? 'Price (USD)'
              : chartType === 'ram'
                ? 'RAM (GB)'
                : chartType === 'battery'
                  ? 'Battery (mAh)'
                  : 'Count',
        },
      },
    });
  };

  const getComparisonChartOptions = (models: string[]): ApexOptions => {
    return getChartOptions('bar', {
      colors: ['#9333ea', '#2563eb', '#059669', '#dc2626', '#fbbf24'],
      title: {
        text: 'Model Comparison',
        align: 'left',
      },
      xaxis: {
        categories: models,
      },
      yaxis: {
        title: {
          text: 'Value',
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '70%',
          dataLabels: {
            position: 'top',
          },
        },
      },
    });
  };

  return {
    getChartOptions,
    getMobileDatasetChartOptions,
    getComparisonChartOptions,
  };
};
