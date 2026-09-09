(function() {
    const STORAGE_KEY = 'cr7-observability:logs';
    
    class ObservabilityTracker {
        constructor() {
            this.logs = this.loadLogs();
            this.initInterceptors();
        }

        loadLogs() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                return [];
            }
        }

        saveLogs() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
            } catch (e) {
                console.error('No se pudo guardar la observabilidad en localStorage', e);
            }
        }

        logEvent(type, data = {}) {
            const event = {
                id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(),
                timestamp: new Date().toISOString(),
                type,
                data
            };
            this.logs.push(event);
            
            // Mantener un limite de logs para no saturar el localStorage (max 500)
            if (this.logs.length > 500) {
                this.logs.shift();
            }
            this.saveLogs();
        }

        initInterceptors() {
            // 1. Errores JavaScript y de carga de recursos
            window.addEventListener('error', (e) => {
                if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
                    this.logEvent('resource_error', {
                        tag: e.target.tagName,
                        src: e.target.src || e.target.href
                    });
                } else {
                    this.logEvent('js_error', {
                        message: e.message,
                        filename: e.filename,
                        lineno: e.lineno,
                        colno: e.colno
                    });
                }
            }, true); // Fase de captura para recursos

            // 2. Promesas rechazadas
            window.addEventListener('unhandledrejection', (e) => {
                this.logEvent('promise_rejection', {
                    reason: e.reason ? e.reason.toString() : 'Unknown'
                });
            });

            // 3. Clics en enlaces, botones y controles
            document.addEventListener('click', (e) => {
                const target = e.target.closest('a, button, input, select, textarea, [role="button"]');
                if (target) {
                    this.logEvent('user_click', {
                        tag: target.tagName.toLowerCase(),
                        text: target.innerText ? target.innerText.substring(0, 50).trim() : '',
                        id: target.id || null,
                        classes: target.className || null,
                        href: target.href || null
                    });
                }
            });

            // 4. Cambios de visibilidad de la pestaña
            document.addEventListener('visibilitychange', () => {
                this.logEvent('visibility_change', {
                    state: document.visibilityState
                });
            });

            // 5. Tiempo de navegacion y carga (Performance API)
            window.addEventListener('load', () => {
                if (window.performance && performance.getEntriesByType) {
                    // Usamos setTimeout para asegurar que loadEventEnd se ha registrado
                    setTimeout(() => {
                        const navEntries = performance.getEntriesByType('navigation');
                        if (navEntries.length > 0) {
                            const nav = navEntries[0];
                            this.logEvent('page_load_performance', {
                                loadTimeMs: Math.round(nav.loadEventEnd - nav.startTime),
                                domInteractiveMs: Math.round(nav.domInteractive - nav.startTime)
                            });
                        }
                    }, 0);
                }
                
                // 6. Viewport, conexion y soporte de APIs
                this.logEvent('environment_snapshot', {
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    connection: (navigator.connection && navigator.connection.effectiveType) ? navigator.connection.effectiveType : 'unknown',
                    userAgent: navigator.userAgent,
                    hasLocalStorage: !!window.localStorage,
                    hasIntersectionObserver: !!window.IntersectionObserver
                });
            });
        }

        getSnapshot() {
            return this.logs;
        }

        clear() {
            this.logs = [];
            this.saveLogs();
        }
        
        generateDemoEvent() {
             this.logEvent('demo_event', { message: 'Este es un evento de demostración generado manualmente desde el dashboard.' });
        }
    }

    // Exponer globalmente
    window.CR7Observability = new ObservabilityTracker();
})();
