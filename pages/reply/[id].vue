<script setup>
import FontAwesome from "@/components/FontAwesome.vue";
import { useRoute } from 'vue-router';

//////////////////////// 数据放置处 start ////////////////////////
// ref => 接受任何类型，但是无法监听对象或数组内的变动   取值要加.value
// reactive => 只接受对象或数组，并监听内部变动   取值不用加.value
const owner=reactive({od_id:'',od_name:'',od_suffix:'',last_update_user:''})
let questions=reactive([]) // 问题数据
let notifys=reactive([]) // 通知数据
let question_box=ref(true)
let notify_box=ref(false)
let optionText=ref('') // 临时选项文字暂存区
let config=ref(useRuntimeConfig().public.api_url)
const route = useRoute()
const id = route.params.id
//////////////////////// 数据放置处 end ////////////////////////
definePageMeta({
    middleware: 'login-or-not'
})
checkToken()

onMounted(() => {
    $('.item-noreply .js-side-title').next('.js-side-content').hide();
    getOwner();
    let scrollBtn = $('.js-gototop');
    // 监听滚动事件
    $('main').scroll(function () {
        var scrollPosition = $('main').scrollTop(); // 当前滚动位置
        // 滚动位置大于100px显示按钮，否则隐藏按钮
        if (scrollPosition >= 100) {
            scrollBtn.css('display', 'inline-block');
        } else {
            scrollBtn.hide();
        }
    });
    // 窗口调整的时候，要恢复原状
    $(window).resize(function () {
        $(".js-popup-paper, .overlay").fadeOut();
        $("body").removeClass("no-scroll");
        $('aside').removeClass("is-active");
        $('.side-nav').removeClass("is-active");
    });
})

onUpdated(() => {

})

