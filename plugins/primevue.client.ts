import { defineNuxtPlugin } from '#app';
import PrimeVue from 'primevue/config';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Paginator from 'primevue/paginator';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import Calendar from 'primevue/calendar';
import Checkbox from 'primevue/checkbox';
import RadioButton from 'primevue/radiobutton';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import ConfirmDialog from 'primevue/confirmdialog';

export default defineNuxtPlugin((nuxtApp) => {
  // Register PrimeVue
  // PrimeVue v4 uses CSS variables for theming - no separate theme CSS files needed
  // Theme is applied via CSS variables that are included with the components
  nuxtApp.vueApp.use(PrimeVue, {
    ripple: true, // Enable ripple effect
    inputStyle: 'outlined', // Default input style
    // Note: PrimeVue v4 themes are handled via CSS variables, not separate CSS files
    // You can customize colors via CSS variables in your main.css if needed
  });

  // Register PrimeVue services
  nuxtApp.vueApp.use(ToastService);
  nuxtApp.vueApp.use(ConfirmationService);

  // Register commonly used PrimeVue components globally
  nuxtApp.vueApp.component('DataTable', DataTable);
  nuxtApp.vueApp.component('Column', Column);
  nuxtApp.vueApp.component('ColumnGroup', ColumnGroup);
  nuxtApp.vueApp.component('Row', Row);
  nuxtApp.vueApp.component('PrimeButton', Button);
  nuxtApp.vueApp.component('PrimeInputText', InputText);
  nuxtApp.vueApp.component('Paginator', Paginator);
  nuxtApp.vueApp.component('PrimeDropdown', Dropdown);
  nuxtApp.vueApp.component('PrimeMultiSelect', MultiSelect);
  nuxtApp.vueApp.component('PrimeCalendar', Calendar);
  nuxtApp.vueApp.component('PrimeCheckbox', Checkbox);
  nuxtApp.vueApp.component('PrimeRadioButton', RadioButton);
  nuxtApp.vueApp.component('PrimeToast', Toast);
  nuxtApp.vueApp.component('ConfirmDialog', ConfirmDialog);
});
