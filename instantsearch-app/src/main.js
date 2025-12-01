import { createApp } from 'vue';
import InstantSearch from 'vue-instantsearch/vue3/es';
import App from './App.vue';
import './index.css';
import './app.css';

const app = createApp(App);
app.use(InstantSearch);
app.mount('#app');
