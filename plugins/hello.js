export default defineNuxtPlugin((nuxtApp) => {
    return {
        provide:{
            hello: (name)=> `Hello ${name}`
        }
    }
})
