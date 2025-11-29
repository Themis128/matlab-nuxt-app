<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <!-- Header -->
        <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-6">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">AI Model Dashboard</h1>
                        <p class="mt-2 text-gray-600 dark:text-gray-400">Performance metrics and model analytics</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-sm text-gray-600 dark:text-gray-400">Models Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Model Performance Heading for tests -->
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Model Performance Summary</h2>
            <!-- Model Performance Overview -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Price Prediction</p>
                            <p class="text-2xl font-bold text-green-600 dark:text-green-400">98.24%</p>
                        </div>
                        <div
                            class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="flex items-center text-sm">
                            <span class="text-green-600 dark:text-green-400 font-medium">+20.7% improvement</span>
                            <span class="text-gray-500 dark:text-gray-400 ml-2">vs baseline</span>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">RAM Prediction</p>
                            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">95.16%</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                                </path>
                            </svg>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="flex items-center text-sm">
                            <span class="text-blue-600 dark:text-blue-400 font-medium">+43.6% improvement</span>
                            <span class="text-gray-500 dark:text-gray-400 ml-2">vs baseline</span>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Battery Prediction</p>
                            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">94.77%</p>
                        </div>
                        <div
                            class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064">
                                </path>
                            </svg>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="flex items-center text-sm">
                            <span class="text-purple-600 dark:text-purple-400 font-medium">+26.6% improvement</span>
                            <span class="text-gray-500 dark:text-gray-400 ml-2">vs baseline</span>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Brand Classification</p>
                            <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">65.22%</p>
                        </div>
                        <div
                            class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                                </path>
                            </svg>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="flex items-center text-sm">
                            <span class="text-orange-600 dark:text-orange-400 font-medium">+9.6% improvement</span>
                            <span class="text-gray-500 dark:text-gray-400 ml-2">vs baseline</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Performance Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Accuracy Trends -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Accuracy Trends</h3>
                    <div class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div class="text-center">
                            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                                </path>
                            </svg>
                            <p class="text-gray-500 dark:text-gray-400">Performance charts would be displayed here</p>
                            <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Integration with charting library
                                needed</p>
                        </div>
                    </div>
                </div>

                <!-- Feature Importance -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Importance Analysis
                    </h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">RAM Capacity</span>
                            <div class="flex items-center space-x-2">
                                <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div class="bg-green-500 h-2 rounded-full" style="width: 85%"></div>
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">85%</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Brand Premium</span>
                            <div class="flex items-center space-x-2">
                                <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div class="bg-blue-500 h-2 rounded-full" style="width: 72%"></div>
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">72%</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Battery Size</span>
                            <div class="flex items-center space-x-2">
                                <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div class="bg-purple-500 h-2 rounded-full" style="width: 68%"></div>
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">68%</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Screen Size</span>
                            <div class="flex items-center space-x-2">
                                <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div class="bg-orange-500 h-2 rounded-full" style="width: 45%"></div>
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">45%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Technology Stack -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technology Stack & Performance</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div
                            class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor"
                                viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">TensorFlow</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Deep Learning</p>
                    </div>
                    <div class="text-center">
                        <div
                            class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">Scikit-learn</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">ML Algorithms</p>
                    </div>
                    <div class="text-center">
                        <div
                            class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">FastAPI</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">REST API</p>
                    </div>
                    <div class="text-center">
                        <div
                            class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">Nuxt.js</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Frontend</p>
                    </div>
                </div>
            </div>

            <!-- Navigation -->
            <div class="mt-8 flex justify-center">
                <div class="flex space-x-4">
                    <NuxtLink to="/"
                        class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Home
                    </NuxtLink>
                    <NuxtLink to="/demo"
                        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                        Try AI Predictions
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
    // Page meta
    useHead( {
        title: 'AI Model Dashboard - Mobile Finder',
        meta: [
            {
                name: 'description',
                content: 'View AI model performance metrics, accuracy trends, and technical analytics for mobile phone predictions.'
            }
        ]
    } )
</script>
