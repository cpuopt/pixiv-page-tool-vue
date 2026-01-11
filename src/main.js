import { createApp } from 'vue';
import './style.css';
import 'element-plus/dist/index.css';
import App from './App.vue';
import './style.scss';

const app = createApp(App);

app.mount(
    (() => {
        const app = document.createElement('div');
        app.id = 'pixiv-page-tool';

        document.body.append(app);
        return app;
    })()
);
