import jwt from 'jsonwebtoken'

const runtimeConfig = useRuntimeConfig()

export default defineEventHandler((event) => {
    const jwtToken = getCookie(event, 'token')
    try {
        const token = jwt.verify(jwtToken, runtimeConfig.secret)
        const nowDate = Math.floor(Date.now() / 1000);
        if(token.exp > nowDate){
            const newToken = jwt.sign({
                algorithm: 'HS256',
                exp: Math.floor(Date.now() / 1000) + (60 * 60), // token一個小時後過期。
                data: token.data
            }, runtimeConfig.secret);
            setCookie(event, 'token', newToken);
            return true;
        }else{
            setCookie(event, 'token', null);
            setCookie(event, 'user', null);
            return false;
        }
    } catch (e) {
        return false;
    }
})