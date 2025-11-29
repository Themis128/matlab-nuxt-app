% Real-World Time Series Data Examples
% This script shows examples of appropriate data sources for forecasting

fprintf('=== Real-World Time Series Data Examples ===\n\n');

%% 1. Stock Price Data
fprintf('1. STOCK PRICES\n');
fprintf('   ------------\n');
fprintf('   Data: Daily closing prices\n');
fprintf('   Example sources:\n');
fprintf('     - Yahoo Finance API\n');
fprintf('     - Alpha Vantage API\n');
fprintf('     - CSV files from financial websites\n');
fprintf('   Characteristics:\n');
fprintf('     - Trend: Upward/downward market trends\n');
fprintf('     - Volatility: Price fluctuations\n');
fprintf('     - Patterns: Daily, weekly patterns\n');
fprintf('   Forecast: Next day/week closing price\n');
fprintf('   Minimum data: 200+ trading days\n\n');

%% 2. Weather Data
fprintf('2. WEATHER DATA\n');
fprintf('   ------------\n');
fprintf('   Data: Temperature, humidity, precipitation\n');
fprintf('   Example sources:\n');
fprintf('     - Weather APIs (OpenWeatherMap, Weather.gov)\n');
fprintf('     - Historical weather databases\n');
fprintf('     - Sensor readings\n');
fprintf('   Characteristics:\n');
fprintf('     - Strong seasonality: Daily, yearly cycles\n');
fprintf('     - Trends: Climate trends over years\n');
fprintf('     - Multiple features: Temp, humidity, pressure\n');
fprintf('   Forecast: Next hour/day temperature\n');
fprintf('   Minimum data: 365+ days (1 year)\n\n');

%% 3. Sales Data
fprintf('3. SALES DATA\n');
fprintf('   ----------\n');
fprintf('   Data: Daily/weekly/monthly sales figures\n');
fprintf('   Example sources:\n');
fprintf('     - Company sales databases\n');
fprintf('     - Retail POS systems\n');
fprintf('     - E-commerce platforms\n');
fprintf('   Characteristics:\n');
fprintf('     - Seasonality: Weekly, monthly, yearly\n');
fprintf('     - Trends: Growth/decline patterns\n');
fprintf('     - Promotions: Sales spikes\n');
fprintf('   Forecast: Next week/month sales\n');
fprintf('   Minimum data: 52+ weeks (1 year)\n\n');

%% 4. Energy Consumption
fprintf('4. ENERGY CONSUMPTION\n');
fprintf('   -----------------\n');
fprintf('   Data: Hourly/daily power consumption\n');
fprintf('   Example sources:\n');
fprintf('     - Smart meters\n');
fprintf('     - Utility companies\n');
fprintf('     - Building management systems\n');
fprintf('   Characteristics:\n');
fprintf('     - Daily patterns: Higher during day\n');
fprintf('     - Weekly patterns: Weekday vs weekend\n');
fprintf('     - Seasonal: Summer/winter differences\n');
fprintf('   Forecast: Next hour/day consumption\n');
fprintf('   Minimum data: 30+ days\n\n');

%% 5. Website Traffic
fprintf('5. WEBSITE TRAFFIC\n');
fprintf('   ---------------\n');
fprintf('   Data: Daily/hourly page views, visitors\n');
fprintf('   Example sources:\n');
fprintf('     - Google Analytics\n');
fprintf('     - Server logs\n');
fprintf('     - Web analytics platforms\n');
fprintf('   Characteristics:\n');
fprintf('     - Daily patterns: Peak hours\n');
fprintf('     - Weekly patterns: Weekday vs weekend\n');
fprintf('     - Trends: Growth over time\n');
fprintf('   Forecast: Next day/hour traffic\n');
fprintf('   Minimum data: 30+ days\n\n');

%% 6. Economic Indicators
fprintf('6. ECONOMIC INDICATORS\n');
fprintf('   ------------------\n');
fprintf('   Data: GDP, inflation, unemployment rates\n');
fprintf('   Example sources:\n');
fprintf('     - Government statistics\n');
fprintf('     - Federal Reserve data\n');
fprintf('     - Economic databases (FRED)\n');
fprintf('   Characteristics:\n');
fprintf('     - Monthly/quarterly data\n');
fprintf('     - Long-term trends\n');
fprintf('     - Cyclical patterns\n');
fprintf('   Forecast: Next quarter/year indicator\n');
fprintf('   Minimum data: 5+ years\n\n');

%% 7. Sensor Data (IoT)
fprintf('7. SENSOR DATA (IoT)\n');
fprintf('   -----------------\n');
fprintf('   Data: Temperature, pressure, vibration sensors\n');
fprintf('   Example sources:\n');
fprintf('     - Industrial sensors\n');
fprintf('     - Environmental monitoring\n');
fprintf('     - Smart home devices\n');
fprintf('   Characteristics:\n');
fprintf('     - High frequency: Every second/minute\n');
fprintf('     - Multiple sensors: Multi-feature\n');
fprintf('     - Patterns: Equipment cycles\n');
fprintf('   Forecast: Next minute/hour reading\n');
fprintf('   Minimum data: 1000+ readings\n\n');

%% 8. Traffic Data
fprintf('8. TRAFFIC DATA\n');
fprintf('   ------------\n');
fprintf('   Data: Vehicle counts, congestion levels\n');
fprintf('   Example sources:\n');
fprintf('     - Traffic sensors\n');
fprintf('     - GPS data\n');
fprintf('     - Transportation departments\n');
fprintf('   Characteristics:\n');
fprintf('     - Daily patterns: Rush hours\n');
fprintf('     - Weekly patterns: Weekday vs weekend\n');
fprintf('     - Events: Accidents, construction\n');
fprintf('   Forecast: Next hour congestion\n');
fprintf('   Minimum data: 30+ days\n\n');

%% Summary
fprintf('=== Data Requirements Summary ===\n\n');
fprintf('All these data types are appropriate for time series forecasting if:\n');
fprintf('  ✓ They have consistent time intervals\n');
fprintf('  ✓ They have sufficient history (100+ time steps minimum)\n');
fprintf('  ✓ They show some patterns (trends, seasonality, cycles)\n');
fprintf('  ✓ Missing values are minimal (< 5%%)\n');
fprintf('  ✓ Data is cleaned and preprocessed\n');
fprintf('\n');
fprintf('Next Steps:\n');
fprintf('  1. Choose your data source\n');
fprintf('  2. Load and preprocess data\n');
fprintf('  3. Run time_series_data_preparation.m\n');
fprintf('  4. Train LSTM network (lstm_forecasting_example.m)\n');
fprintf('  5. Make forecasts!\n\n');
