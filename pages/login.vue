<script setup>
// ref => 接受任何类型，但是无法监听对象或数组内的变动   取值要加.value
// reactive => 只接受对象或数组，并监听内部变动   取值不用加.value
let keep_me = ref(true)
let error_account = ref(false)
let error_password = ref(false)
let error_login = ref(false)
let error_system = ref(false)
let user = reactive({'ud_account':'','ud_password':''})
let config = ref(useRuntimeConfig().public.api_url)

async function userLogin(){
    // 检查账号是否输入
    if(!user.ud_account){
        error_account.value = true
        $('input[name="ud_account"]').css('border-color','red');
        return
    }else{
        error_account.value = false
        $('input[name="ud_account"]').css('border-color','unset');
    }
    // 检查密码是否输入
    if(!user.ud_password){
        error_password.value = true
        $('input[name="ud_password"]').css('border-color','red');
        return
    }else{
        error_password.value = false
        $('input[name="ud_password"]').css('border-color','unset');
    }

    const {data , pending, error, refresh} = await useFetch(config.value+'login',{
            method:"POST",
            body:user
        });
    if(pending){
        var boolean = data.value == false ? true:false;
        if(boolean){
            user = {'ud_account':'','ud_password':''};
            error_login.value = true;
        }else{
            let user_data = useCookie('user');
            user_data.value = data.value.user;
            let token_data = useCookie('token');
            token_data.value = data.value.token;
            window.location.replace('/');
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
                                <span class="name">帐号</span><span v-show="error_account" class="error_account">请输入帐号</span>
                                <input name="ud_account" type="text" v-model="user.ud_account">
                            </div>
                            <div class="form-line">
                                <span class="name">密码</span><span v-if="error_password" class="error_password">请输入密码</span>
                                <input name="ud_password" type="password" v-model="user.ud_password">
                            </div>
                            <div class="form-keep clearfix">
                                <el-checkbox id="keep-pwd" v-model="keep_me"/>
                                <label for="keep-pwd"><span></span>记住我</label>
                            </div>
                            <span v-if="error_login" class="error_login">帐号密码有误，请重新输入</span>
                            <span v-if="error_system" class="error_login">系统出错，很严重，请通知Toby</span>
                            <a href="javascript:void(0)" @click="userLogin" class="btn btn-primary">登录</a>
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