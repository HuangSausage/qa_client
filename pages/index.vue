<script setup>
import FontAwesome from "@/components/FontAwesome.vue";
import CryptoJS from 'crypto-js';

//////////////////////// data放置处 start ////////////////////////
// 站主相关变量
let owners=reactive([]) // 全部站主
let owner=reactive({}) // 要被修改的站主资料暂存区
let owner_keyword=ref('') // 站主关键字
let orderBy=ref('create_date') // 排序依据
let sort=ref('DESC') // 排序方式
let showId=ref('') // 显示某站的操作菜单
let showContent=ref(false) // 操作菜单显示与否
let countStatus=reactive([0,0]) // 0:未回复 1:已回复
let paginate=reactive({'page':1,'limit':10})
let limit=ref(10) // 每页数的笔数 10 50 all
let page=ref(1) // 目前页数
let total=ref(0) // 目前资料总笔数
// 建立人相关变量
let onlyMine=ref(false) // 只显示登录者新增站主资讯
let user=reactive({}) // 登录者讯息
let users=reactive([]) // 全部建立人
let user_selected=ref('all') // 选择查看某个建立人
let user_selected_text=ref('全部') // 页面显示用，不能传到后端
let user_keyword=ref('') // 建立人关键字
// 状态相关变量
let status_selected=ref('all') // 选择查看某个状态 0.关闭 1.未回复 2.已回复 all.全部
let status_selected_text=ref('全部') // 页面显示用，不能传到后端
// 通用
let user_select=ref(false) // 建立人弹窗
let status_select=ref(false) // 状态弹窗
let config = ref(useRuntimeConfig().public.api_url)
let hashOwner = ref("") // 杂凑值暂存
// let pageScrollTop=ref(0) // 距离页首多远
//////////////////////// data放置处 end ////////////////////////
definePageMeta({
    middleware: 'login-or-not'
})
checkToken()
getUser()
onMounted(() => {
    updateLocalData()
    getUsers()
    getOwners()
})
onUpdated(() => {
    copyOwnerUrl()
})
//////////////////////// computed start ////////////////////////
let filUsers = computed(()=>{
    let ddd = users.filter(function(val){
        // 排除大小写的检索，先全部转成大写
        let udn = val.ud_name.toUpperCase()
        let kw = user_keyword.value.toUpperCase()
        return udn.indexOf(kw) != -1
    })
    return ddd
})
let newOwners = computed(()=>{
    let start = (parseInt(page.value) - 1) * parseInt(limit.value);
    if(total.value != 0){
        if(limit.value == 'all'){
            return owners;
        }else{
            return owners.slice(start, start + parseInt(limit.value));
        }
    }
})
let count = computed(()=>{
    if(total.value != 0){
        if(limit.value == 'all'){
            page.value = 1;
            return 1;
        }else{
            return Math.ceil(total.value / limit.value)
        }
    }else{
        return 1;
    }
})
//////////////////////// computed end ////////////////////////

