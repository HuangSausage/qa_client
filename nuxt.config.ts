// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        pageTransition: { name: 'page', mode: 'out-in' },// 換頁的動畫
        head: {
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            link: [
                // { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.ico' }
            ],
            script:[
                {src:"https://code.jquery.com/jquery-3.7.1.min.js"},
                {src:"https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"},
                {src:"/js/script.js"},
                {src:"/js/jquery.copiq.min.js"},
            ]
        },
    },
    devtools: { enabled: true },
    "components": {
        "dirs": [
            {
                "path": "~/components/global",
                "global": true
            }
        ]
    },
    css: [
        '@/assets/scss/style.scss'
    ],
    runtimeConfig: {
        secret: process.env.MY_SECRET,
        public: {
            api_url: process.env.API_URL
        }
    },
    modules: [
        '@element-plus/nuxt'
    ],

})