//////////////////////// method start ////////////////////////
// 获取本站相关数据
// 获取站主数据
async function getOwner(){
    await nextTick()
    const {data,pending,error,refresh} = await useFetch(config.value+'owner?od_id='+id,{
        method:"GET"
    });
    if(data.value){
        // 设置该站相关信息
        owner.od_id = data.value.owner.od_id
        owner.od_name = data.value.owner.od_name
        owner.od_suffix = data.value.owner.od_suffix
        owner.last_update_user = data.value.owner.last_update_user
        // 循环跑"问题"把json字符串转成array
        if (data.value.questions.length > 0) {
            for (let q = 0; q < data.value.questions.length; q++) {
                let question = data.value.questions[q];
                question.qd_content = JSON.parse(question.qd_content);
                question.qd_image = JSON.parse(question.qd_image);
                questions.push(question);
            }
        }
        // 循环跑"通知"把json字符串转成array
        if (data.value.notifys.length > 0) {
            // console.log('n_count',data.value.notifys.length)
            for (let n = 0; n < data.value.notifys.length; n++) {
                let notify = data.value.notifys[n];
                notify.nd_image = JSON.parse(notify.nd_image);
                notifys.push(notify);
            }
        }
    }
    if(error.value){
        notification('getOwner出错','error');
    }
}
// 开关侧边列表
function setSideNav(){
    $('aside').toggleClass("is-active");
    $('.side-nav').toggleClass("is-active");
    $("body").toggleClass("no-scroll");
    if($('aside').hasClass('is-active')){
        $(".overlay").fadeIn();
    }else{
        $(".overlay").fadeOut();
    }
}
// 将数字转成字符串
function answerToString(num){
    let number = num;
    let string = number.toString();
    return string;
}
// 回最上层
function goToTop(e){
    e.preventDefault();
    $('main').animate({ scrollTop: 0 }, 500);
}
// 开合问题/通知分类
function slideToggle(target){
    if(target == 'question'){
        question_box.value = !question_box.value;
        $('.item-reply .js-side-title').next('.js-side-content').stop().slideToggle();
    }else if(target == 'notify'){
        notify_box.value = !notify_box.value;
        $('.item-noreply .js-side-title').next('.js-side-content').stop().slideToggle();
    }
}
// 关闭所有弹窗
function closeAll(){
    $('.js-item').removeClass('item-active');
    $('.select-content').hide();
}
// 每个页面都需要检查token是否过期
async function checkToken(){
    const {data,pending,error,refresh} = await useFetch('/api/checkToken',{
        method:'GET'
    });
    if(pending){
        if(!data.value){
            return navigateTo('/login')
        }
    }
    if(error.value){
        notification('checkToken系统出错','error');
    }
}
//////////////////////// 推播框设置 ////////////////////////
///
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
<div @click="closeAll()" class="container preview page reply">
    <!-- header -->
    <header>
        <section class="header-content">
            <!-- top -->
            <div class="header-top clearfix">
                <NuxtLink to="/" title="返回列表" class="btn-link">
                    <FontAwesome iconName="angle-left"></FontAwesome>
                    <span>返回列表</span>
                </NuxtLink>
            </div>
            <!-- bottom -->
            <div class="header-bottom">
                <div class="title">{{ owner.od_name }}</div>
                <a href="javascript:void(0)" class="side-nav" @click="setSideNav()">
                    <FontAwesome iconName="bars"></FontAwesome>
                </a>
            </div>
        </section>
    </header>
    <!-- content -->
    <main>
        <!-- side -->
        <aside>
            <div class="page-side">
                <div class="btn-delete" @click="setSideNav()">
                    <FontAwesome iconName="xmark"></FontAwesome>
                </div>
                <div class="title">
                    问题总览
                    <span>{{ questions.length }}</span>
                </div>
                <div class="items-wrap">
                    <!-- 1 选择题 -->
                    <a v-for="(question,index) in questions" :href="'#Q'+index" @click="setSideNav()" class="item">
                        <div class="num">{{ index+1 }}</div>
                        <div class="feedback">
                            <div class="feedback-text">{{question.qd_title}}</div>
                            <div v-if="question.qd_type == 1" class="feedback-type feedback-choose">
                                选择题
                            </div>
                            <div v-else-if="question.qd_type == 2" class="feedback-type feedback-short-response">
                                简答题
                            </div>
                        </div>
                    </a>
                </div>
                <div class="title">
                    通知总览
                    <span>{{ notifys.length }}</span>
                </div>
                <div class="items-wrap">
                    <!-- 1 选择题 -->
                    <a v-for="(notify,index) in notifys" :href="'#N'+index" @click="setSideNav()" class="item">
                        <div class="num">{{ index+1 }}</div>
                        <div class="feedback">
                            <div class="feedback-text">{{notify.nd_title}}</div>
                            <div class="feedback-type feedback-choose">
                                僅通知
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </aside>
        <article>
            <!-- content -->
            <div class="page-content-wrap">
                <div class="page-content">
                    <!-- 需要回覆 區域 - 問題 -->
                    <div class="items-wrap item-reply">
                        <div class="title js-side-title" @click="slideToggle('question')">
                            <span class="test">问题</span>
                            <a v-if="question_box" href="javascript:void(0)" class="btn-link">
                                <FontAwesome iconName="minus"></FontAwesome>
                                <span>区块收合</span>
                            </a>
                            <a v-else href="javascript:void(0)" class="btn-link">
                                <FontAwesome iconName="plus"></FontAwesome>
                                <span>区块展开</span>
                            </a>
                        </div>
                        <div class="item-content js-side-content">
                            <div v-for="(question,index) in questions" v-bind:key="question.qd_order" class="item js-item" :class="{ 'noAnswer': !question.qd_answer }" :id="'Q'+index" :data-num="index" >
                                <div class="num">{{ index+1 }}</div>
                                <div class="preview-wrap">
                                    <div class="preview-title clearfix">
                                        <div>{{ question.qd_title }}</div>
                                    </div>
                                    <div class="preview-content">
                                        <div v-if="question.qd_image.length > 0" id="previewDiv">
                                            <div v-for="(img,index) in question.qd_image">
                                                <img :src="img">
                                            </div>
                                        </div>
                                        <div v-if="question.qd_type == 1" class="response choose-response">
                                            <div class="edit-choose">
                                                <el-radio-group v-model="question.qd_answer" class="ml-4">
                                                    <el-radio v-for="(con,num) in question.qd_content" :label="answerToString(num+1)" disabled>
                                                        <span>{{ con.text != '' ? con.text : '其他' }}</span>
                                                    </el-radio >
                                                </el-radio-group>
                                            </div>
                                        </div>
                                        <div v-else-if="question.qd_type == 2" class="response short-response">
                                            <textarea v-model="question.qd_answer" name="" id="" cols="30" rows="10" disabled></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 不需回覆 區域 - 通知 -->
                    <div class="items-wrap item-noreply">
                        <div class="title js-side-title" @click="slideToggle('notify')">
                            <span>依照BBIN规范调整，仅通知不需回覆</span>
                            <a v-if="notify_box" href="javascript:void(0)" class="btn-link">
                                <FontAwesome iconName="minus"></FontAwesome>
                                <span>区块收合</span>
                            </a>
                            <a v-else href="javascript:void(0)" class="btn-link">
                                <FontAwesome iconName="plus"></FontAwesome>
                                <span>区块展开</span>
                            </a>
                        </div>
                        <div class="item-content js-side-content">
                            <div v-for="(notify,index) in notifys" v-bind:key="notify.nd_order" class="item js-item" :id="'N'+index" :data-num="index">
                                <div class="num">{{ index+1 }}</div>
                                <div class="content-wrap">
                                    <div class="question-wrap">
                                        <div class="question clearfix">
                                            <div>{{ notify.nd_title }}</div>
                                        </div>
                                    </div>
                                    <div class="content">
                                        <div v-if="notify.nd_image.length > 0" id="previewDiv">
                                            <div v-for="(img,index) in notify.nd_image">
                                                <img :src="img">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 右侧边功能列 -->
                <div class="page-add-wrap">
                    <div class="page-add">
                        <a @click="goToTop($event)" href="javascript:void(0)" class="btn js-gototop">
                            <FontAwesome iconName="angle-up"></FontAwesome>
                        </a>
                    </div>
                </div>
            </div>
            <div @click="setSideNav()" class="overlay"></div>
        </article>
    </main>
</div>
</template>
<style scoped>
</style>
