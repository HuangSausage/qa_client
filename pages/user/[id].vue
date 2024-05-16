<script setup>
import FontAwesome from "@/components/FontAwesome.vue";
// ref => 接受任何类型，但是无法监听对象或数组内的变动   取值要加.value
// reactive => 只接受对象或数组，并监听内部变动   取值不用加.value
let user=reactive({}) // 登录者信息
let user_personal=reactive({
	ud_id:'',
	ud_account:'',
	ud_name:'',
	ud_password:'',
	ud_now_password:'',
	ud_new_password:'',
	ud_confirm_password:'',
	last_update_user:'',
}) // 登录者信息
let config = ref(useRuntimeConfig().public.api_url)

checkToken()
getUser()

onMounted(() => {

})

// 获取登录者数据
function getUser(){
    user = useCookie('user');
	user_personal.ud_id = user.value.ud_id;
	user_personal.ud_account = user.value.ud_account;
	user_personal.ud_name = user.value.ud_name;
	user_personal.ud_password = user.value.ud_password;
}
// 每个页面都需要检查token是否过期
async function checkToken(){
    const {data,pending,error,refresh} = await useFetch('/api/checkToken',{
        method:'GET'
    });
    if(!data.value){
        return navigateTo('/login')
    }
    if(error.value){
        notification('checkToken系统出错','error');
    }
}
// 登出并清除会员数据
function clearCookies(){
    let user = useCookie('user');
    user = null;
    let token = useCookie('token');
    token = null;
    window.location.replace('/login');
}
// 修改问卷
async function modify(){
	// console.log(user_personal.ud_now_password)
    if(!user_personal.ud_now_password){
        notification('请输入旧密码','warning');
        return
    }
	if(user_personal.ud_now_password != user_personal.ud_password){
		notification('旧密码输入错误','warning');
        return
	}
	if(!user_personal.ud_new_password){
        notification('请输入新密码','warning');
        return
    }
	if(!user_personal.ud_confirm_password){
        notification('请输入确认密码','warning');
        return
    }
	if(user_personal.ud_now_password == user_personal.ud_new_password){
		notification('新密码不能跟旧密码一样','warning');
        return
	}
	if(user_personal.ud_confirm_password != user_personal.ud_new_password){
		notification('新密码跟确认密码不相同','warning');
        return
	}
    user_personal.last_update_user = user_personal.ud_account;
    const {data,pending,error,refresh} = await useFetch(config.value+'user-modify-personal',{
            method:"POST",
            body:user_personal
        });
    if(data.value){
        if(sessionStorage.getItem("localData") != null){
            var localData = JSON.parse(sessionStorage.getItem("localData"));
        }else{
            var localData = {};
        }
        localData.upload = '修改成功！';
        sessionStorage.setItem("localData",JSON.stringify(localData));
		let user_data = useCookie('user');
        user_data.value = data.value;
        return navigateTo('/')
    }
    if(error.value){
        notification('modify出错','error');
        return
    }
}
// 推播提示框
function notification(string,type){
    if(type == 'success'){
        ElNotification({
            title: '成功',
            message: string,
            type: type,
            showClose: false,
        })
    }else if(type == 'warning'){
        ElNotification({
            title: '警告',
            message: string,
            type: type,
            showClose: false,
        })
    }else if(type == 'error'){
        ElNotification({
            title: '失败',
            message: string,
            type: type,
            showClose: false,
        })
    }
}
</script>

<template>
    <div class="container user page">
		<!-- header -->
		<header>
            <section class="header-content">
                <!-- top -->
                <div class="header-top clearfix">
					<NuxtLink to="/" title="返回列表" class="btn-link">
						<FontAwesome iconName="angle-left"></FontAwesome>
						<span>返回列表</span>
					</NuxtLink>
                    <div class="header-title">
                        问题提问
                    </div>
                    <div class="header-menu">
                        <!-- <NuxtLink :to="'/user/'+user.ud_id" class="btn">
							<FontAwesome iconName="pen-to-square"></FontAwesome>
							<span>{{ user.ud_name }}</span>
						</NuxtLink> -->
						<NuxtLink @click="clearCookies()" class="btn">登出</NuxtLink>
                    </div>

                </div>
            </section>
        </header>
        <main>
			<article class="content">
                <!-- paginate top -->
                <div class="paginate-wrap paginate-top clearfix">
                    <div class="title">
                        个人资料修改
                    </div>
                </div>
                <!-- table -->
                <div class="user-wrap clearfix">
                    <div class="user-tr">
                        <div class="user-td">用户账号</div>
                        <div class="user-td"><span>{{ user_personal.ud_account }}</span></div>
                    </div>
                    <div class="user-tr">
                        <div class="user-td">用户名称</div>
                        <div class="user-td"><input type="text" v-model="user_personal.ud_name" disabled></div>
                    </div>
                    <div class="user-tr">
                        <div class="user-td">旧密码</div>
                        <div class="user-td"><input type="text" v-model="user_personal.ud_now_password"></div>
                    </div>
                    <div class="user-tr">
                        <div class="user-td">新密码</div>
                        <div class="user-td"><input type="text" v-model="user_personal.ud_new_password"></div>
                    </div>
                    <div class="user-tr">
                        <div class="user-td">确认密码</div>
                        <div class="user-td"><input type="text" v-model="user_personal.ud_confirm_password"></div>
                    </div>
                </div>
                <div class="user-paginate-wrap">
					<NuxtLink to="/" title="取消" class="btn">
						<span>取消</span>
					</NuxtLink>
                    <a @click="modify()" href="javascript:void(0)" class="btn btn-primary">修改</a>
                </div>
            </article>
        </main>
    </div>
</template>
<style scoped>
</style>