//////////////////////// method start ////////////////////////
function goToCreate(){
    updateLocalData();
    return navigateTo('/edit/create')
}
function goToModify(id){
    updateLocalData();
    return navigateTo('/edit/'+id)
}
function goToPreview(id){
    return navigateTo('/reply/'+id)
}
//////////////////////// 通用功能 ////////////////////////
///
function copyContent(od_id){
    const owner = {'od_id':od_id};
    const owner_string = JSON.stringify(owner);
    const nowUrl = window.location.origin;
    // base64加密功能
    const ciphertext = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(owner_string))
    return nowUrl+'/login_owner/'+ciphertext;
}
// 点击复制杂凑过后的链接，方便贴给业主
function copyOwnerUrl(){
    $('.copy-area').copiq({
        parent: '.copy-wrap',
        content: '.copy-content',
        onSuccess: function($element, source, selection) {
            notification('复制成功','success');
        }
    });
}
// 点击空白处关闭弹窗
function closeAll(){
    status_select.value = false;
    user_select.value = false;
    showId.value = '';
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
// 登出并清除会员资料
async function clearCookies(){
    const {data,pending,error,refresh} = await useFetch('/api/clearCookies',{
        method:'GET'
    });
    if(data.value){
        return navigateTo('/login')
    }
    if(error.value){
        notification('checkToken系统出错','error');
    }
}
// 选择显示某个建立人的资料
function select_user(target){
    if(target == 'all'){
        user_selected.value = 'all';
        user_selected_text.value = '全部';
        user_select.value = false;
    }else{
        if(target.ud_account == user.ud_account){
            onlyMine.value = true;
        }else{
            onlyMine.value = false;
        }
        user_selected.value = target.ud_account;
        user_selected_text.value = target.ud_name;
        user_select.value = false;
    }
}
// 选择显示某个状态的资料
function select_status(target){
    if(target == 'all'){
        status_selected.value = 'all';
        status_selected_text.value  = '全部';
        status_select.value  = false;
    }else if(target == 0){
        status_selected.value  = 0;
        status_selected_text.value  = '关闭';
        status_select.value  = false;
    }else if(target == 1){
        status_selected.value  = 1;
        status_selected_text.value  = '未回复';
        status_select.value  = false;
    }else if(target == 2){
        status_selected.value  = 2;
        status_selected_text.value  = '已回复';
        status_select.value  = false;
    }
}
// 只显示日期就好
function showDate(dateTime){
    const array = dateTime.split(' ');
    return array[0];
}
// 状态转文字
function statusToString(status){
    if(status == 0){
        return '关闭';
    }else if(status == 1){
        return '未回复';
    }else if(status == 2){
        return '已回复';
    }
}
// 显示某站的操作菜单
function showOperateContent(id){
    if(showId.value == id){
        showId.value = '';
    }else{
        showId.value = id;
    }
}
// 翻页
function changePage(action){
    if(action == 'prev'){
        if(page.value <= 1){
            return false;
        }else{
            page.value = page.value -1
            pushForPaginate();
        }
    }else if(action == 'next'){
        if(page.value >= count.value){
            return false;
        }else{
            page.value = page.value +1
            pushForPaginate();
        }
    }
}
// 统计各状态数量
function countByStatus(){
    countStatus[0] = 0;
    countStatus[1] = 0;
    for (let i = 0; i < owners.length; i++) {
        if(owners[i].od_status == 1){
            countStatus[0] ++;
        }else if(owners[i].od_status == 2){
            countStatus[1] ++;
        }
    }
}
// 返回class name
function setClassName(target){
    if(orderBy.value == target){
        if(sort.value == 'DESC'){
            return 'drop';
        }else{
            return 'rise';
        }
    }else{
        return 'normal';
    }
}
// 修改排序目标及方式
function changeOrderBy(target){
    if(orderBy.value == target){
        sort.value = sort.value == 'DESC' ? 'ASC':'DESC';
        total.value = 0;
        getOwners();
    }else{
        orderBy.value = target;
        sort.value = 'DESC';
        total.value = 0;
        getOwners();
    }
}
//////////////////////// 搜索功能 ////////////////////////
///
// 搜索站主
function search_owner(){
    let localData = JSON.parse(sessionStorage.getItem("localData"));
    page.value = 1
    localData.page = 1;
    localData.owner_keyword = owner_keyword.value;
    localData.user_selected = user_selected.value;
    localData.user_selected_text = user_selected_text.value;
    sessionStorage.setItem("localData",JSON.stringify(localData));
    getOwners();
}
//////////////////////// session功能 //////////////////////
///
// 更新session(页码用)
function pushForPaginate(){
    if(sessionStorage.getItem("localData") != null){
        var localData = JSON.parse(sessionStorage.getItem("localData"));
    }else{
        var localData = {};
    }
    localData.limit = limit.value;
    localData.page = page.value;
    sessionStorage.setItem("localData",JSON.stringify(localData));
}
// 更新sessionStorage的数据
function updateLocalData(){
    if(sessionStorage.getItem("localData") != null){
        var localData = JSON.parse(sessionStorage.getItem("localData"));
    }else{
        var localData = {};
    }
    if(localData.upload){
        notification(localData.upload,'success');
        localData.upload = false;
    }
    if(localData.limit){
        limit.value = localData.limit;
    }else{
        localData.limit = limit.value;
    }
    if(localData.page){
        page.value = localData.page;
    }else{
        localData.page = page.value;
    }
    if(localData.orderBy){
        orderBy.value = localData.orderBy;
    }else{
        localData.orderBy = orderBy.value;
    }
    if(localData.sort){
        sort.value = localData.sort;
    }else{
        localData.sort = sort.value;
    }
    if(localData.user_selected){
        user_selected.value = localData.user_selected;
    }else{
        localData.user_selected = user_selected.value;
    }
    if(localData.user_selected_text){
        user_selected_text.value = localData.user_selected_text;
    }else{
        localData.user_selected_text = user_selected_text.value;
    }
    if(localData.status_selected){
        status_selected.value = localData.status_selected;
    }else{
        localData.status_selected = status_selected.value;
    }
    if(localData.status_selected_text){
        status_selected_text.value = localData.status_selected_text;
    }else{
        localData.status_selected_text = status_selected_text.value;
    }
    if(localData.pageScrollTop > 0){
        $('html,body').animate({ 'scrollTop': localData.pageScrollTop }, 250);
        localData.pageScrollTop = 0;
    }
    if(localData.owner_keyword){
        owner_keyword.value = localData.owner_keyword;
    }else{
        localData.owner_keyword = owner_keyword.value;
    }
    if(localData.user_keyword){
        user_keyword.value = localData.user_keyword;
    }else{
        localData.user_keyword = user_keyword.value;
    }
    if(localData.onlyMine){
        onlyMine.value = localData.onlyMine;
    }else{
        localData.onlyMine = onlyMine.value;
    }
    sessionStorage.setItem("localData",JSON.stringify(localData));
}
//////////////////////// 取值 ////////////////////////
///
// 取得站主资料
async function getOwners(){
    await nextTick()
    const {data,pending,error,refresh} = await useFetch(config.value+'owner-all-data?orderBy='+orderBy.value+'&sort='+sort.value+'&od_name='+owner_keyword.value+'&od_status='+status_selected.value+'&create_user='+user_selected.value,{
        method:"GET"
    });
    if(data.value){
        owners = data.value.owners
        total.value = data.value.owners.length
        countByStatus();
    }
    if(error.value){
        notification('getOwners出错','error');
    }
}
// 取得使用者资料
async function getUsers(){
    await nextTick()
    const {data,pending,error,refresh} = await useFetch(config.value+'users',{
        method:"GET"
    });
    if(data.value){
        users = data.value
        countByStatus();
    }
    if(error.value){
        notification('getUsers出错','error');
    }
}
// 取得登录者资料
function getUser(){
    user = useCookie('user');
    user = user.value;
}
//////////////////////// 弹出询问窗 ////////////////////////
///
// 删除站主的询问弹窗
function changeIsflag(id){
    ElMessageBox.confirm('确定要删除此问卷?',{
            confirmButtonText: '确定',
            cancelButtonText: '取消',
        })
        .then(() => {
            owner.od_id = id;
            owner.last_update_user = user.ud_account;
            deleteOwner();
        })
        .catch(() => {
            // 按取消键所需要执行的动作
        })
}
// 关闭站主的询问弹窗
function changeStatus(id){
    ElMessageBox.confirm('确定要关闭此问卷?',{
            confirmButtonText: '确定',
            cancelButtonText: '取消',
        })
        .then(() => {
            owner.od_id = id;
            owner.od_status = 0;
            owner.last_update_user = user.ud_account;
            closeOwner();
        })
        .catch(() => {
            // 按取消键所需要执行的动作
        })
}
//////////////////////// 修改区 ////////////////////////
///
// 修改站主状态
async function modifyOwner(){
    const dd = {
        'owner':owner,
    }
    const {data,pending,error,refresh} = await useFetch(config.value+'owner-modify',{
            method:"POST",
            body:dd
        });
    if(data.value){
        notification('修改成功!','success');
        owner = {};
        showId = ref('');
        showContent = ref(false);
        total.value = 0;
        getOwners();
    }
    if(error.value){
        notification('modifyOwner出错','error');
    }
}
// 删除站主
async function deleteOwner(){
    const {data,pending,error,refresh} = await useFetch(config.value+'owner-delete',{
            method:"POST",
            body:owner
        });
    if(data.value){
        notification('删除成功!','success');
        owner = {};
        showId = ref('');
        showContent = ref(false);
        getOwners();
    }
    if(error.value){
        notification('deleteOwner出错','error');
    }
}
// 关闭站主
async function closeOwner(){
    const {data,pending,error,refresh} = await useFetch(config.value+'owner-close',{
            method:"POST",
            body:owner
        });
    if(data.value){
        notification('关闭成功!','success');
        owner = {};
        showId = ref('');
        showContent = ref(false);
        getOwners();
    }
    if(error.value){
        notification('closeOwner出错','error');
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
// 监听选中建立人执行后端抓值
watch(user_selected,(newValue, oldValue) => {
    search_owner();
})
// 监听选中状态执行后端抓值
watch(status_selected,(newValue, oldValue) => {
    search_owner();
})
// 监听站名搜索
watch(owner_keyword,(newValue, oldValue) => {
    search_owner();
})
// 监听"只看我新增的问卷"的按钮
watch(onlyMine,(newValue, oldValue) => {
    if(onlyMine.value){
        user_selected_text.value = user.ud_name;
        user_selected.value = user.ud_account;
    }else{
        user_selected_text.value = '全部';
        user_selected.value = 'all';
    }
})
//////////////////////// method end ////////////////////////
</script>

<template>
<div @click="closeAll()" class="container index">
    <header>
        <section class="header-content">
            <!-- top -->
            <div class="header-top clearfix">
                <div class="header-title">
                    问题提问
                </div>
                <div class="header-menu">
                    <NuxtLink :to="'/user/'+user.ud_id" class="btn">
                        <FontAwesome iconName="pen-to-square"></FontAwesome>
                        <span>{{ user.ud_name }}</span>
                    </NuxtLink>
                    <NuxtLink @click="clearCookies()" class="btn">登出</NuxtLink>
                </div>
            </div>
            <!-- bottom -->
            <div class="header-bottom">
                <div class="header-search clearfix">
                    <div class="keyword-search">
                        <a href="javascript:void(0)" class="btn btn-noborder">
                            <FontAwesome iconName="magnifying-glass"></FontAwesome>
                        </a>
                        <input type="text" placeholder="关键字搜寻" v-model="owner_keyword">
                    </div>
                    <!-- 建立人 -->
                    <div class="header-select-man">
                        <div class="select-wrap js-select-wrap" :class="{'is-active':user_select}" @click.stop="user_select=!user_select,status_select=false">
                            <!-- title tabindex="1" -->
                            <div class="select-title js-select-title">
                                <span class="select-title-des">建立人</span>
                                <span class="select-title-value">{{ user_selected_text }}</span>
                                <FontAwesome v-if="user_select" iconName="angle-up"></FontAwesome>
                                <FontAwesome v-else iconName="angle-down"></FontAwesome>
                            </div>
                            <!-- content -->
                            <div v-if="user_select" class="select-content js-select-content" @click.stop>
                                <p><input type="text" v-model="user_keyword"></p>
                                <ul>
                                    <li @click="select_user('all')">全部</li>
                                    <li v-for="(uu,index) in filUsers" :key="index" @click="select_user(uu)">
                                        {{ uu.ud_name }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <!-- 状态 -->
                    <div class="header-select-state">
                        <div class="select-wrap js-select-wrap" :class="{'is-active':status_select}" @click.stop="status_select=!status_select,user_select=false">
                            <!-- title tabindex="-1"-->
                            <div class="select-title js-select-title">
                                <span class="select-title-des">状态</span>
                                <span class="select-title-value">{{ status_selected_text }}</span>
                                <FontAwesome v-if="status_select" iconName="angle-up"></FontAwesome>
                                <FontAwesome v-else iconName="angle-down"></FontAwesome>
                            </div>
                            <!-- content -->
                            <div v-if="status_select" class="select-content js-select-content" @click.stop>
                                <ul>
                                    <li @click="select_status('all')">全部</li>
                                    <li @click="select_status(1)">未回复</li>
                                    <li @click="select_status(2)">已回复</li>
                                    <li @click="select_status(0)">关闭</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="header-switch">
                        <input type="checkbox" id="switch" v-model="onlyMine"/>
                        <label for="switch">只看我新增的问卷</label>
                    </div>
                </div>
            </div>
        </section>
    </header>
    <main>
        <article class="content">
            <!-- paginate top -->
            <div class="paginate-wrap paginate-top clearfix">
                <a @click="goToCreate()" href="javascript:void(0)" class="btn btn-primary que-add">
                    <FontAwesome iconName="plus"></FontAwesome>
                    <span>新增问卷</span>
                </a>
                <div class="title">
                    共
                    <span class="all">{{total}}</span>则问卷
                    <span class="noreply">{{ countStatus[0] }}</span>则未回复
                    <span class="reply">{{ countStatus[1] }}</span>则已回复
                </div>
                <a href="javascript:void(0)" class="btn btn-s" :class="{'current':limit == 10}" @click="limit = 10">10则 / 页</a>
                <a href="javascript:void(0)" class="btn btn-s" :class="{'current':limit == 50}" @click="limit = 50">50则 / 页</a>
                <a href="javascript:void(0)" class="btn btn-s" :class="{'current':limit == 'all'}" @click="limit = 'all'">全部列出</a>
            </div>
            <!-- table -->
            <div class="que-wrap">
                <div class="que-head">
                    <div class="que-tr">
                        <div :class="setClassName('od_name')" class="que-td normal" @click="changeOrderBy('od_name')"><span>站名</span></div>
                        <div :class="setClassName('od_suffix')" class="que-td normal" @click="changeOrderBy('od_suffix')"><span>后置码</span></div>
                        <div :class="setClassName('create_user')" class="que-td normal" @click="changeOrderBy('create_user')"><span>建立人</span></div>
                        <div :class="setClassName('last_update_user')" class="que-td normal" @click="changeOrderBy('last_update_user')"><span>最后修改人</span></div>
                        <div :class="setClassName('create_date')" class="que-td normal" @click="changeOrderBy('create_date')"><span>建立日期</span></div>
                        <div :class="setClassName('od_status')" class="que-td normal" @click="changeOrderBy('od_status')"><span>状态</span></div>
                        <div class="que-td nonePointer">操作</div>
                    </div>
                </div>
                <div class="que-body">
                    <!-- 1 -->
                    <div v-for="owner in newOwners" v-bind:key="owner.od_id" class="que-tr">
                        <div class="que-td">
                            <a @click="owner.od_status == 2 ? goToPreview(owner.od_id) : goToModify(owner.od_id)" href="javascript:void(0)" :title="owner.od_name">{{ owner.od_name }}</a>
                        </div>
                        <div class="que-td">{{ owner.od_suffix }}</div>
                        <div class="que-td">{{ owner.create_user }}</div>
                        <div class="que-td">{{ owner.last_update_user }}</div>
                        <div class="que-td">{{ showDate(owner.create_date) }}</div>
                        <div class="que-td">
                            <span class="tip" :class="{'tip-archive' : owner.od_status == 0,'tip-noreply' : owner.od_status == 1,'tip-state' : owner.od_status == 2}">{{ statusToString(owner.od_status) }}</span>
                        </div>
                        <div class="que-td">
                            <div class="operate-select-wrap js-select-wrap">
                                <div @click.stop="showOperateContent(owner.od_id)" class="btn btn-noborder js-select-title">
                                    <FontAwesome iconName="ellipsis-vertical"></FontAwesome>
                                </div>
                                <div v-if="showId == owner.od_id" class="operate-content js-select-content" @click.stop>
                                    <p class="operate-des clearfix">
                                        <span>操作</span>
                                        <FontAwesome iconName="ellipsis-vertical"></FontAwesome>
                                    </p>
                                    <ul class="clearfix">
                                        <li v-if="owner.od_status == 2">
                                            <NuxtLink :to="'/reply/'+owner.od_id">
                                                <FontAwesome iconName="eye"></FontAwesome>
                                                <span>查看业主回复</span>
                                            </NuxtLink>
                                        </li>
                                        <li v-if="owner.od_status != 0" class="copy-wrap">
                                            <a class="copy-area" href="javascript:void(0)">
                                                <span class="copy-content">{{ copyContent(owner.od_id) }}</span>
                                                <FontAwesome iconName="arrow-up-right-from-square"></FontAwesome>
                                                <span>复制链接(雙擊)</span>
                                            </a>
                                        </li>
                                        <li v-if="owner.od_status != 0">
                                            <a href="javascript:void(0)" @click="changeStatus(owner.od_id)">
                                                <FontAwesome iconName="lock"></FontAwesome>
                                                <span>关闭问卷</span>
                                            </a>
                                        </li>
                                        <li class="operate-del">
                                            <a href="javascript:void(0)" @click="changeIsflag(owner.od_id)">
                                                <FontAwesome iconName="trash-can"></FontAwesome>
                                                <span>删除问卷</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- paginate bottom -->
            <div class="paginate-wrap paginate-bottom">
                <a href="javascript:void(0)" class="btn" :class="{'btn-disable':page <= 1}" @click="page <= 1 || total == 0 ? false : changePage('prev')">
                    <FontAwesome iconName="angle-left"></FontAwesome>
                </a>
                <input name="page" type="text" v-model="page">
                <span>/ {{count}}</span>
                <a href="javascript:void(0)" class="btn" :class="{'btn-disable':page >= count}" @click="page == count || count == 0 ? false : changePage('next')">
                    <FontAwesome iconName="angle-right"></FontAwesome>
                </a>
            </div>
        </article>
    </main>
</div>
</template>
<style scoped>
</style>
