<script setup>
import CryptoJS from 'crypto-js';

// ref => 接受任何型态，但是无法监听物件或阵列内的变动   取值要加.value
// reactive => 只接受物件或阵列，并监听内部变动   取值不用加.value
let error_suffix = ref(false)
let error_login = ref(false)
let error_system = ref(false)
let owner = reactive({'od_suffix':'','od_id':''})
let config = ref(useRuntimeConfig().public.api_url)
const route = useRoute();
const hash = route.params.hash;
onMounted(() => {
    // base64解密功能
    const decrypted  = CryptoJS.enc.Base64.parse(hash).toString(CryptoJS.enc.Utf8);
    const decrypted_object = JSON.parse(decrypted);
    owner.od_id = decrypted_object.od_id;
})
async function ownerLogin(){
    // 检查后置码是否输入
    if(!owner.od_suffix){
        error_suffix.value = true
        $('input[name="od_suffix"]').css('border-color','red');
        return
    }else{
        error_suffix.value = false
        $('input[name="od_suffix"]').css('border-color','unset');
    }
    const {data , pending, error, refresh} = await useFetch(config.value+'login_owner',{
            method:"POST",
            body:owner
        });
    if(data.value){
        var boolean = data.value.length > 0 ? true:false;
        if(boolean){
            owner = {'od_suffix':'','od_id':''};
            error_login.value = true;
        }else{
            let owner_data = useCookie('owner');
            owner_data.value = data.value.owner;
            let owner_token_data = useCookie('owner_token');
            owner_token_data.value = data.value.token;
            // base64加密功能
            const owner_string = JSON.stringify(data.value.owner);
            const ciphertext = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(owner_string))
            window.location.replace('/owner/'+ciphertext);
        }
    }
    if(error.value){
        error_system.value = true;
    }
}
</script>

<template>
<div class="container login">
    <main>
        <section>
            <div class="login-wrap clearfix">
                <div class="login-side"></div>
                <div class="login-content">
                    <div class="form-wrap">
                        <div class="form-title">问题提问</div>
                        <div class="form-content">
                            <div class="form-line">
                                <span class="suffix">后置码</span><span v-show="error_suffix" class="error_suffix">请输入后置码</span>
                                <input name="od_suffix" type="text" placeholder="@bbin" v-model="owner.od_suffix">
                            </div>
                            <span v-if="error_login" class="error_login">后置码有误，请重新输入</span>
                            <span v-if="error_system" class="error_login">系统出错，很严重，请通知Toby</span>
                            <a href="javascript:void(0)" @click="ownerLogin" class="btn btn-primary">登录</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg"></div>
            <div class="bg bg2"></div>
            <div class="bg bg3"></div>
        </section>
    </main>
</div>
</template>
<style scoped>
</style>