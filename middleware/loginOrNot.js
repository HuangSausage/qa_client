export default defineNuxtRouteMiddleware((to, from) => {
    let user = useCookie('user');
    if(user.value === undefined){
        return navigateTo('/login')
    }
})
