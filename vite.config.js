import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import monkey, { cdn } from "vite-plugin-monkey";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [],
        }),
        Components({
            resolvers: [],
        }),

        monkey({
            entry: "src/main.js",
            userscript: {
                icon: "https://www.google.com/s2/favicons?sz=64&domain=pixiv.net",
                namespace: "npm/vite-plugin-monkey",
                match: ["https://www.pixiv.net/*"],
            },
            build: {
                externalGlobals: {
                    vue: cdn.jsdelivr("Vue", "dist/vue.global.prod.js"),
                },
            },
        }),
    ],
});
