//
//   Copyright 2026 Deutsches Zentrum für Luft- und Raumfahrt e.V.
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//

import Aura from '@primeng/themes/aura';

// import Lara from "@primeng/themes/lara";
// import Material from "@primeng/themes/material";
// import Nora from "@primeng/themes/nora";
import {definePreset} from '@primeng/themes';
// import PrimeUI from "tailwindcss-primeui";

/**
 * Preset to define custom color values. Or other values. See {@link https://primeng.org/theming#customization}
 * and {@link https://primeng.org/theming#colors} for changes.
 */
const PrimePresetAuraCustom = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}',
        },
    },
});
/**
 * Configured default primeng theme. See {@link https://primeng.org/theming#customization}
 * see {@link https://primeng.org/configuration}
 */
export const PrimeNgTheme = {
    // darkMode: ["selector", '[class="p-dark"]'],
    content: ['./src/**/*.{html,ts}'],
    // plugins: [PrimeUI],
    theme: {
        preset: PrimePresetAuraCustom,
        options: {
            darkModeSelector: '.my-app-dark',
            // layers not working correctly, have a deeper look on how to use
            // see https://primeng.org/theming#configuration - cssLayer
            // cssLayer: {
            //     name: "primeng",
            //     order: "app-styles, primeng, another-css-library",
            // },
        },
    },
    zIndex: {
        modal: 1200, // dialog, sidebar
        overlay: 1000, // dropdown, overlaypanel (PrimeNg only!)
        menu: 1000, // overlay menus
        tooltip: 1200, // tooltip
    },
};
