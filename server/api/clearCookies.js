
export default defineEventHandler((event) => {

    try {
        setCookie(event, 'token', null);
        setCookie(event, 'owner_token', null);
        setCookie(event, 'user', null);
        return true;
    } catch (e) {
        return false;
    }
})