import { useApiStore } from '~/stores/apiStore';
import { usePredictionHistoryStore } from '~/stores/predictionHistoryStore';
import { usePredictionValidationStore } from '~/stores/predictionValidationStore';

export const useDemo = () => {
  // Initialize stores
  const apiStore = useApiStore();
  const predictionHistoryStore = usePredictionHistoryStore();
  const _predictionValidationStore = usePredictionValidationStore();

  // API status from store
  const apiStatus = computed(() => apiStore);
  const checkApiHealth = () => apiStore.checkApiHealth();

  // History methods from store
  const getHistory = () => predictionHistoryStore.getAllHistory;
  const getHistoryByModel = (model: string) => predictionHistoryStore.getHistoryByModel(model);
  const clearHistoryStorage = () => predictionHistoryStore.clearHistory();

  const selectedTabIndex = ref<number>(0);

  const modelTabs = [
    { label: 'Price Prediction', value: 'price', icon: 'i-heroicons-currency-dollar' },
    { label: 'Brand Classification', value: 'brand', icon: 'i-heroicons-tag' },
    { label: 'RAM Prediction', value: 'ram', icon: 'i-heroicons-cpu-chip' },
    { label: 'Battery Prediction', value: 'battery', icon: 'i-heroicons-battery-100' },
  ];

  const selectedModel = computed(() => {
    const index = Number(selectedTabIndex.value) || 0;
    return modelTabs[index]?.value || 'price';
  });

  const companies = [
    { label: 'Apple', value: 'Apple' },
    { label: 'Samsung', value: 'Samsung' },
    { label: 'Xiaomi', value: 'Xiaomi' },
    { label: 'OnePlus', value: 'OnePlus' },
    { label: 'Google', value: 'Google' },
    { label: 'Realme', value: 'Realme' },
    { label: 'Oppo', value: 'Oppo' },
    { label: 'Vivo', value: 'Vivo' },
    { label: 'Huawei', value: 'Huawei' },
    { label: 'Sony', value: 'Sony' },
  ];

  // Validation helpers
  const validateNumber = (
    value: number | null | undefined,
    min: number,
    max: number
  ): string | undefined => {
    if (value === null || value === undefined) return undefined;
    if (value < min || value > max) return `Must be between ${min} and ${max}`;
    return undefined;
  };

  // Price prediction
  const priceInput = ref({
    ram: 8,
    battery: 4000,
    screen: 6.1,
    weight: 174,
    year: 2024,
    company: 'Apple',
    front_camera: null as number | null,
    back_camera: null as number | null,
    processor: null as string | null,
    storage: null as number | null,
  });
  const priceLoading = ref(false);
  const priceResult = ref<number | null>(null);
  const priceError = ref<string | null>(null);
  const pricePredictionTime = ref<number | null>(null);
  const priceSource = ref<'api' | 'fallback' | null>(null);
  const priceClosestModel = ref<{
    modelName: string;
    company: string;
    similarityScore: number;
    price: number;
  } | null>(null);
  const priceLoadingModel = ref(false);

  const priceValidation = computed(() => ({
    ram: validateNumber(priceInput.value.ram, 2, 24),
    battery: validateNumber(priceInput.value.battery, 2000, 7000),
    screen: validateNumber(priceInput.value.screen, 4, 8),
    weight: validateNumber(priceInput.value.weight, 100, 300),
    year: validateNumber(priceInput.value.year, 2020, 2025),
    company: !priceInput.value.company ? 'Company is required' : undefined,
    front_camera:
      priceInput.value.front_camera !== null
        ? validateNumber(priceInput.value.front_camera, 0, 100)
        : undefined,
    back_camera:
      priceInput.value.back_camera !== null
        ? validateNumber(priceInput.value.back_camera, 0, 200)
        : undefined,
    storage:
      priceInput.value.storage !== null
        ? validateNumber(priceInput.value.storage, 32, 2048)
        : undefined,
  }));

  const isPriceFormValid = computed(() => {
    return !Object.values(priceValidation.value).some((error) => error !== undefined);
  });

  const priceHistory = computed(() => predictionHistoryStore.getHistoryByModel('price'));

  const predictPrice = async () => {
    priceLoading.value = true;
    priceResult.value = null;
    priceError.value = null;
    pricePredictionTime.value = null;
    priceSource.value = null;

    const startTime = performance.now();

    try {
      // Filter out null optional fields
      const body: any = { ...priceInput.value };
      if (body.front_camera === null) delete body.front_camera;
      if (body.back_camera === null) delete body.back_camera;
      if (body.processor === null) delete body.processor;
      if (body.storage === null) delete body.storage;

      // Try to get prediction from API
      let response;
      try {
        response = await $fetch('/api/predict/price', {
          method: 'POST',
          body,
        });

        // Check if the response contains an error
        if (response.error) {
          throw new Error(response.error);
        }

        const endTime = performance.now();
        pricePredictionTime.value = Math.round(endTime - startTime);
        priceResult.value = response.price;
        priceSource.value = 'api';

        // Save to history
        predictionHistoryStore.savePrediction({
          model: 'price',
          input: { ...priceInput.value },
          result: response.price,
          predictionTime: pricePredictionTime.value ?? 0,
          source: 'api',
        });

        // Find closest matching model
        await findClosestPriceModel(response.price);
      } catch (fetchError: any) {
        console.error('Error fetching price prediction:', fetchError);

        // Display the error message
        priceError.value = fetchError.message || 'Failed to predict price. Please try again.';

        // Also use fallback for testing purposes
        const fallbackPrice = Math.round(
          priceInput.value.ram * 100 + priceInput.value.battery * 0.1
        );
        priceResult.value = fallbackPrice;
        priceSource.value = 'fallback';

        // Add error indicator to the UI
        const errorElement = document.createElement('div');
        errorElement.textContent = 'Error: ' + priceError.value;
        errorElement.className = 'text-red-500 text-sm mt-2';
        document.querySelector('.prediction-result')?.appendChild(errorElement);

        // Save fallback to history
        predictionHistoryStore.savePrediction({
          model: 'price',
          input: { ...priceInput.value },
          result: fallbackPrice,
          predictionTime: pricePredictionTime.value ?? 0,
          source: 'fallback',
          ...(priceError.value && { error: priceError.value }),
        });

        // Find closest matching model
        await findClosestPriceModel(fallbackPrice);
      }
    } catch (err: any) {
      const endTime = performance.now();
      pricePredictionTime.value = Math.round(endTime - startTime);

      // Show error message
      priceError.value =
        err.data?.message || err.message || 'Failed to predict price. Please try again.';
      console.error('Error predicting price:', err);

      // Use fallback
      const fallbackPrice = Math.round(priceInput.value.ram * 100 + priceInput.value.battery * 0.1);
      priceResult.value = fallbackPrice;
      priceSource.value = 'fallback';

      // Save fallback to history with error
      predictionHistoryStore.savePrediction({
        model: 'price',
        input: { ...priceInput.value },
        result: fallbackPrice,
        predictionTime: pricePredictionTime.value ?? 0,
        source: 'fallback',
        ...(priceError.value && { error: priceError.value }),
      });

      // Find closest matching model
      await findClosestPriceModel(fallbackPrice);
    } finally {
      priceLoading.value = false;
    }
  };

  const findClosestPriceModel = async (predictedPrice: number) => {
    priceLoadingModel.value = true;
    priceClosestModel.value = null;

    try {
      const response = await $fetch('/api/predict/price/closest', {
        method: 'POST',
        body: {
          ...priceInput.value,
          predictedPrice,
        },
      });
      priceClosestModel.value = response;
    } catch (err: any) {
      console.error('Error finding closest model:', err);
      // Silently fail - this is optional functionality
    } finally {
      priceLoadingModel.value = false;
    }
  };

  // Brand classification
  const brandInput = ref({
    ram: 8,
    battery: 4000,
    screen: 6.1,
    weight: 174,
    year: 2024,
    price: 999,
    front_camera: null as number | null,
    back_camera: null as number | null,
    processor: null as string | null,
    storage: null as number | null,
  });
  const brandLoading = ref(false);
  const brandResult = ref<string | null>(null);
  const brandError = ref<string | null>(null);
  const brandPredictionTime = ref<number | null>(null);
  const brandSource = ref<'api' | 'fallback' | null>(null);
  const brandClosestModel = ref<{
    modelName: string;
    company: string;
    similarityScore: number;
  } | null>(null);
  const brandLoadingModel = ref(false);

  const brandValidation = computed(() => ({
    ram: validateNumber(brandInput.value.ram, 2, 24),
    battery: validateNumber(brandInput.value.battery, 2000, 7000),
    screen: validateNumber(brandInput.value.screen, 4, 8),
    weight: validateNumber(brandInput.value.weight, 100, 300),
    year: validateNumber(brandInput.value.year, 2020, 2025),
    price: validateNumber(brandInput.value.price, 100, 2000),
  }));

  const isBrandFormValid = computed(() => {
    return !Object.values(brandValidation.value).some((error) => error !== undefined);
  });

  const brandHistory = computed(() => predictionHistoryStore.getHistoryByModel('brand'));

  const predictBrand = async () => {
    brandLoading.value = true;
    brandResult.value = null;
    brandError.value = null;
    brandPredictionTime.value = null;
    brandSource.value = null;

    const startTime = performance.now();

    try {
      // Filter out null optional fields
      const body: any = { ...brandInput.value };
      if (body.front_camera === null) delete body.front_camera;
      if (body.back_camera === null) delete body.back_camera;
      if (body.processor === null) delete body.processor;
      if (body.storage === null) delete body.storage;

      const response = await $fetch('/api/predict/brand', {
        method: 'POST',
        body,
      });

      const endTime = performance.now();
      brandPredictionTime.value = Math.round(endTime - startTime);
      brandResult.value = response.brand;
      brandSource.value = 'api';

      predictionHistoryStore.savePrediction({
        model: 'brand',
        input: { ...brandInput.value },
        result: response.brand,
        predictionTime: brandPredictionTime.value ?? 0,
        source: 'api',
      });

      // Find closest matching model
      await findClosestBrandModel(response.brand);
    } catch (err: any) {
      const endTime = performance.now();
      brandPredictionTime.value = Math.round(endTime - startTime);

      brandError.value =
        err.data?.message || err.message || 'Failed to predict brand. Please try again.';
      console.error('Error predicting brand:', err);

      const fallbackBrand = brandInput.value.price > 800 ? 'Apple' : 'Samsung';
      brandResult.value = fallbackBrand;
      brandSource.value = 'fallback';

      predictionHistoryStore.savePrediction({
        model: 'brand',
        input: { ...brandInput.value },
        result: fallbackBrand,
        predictionTime: brandPredictionTime.value ?? 0,
        source: 'fallback',
        ...(brandError.value && { error: brandError.value }),
      });

      // Find closest matching model
      await findClosestBrandModel(fallbackBrand);
    } finally {
      brandLoading.value = false;
    }
  };

  const findClosestBrandModel = async (predictedBrand: string) => {
    brandLoadingModel.value = true;
    brandClosestModel.value = null;

    try {
      const response = await $fetch('/api/predict/brand/closest', {
        method: 'POST',
        body: {
          ram: brandInput.value.ram,
          battery: brandInput.value.battery,
          screen: brandInput.value.screen,
          weight: brandInput.value.weight,
          year: brandInput.value.year,
          company: predictedBrand,
          predictedPrice: brandInput.value.price,
          predictedBrand,
        },
      });
      brandClosestModel.value = response;
    } catch (err: any) {
      console.error('Error finding closest model:', err);
    } finally {
      brandLoadingModel.value = false;
    }
  };

  // RAM prediction
  const ramInput = ref({
    battery: 4000,
    screen: 6.1,
    weight: 174,
    year: 2024,
    price: 999,
    company: 'Apple',
    front_camera: null as number | null,
    back_camera: null as number | null,
    processor: null as string | null,
    storage: null as number | null,
  });
  const ramLoading = ref(false);
  const ramResult = ref<number | null>(null);
  const ramError = ref<string | null>(null);
  const ramPredictionTime = ref<number | null>(null);
  const ramSource = ref<'api' | 'fallback' | null>(null);
  const ramClosestModel = ref<{
    modelName: string;
    company: string;
    similarityScore: number;
    ram: number;
  } | null>(null);
  const ramLoadingModel = ref(false);

  const ramValidation = computed(() => ({
    battery: validateNumber(ramInput.value.battery, 2000, 7000),
    screen: validateNumber(ramInput.value.screen, 4, 8),
    weight: validateNumber(ramInput.value.weight, 100, 300),
    year: validateNumber(ramInput.value.year, 2020, 2025),
    price: validateNumber(ramInput.value.price, 100, 2000),
    company: !ramInput.value.company ? 'Company is required' : undefined,
  }));

  const isRamFormValid = computed(() => {
    return !Object.values(ramValidation.value).some((error) => error !== undefined);
  });

  const ramHistory = computed(() => predictionHistoryStore.getHistoryByModel('ram'));

  const predictRAM = async () => {
    ramLoading.value = true;
    ramResult.value = null;
    ramError.value = null;
    ramPredictionTime.value = null;
    ramSource.value = null;

    const startTime = performance.now();

    try {
      // Filter out null optional fields
      const body: any = { ...ramInput.value };
      if (body.front_camera === null) delete body.front_camera;
      if (body.back_camera === null) delete body.back_camera;
      if (body.processor === null) delete body.processor;
      if (body.storage === null) delete body.storage;

      const response = await $fetch('/api/predict/ram', {
        method: 'POST',
        body,
      });

      const endTime = performance.now();
      ramPredictionTime.value = Math.round(endTime - startTime);
      ramResult.value = response.ram;
      ramSource.value = 'api';

      predictionHistoryStore.savePrediction({
        model: 'ram',
        input: { ...ramInput.value },
        result: response.ram,
        predictionTime: ramPredictionTime.value ?? 0,
        source: 'api',
      });

      // Find closest matching model
      await findClosestRamModel(response.ram);
    } catch (err: any) {
      const endTime = performance.now();
      ramPredictionTime.value = Math.round(endTime - startTime);

      ramError.value =
        err.data?.message || err.message || 'Failed to predict RAM. Please try again.';
      console.error('Error predicting RAM:', err);

      const fallbackRam = Math.round(ramInput.value.price / 100);
      ramResult.value = fallbackRam;
      ramSource.value = 'fallback';

      predictionHistoryStore.savePrediction({
        model: 'ram',
        input: { ...ramInput.value },
        result: fallbackRam,
        predictionTime: ramPredictionTime.value ?? 0,
        source: 'fallback',
        ...(ramError.value && { error: ramError.value }),
      });

      // Find closest matching model
      await findClosestRamModel(fallbackRam);
    } finally {
      ramLoading.value = false;
    }
  };

  const findClosestRamModel = async (predictedRam: number) => {
    ramLoadingModel.value = true;
    ramClosestModel.value = null;

    try {
      const response = await $fetch('/api/find-closest-model', {
        method: 'POST',
        body: {
          ...ramInput.value,
          ram: predictedRam, // Use predicted RAM for matching
        },
      });
      ramClosestModel.value = response;
    } catch (err: any) {
      console.error('Error finding closest model:', err);
    } finally {
      ramLoadingModel.value = false;
    }
  };

  // Battery prediction
  const batteryInput = ref({
    ram: 8,
    screen: 6.1,
    weight: 174,
    year: 2024,
    price: 999,
    company: 'Apple',
    front_camera: null as number | null,
    back_camera: null as number | null,
    processor: null as string | null,
    storage: null as number | null,
  });
  const batteryLoading = ref(false);
  const batteryResult = ref<number | null>(null);
  const batteryError = ref<string | null>(null);
  const batteryPredictionTime = ref<number | null>(null);
  const batterySource = ref<'api' | 'fallback' | null>(null);
  const batteryClosestModel = ref<{
    modelName: string;
    company: string;
    similarityScore: number;
    battery: number;
  } | null>(null);
  const batteryLoadingModel = ref(false);

  const batteryValidation = computed(() => ({
    ram: validateNumber(batteryInput.value.ram, 2, 24),
    screen: validateNumber(batteryInput.value.screen, 4, 8),
    weight: validateNumber(batteryInput.value.weight, 100, 300),
    year: validateNumber(batteryInput.value.year, 2020, 2025),
    price: validateNumber(batteryInput.value.price, 100, 2000),
    company: !batteryInput.value.company ? 'Company is required' : undefined,
  }));

  const isBatteryFormValid = computed(() => {
    return !Object.values(batteryValidation.value).some((error) => error !== undefined);
  });

  const batteryHistory = computed(() => predictionHistoryStore.getHistoryByModel('battery'));

  const predictBattery = async () => {
    batteryLoading.value = true;
    batteryResult.value = null;
    batteryError.value = null;
    batteryPredictionTime.value = null;
    batterySource.value = null;

    const startTime = performance.now();

    try {
      // Filter out null optional fields
      const body: any = { ...batteryInput.value };
      if (body.front_camera === null) delete body.front_camera;
      if (body.back_camera === null) delete body.back_camera;
      if (body.processor === null) delete body.processor;
      if (body.storage === null) delete body.storage;

      const response = await $fetch('/api/predict/battery', {
        method: 'POST',
        body,
      });

      const endTime = performance.now();
      batteryPredictionTime.value = Math.round(endTime - startTime);
      batteryResult.value = response.battery;
      batterySource.value = 'api';

      predictionHistoryStore.savePrediction({
        model: 'battery',
        input: { ...batteryInput.value },
        result: response.battery,
        predictionTime: batteryPredictionTime.value ?? 0,
        source: 'api',
      });

      // Find closest matching model
      await findClosestBatteryModel(response.battery);
    } catch (err: any) {
      const endTime = performance.now();
      batteryPredictionTime.value = Math.round(endTime - startTime);

      batteryError.value =
        err.data?.message || err.message || 'Failed to predict battery. Please try again.';
      console.error('Error predicting battery:', err);

      const fallbackBattery = Math.round(batteryInput.value.screen * 700);
      batteryResult.value = fallbackBattery;
      batterySource.value = 'fallback';

      predictionHistoryStore.savePrediction({
        model: 'battery',
        input: { ...batteryInput.value },
        result: fallbackBattery,
        predictionTime: batteryPredictionTime.value ?? 0,
        source: 'fallback',
        ...(batteryError.value && { error: batteryError.value }),
      });

      // Find closest matching model
      await findClosestBatteryModel(fallbackBattery);
    } finally {
      batteryLoading.value = false;
    }
  };

  const findClosestBatteryModel = async (predictedBattery: number) => {
    batteryLoadingModel.value = true;
    batteryClosestModel.value = null;

    try {
      const response = await $fetch('/api/find-closest-model', {
        method: 'POST',
        body: {
          ...batteryInput.value,
          battery: predictedBattery, // Use predicted battery for matching
        },
      });
      batteryClosestModel.value = response;
    } catch (err: any) {
      console.error('Error finding closest model:', err);
    } finally {
      batteryLoadingModel.value = false;
    }
  };

  // History helpers
  const allHistory = computed(() => predictionHistoryStore.getAllHistory);

  const clearHistory = () => {
    predictionHistoryStore.clearHistory();
    // Clear all results
    priceResult.value = null;
    brandResult.value = null;
    ramResult.value = null;
    batteryResult.value = null;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const formatResult = (model: string, result: number | string) => {
    if (model === 'price') return `$${Number(result).toLocaleString()}`;
    if (model === 'ram') return `${Number(result).toFixed(1)} GB`;
    if (model === 'battery') return `${Number(result).toFixed(0)} mAh`;
    return String(result);
  };

  const getModelColor = (model: string) => {
    const colors: Record<string, string> = {
      price: 'blue',
      brand: 'green',
      ram: 'purple',
      battery: 'orange',
    };
    return colors[model] || 'gray';
  };

  const getModelName = (model: string) => {
    const names: Record<string, string> = {
      price: 'Price',
      brand: 'Brand',
      ram: 'RAM',
      battery: 'Battery',
    };
    return names[model] || model;
  };

  return {
    // API
    apiStatus,
    checkApiHealth,

    // History
    getHistory,
    getHistoryByModel,
    clearHistoryStorage,
    allHistory,
    clearHistory,
    formatTime,
    formatResult,
    getModelColor,
    getModelName,

    // UI
    selectedTabIndex,
    modelTabs,
    selectedModel,
    companies,

    // Price prediction
    priceInput,
    priceLoading,
    priceResult,
    priceError,
    pricePredictionTime,
    priceSource,
    priceClosestModel,
    priceLoadingModel,
    priceValidation,
    isPriceFormValid,
    priceHistory,
    predictPrice,

    // Brand prediction
    brandInput,
    brandLoading,
    brandResult,
    brandError,
    brandPredictionTime,
    brandSource,
    brandClosestModel,
    brandLoadingModel,
    brandValidation,
    isBrandFormValid,
    brandHistory,
    predictBrand,

    // RAM prediction
    ramInput,
    ramLoading,
    ramResult,
    ramError,
    ramPredictionTime,
    ramSource,
    ramClosestModel,
    ramLoadingModel,
    ramValidation,
    isRamFormValid,
    ramHistory,
    predictRAM,

    // Battery prediction
    batteryInput,
    batteryLoading,
    batteryResult,
    batteryError,
    batteryPredictionTime,
    batterySource,
    batteryClosestModel,
    batteryLoadingModel,
    batteryValidation,
    isBatteryFormValid,
    batteryHistory,
    predictBattery,
  };
};
