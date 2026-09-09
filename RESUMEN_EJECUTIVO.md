# Resumen Ejecutivo: Implementación y Flujo CI/CD

Este documento sintetiza la arquitectura del ciclo de vida del proyecto web "Tributo a Cristiano Ronaldo", detallando la estructura del repositorio, el pipeline de automatización y las pruebas realizadas para asegurar la estabilidad y calidad antes de su paso a producción.

## 1. Flujo de Infraestructura (CI/CD)

El proyecto emplea un flujo de trabajo moderno y automatizado basado íntegramente en el ecosistema de GitHub, eliminando la necesidad de servidores intermedios:

* **GitHub Repository (Código Fuente):** Actúa como la única fuente de verdad. Almacena el código nativo (HTML, CSS, JS) y la configuración de infraestructura como código (flujos YAML y reglas de linters).
* **GitHub Actions (Integración Continua):** Intercepta cada cambio (`push`) en la rama principal (`main`). Su función es levantar entornos aislados para someter el código a estrictas pruebas de calidad y seguridad. Si alguna prueba crítica falla, el despliegue se bloquea.
* **GitHub Pages (Despliegue Continuo):** Funciona como el servidor de producción. Únicamente cuando GitHub Actions certifica que todas las pruebas pasaron en verde, toma los archivos estáticos de la carpeta del proyecto y los publica de forma automática y gratuita en la web.

## 2. Pruebas y Auditorías Automatizadas

Para garantizar un código limpio y seguro, el flujo de GitHub Actions realiza las siguientes pruebas automáticas en cada actualización:

1. **Auditoría de Calidad (Super-Linter):**
    * **HTML & JS:** Verifica que la estructura HTML sea semántica y que el código JavaScript carezca de errores de sintaxis (`htmlhint` y `eslint`).
    * **CSS:** Se configuró `stylelint` a través de un archivo de exclusión (`.github/linters/.stylelintrc.json`). Esto permite que el linter detecte errores estructurales graves en el CSS, pero ignore reglas puramente estéticas (como el formato de porcentajes en opacidades) para proteger la compatibilidad en navegadores antiguos.
2. **Auditoría de Seguridad (CodeQL):**
    * Utiliza el motor de análisis semántico avanzado de GitHub para escanear el JavaScript en busca de vulnerabilidades, flujos de datos no controlados y prácticas inseguras.

## 3. Resumen de Hitos del Proyecto

Adicional a la automatización, durante el desarrollo se completaron las siguientes implementaciones técnicas:

* **Desarrollo Nativo (Vanilla):** Creación de un sitio responsivo e interactivo sin depender de dependencias, librerías o frameworks (cero React o Node.js en el cliente).
* **Accesibilidad y UX:** Ejecución de una auditoría manual bajo el estándar WCAG 2.2 AA, corrigiendo contrastes, navegación por teclado (implementación de *skip-links*) y semántica web.
* **Observabilidad sin Backend:** Implementación de un sistema de telemetría completamente local que intercepta errores, monitorea el rendimiento (Performance API) y registra interacciones del usuario almacenándolas en `localStorage`. Se expuso a través de un *Dashboard* local aislado.
