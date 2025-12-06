/**
 * Nuxt 4 plugin for Christmas theme initialization
 * Runs only on client-side
 */
export default defineNuxtPlugin({
  name: 'christmas-theme',
  setup() {
    const christmasMode = useCookie<boolean>('christmas-theme', {
      default: () => false,
    });

    if (process.client && christmasMode.value) {
      // Add Christmas theme class
      document.documentElement.classList.add('christmas-theme');

      // Add snowflake animation styles
      const style = document.createElement('style');
      style.id = 'christmas-animations';
      style.textContent = `
        @keyframes snowfall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .snowflake {
          position: fixed;
          color: #fff;
          font-size: 1em;
          font-family: Arial, sans-serif;
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
          animation: snowfall linear infinite;
          pointer-events: none;
          z-index: 9999;
        }

        .twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }

        .christmas-theme {
          --color-primary: #059669;
          --color-secondary: #dc2626;
          --color-accent: #fbbf24;
        }
      `;
      document.head.appendChild(style);

      // Create snowflakes
      const createSnowflake = () => {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = '❄';
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.animationDuration = `${String(Math.random() * 3 + 2)}s`;
        snowflake.style.opacity = String(Math.random());
        document.body.appendChild(snowflake);

        setTimeout(() => {
          snowflake.remove();
        }, 5000);
      };

      // Create snowflakes periodically
      const snowflakeInterval = setInterval(() => {
        if (christmasMode.value) {
          createSnowflake();
        } else {
          clearInterval(snowflakeInterval);
        }
      }, 300);

      // Cleanup on unmount
      onUnmounted(() => {
        clearInterval(snowflakeInterval);
        const styleElement = document.getElementById('christmas-animations');
        if (styleElement) {
          styleElement.remove();
        }
      });
    }
  },
});
