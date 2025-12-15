import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(MotionPlugin)

// Global Error Handler for Debugging
window.onerror = function (message, source, lineno, colno, error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.backgroundColor = 'red';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '20px';
    errorDiv.style.zIndex = '9999';
    errorDiv.innerText = `Global Error: ${message} at ${source}:${lineno} `;
    document.body.appendChild(errorDiv);
};

app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err);
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.bottom = '0';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.backgroundColor = 'darkred';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '20px';
    errorDiv.style.zIndex = '9999';
    errorDiv.innerText = `Vue Error: ${err.toString()} (${info})`;
    document.body.appendChild(errorDiv);
};

app.mount('#app')

