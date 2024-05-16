<script setup>
import FontAwesome from "@/components/FontAwesome.vue";
import Sortable from "sortablejs";
import { useRoute } from 'vue-router';

//////////////////////// data放置處 start ////////////////////////
// ref => 接受任何型態，但是無法監聽物件或陣列內的變動   取值要加.value
// reactive => 只接受物件或陣列，並監聽內部變動   取值不用加.value
let qd_image=reactive([])
const owner=reactive({od_id:'',od_name:'',od_suffix:'',last_update_user:''})
let questions=reactive([]) // 問題資料
let notifys=reactive([]) // 通知資料
let user=reactive({}) // 登入者訊息
let question_box=ref(true)
let notify_box=ref(true)
let optionText=ref('') // 臨時選項文字站存區
let config=ref(useRuntimeConfig().public.api_url)
// 一次性變數，頁面載入後使用該功能只執行第一次即可
let runSortableForQuestion=ref(true)
let runSortableForNotify=ref(true)
const route = useRoute();
const id = route.params.id;
let uploadImageFinished=ref(true)
//////////////////////// data放置處 end ////////////////////////
definePageMeta({
    middleware: 'login-or-not'
})
checkToken()
getUser()

onMounted(() => {
    getOwner()
    let scrollBtn = $('.js-gototop');
    // 監聽滾動事件
    $('main').scroll(function () {
        var scrollPosition = $('main').scrollTop(); // 當前滾動位置
        // 滾動位置大於100px顯示按鈕，否則隱藏按鈕
        if (scrollPosition >= 100) {
            scrollBtn.css('display', 'inline-block');
        } else {
            scrollBtn.hide();
        }
    });
    // 視窗調整的時候，要恢復原狀
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
// 取得本站相關資料
// 取得站主資料
async function getOwner(){
    await nextTick()
    const {data,pending,error,refresh} = await useFetch(config.value+'owner?od_id='+id,{
        method:"GET"
    });
    if(data.value){
        // 設定該站相關資訊
        owner.od_id = data.value.owner.od_id
        owner.od_name = data.value.owner.od_name
        owner.od_suffix = data.value.owner.od_suffix
        owner.last_update_user = data.value.owner.last_update_user
        // 迴圈跑"問題"把json字串轉成array
        if (data.value.questions.length > 0) {
            for (let q = 0; q < data.value.questions.length; q++) {
                let question = data.value.questions[q];
                question.qd_content = JSON.parse(question.qd_content);
                question.qd_image = JSON.parse(question.qd_image);
                questions.push(question);
            }
        }
        // 迴圈跑"通知"把json字串轉成array
        if (data.value.notifys.length > 0) {
            // console.log('n_count',data.value.notifys.length)
            for (let n = 0; n < data.value.notifys.length; n++) {
                let notify = data.value.notifys[n];
                notify.nd_image = JSON.parse(notify.nd_image);
                notifys.push(notify);
            }
        }
        initSortableForQuestion();
        initSortableForNotify();
    }
    if(error.value){
        notification('getOwner出錯','error');
    }
}
// 開關側邊列表
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
// 取得當下的時間
function changeNowDateTime(){
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}
// 取得登入者資料
function getUser(){
    user = useCookie('user');
    user = user.value;
}
// 拖拉套件渲染 - 問題
function initSortableForQuestion (){
    let qq = document.querySelector('.item-reply .js-side-content');
    let dragTable = Sortable.create(qq, {
        animation: 150,
        disabled: false,
        handle: ".moveIcon", //指定拖曳目標，點選此目標才可拖曳元素(此例中設定操作按鈕拖曳)
        dragClass: "dragItem", //設定拖曳樣式類別名
        ghostClass: "ghostItem", //設定拖曳停靠樣式類別名
        chosenClass: "chosenItem", //設定選取樣式類別名
        //開始拖曳事件
        onStart: () => {
        },
        //結束拖曳事件
        onEnd: ({ newIndex, oldIndex }) => {
            const currRow = questions.splice(oldIndex, 1)[0];
            questions.splice(newIndex, 0, currRow);
        },
    });
}
// 拖拉套件渲染 - 通知
function initSortableForNotify (){
    let rr = document.querySelector('.item-noreply .js-side-content');
    let dragTable = Sortable.create(rr, {
        animation: 150,
        disabled: false,
        handle: ".moveIcon", //指定拖曳目標，點選此目標才可拖曳元素(此例中設定操作按鈕拖曳)
        dragClass: "dragItem", //設定拖曳樣式類別名
        ghostClass: "ghostItem", //設定拖曳停靠樣式類別名
        chosenClass: "chosenItem", //設定選取樣式類別名
        //開始拖曳事件
        onStart: () => {
        },
        //結束拖曳事件
        onEnd: ({ newIndex, oldIndex }) => {
            const currRow = notifys.splice(oldIndex, 1)[0];
            notifys.splice(newIndex, 0, currRow);
        },
    });
}
// 回最上層
function goToTop(e){
    e.preventDefault();
    $('main').animate({ scrollTop: 0 }, 500);
}
// 開合問題/通知分類
function slideToggle(target){
    if(target == 'question'){
        question_box.value = !question_box.value;
        $('.item-reply .js-side-title').next('.js-side-content').stop().slideToggle();
    }else if(target == 'notify'){
        notify_box.value = !notify_box.value;
        $('.item-noreply .js-side-title').next('.js-side-content').stop().slideToggle();
    }
}
// 開闔問題類型下拉選單
function typeToggle(e){
    let target = $(e.currentTarget).find('.select-content');
    if(target.css('display') == 'block'){
        target.hide();
    }else{
        $('.select-content').hide();
        $(e.currentTarget).find('.select-content').show();
    }
}
// 選擇某個問題/通知進行編輯
function modifyQuestion(e){
    $(e.currentTarget).addClass(function(){
        if(!$(this).hasClass('item-active')){
            optionText.value = '';
            $('.select-content').hide();
            $('.item-reply .js-item').removeClass('item-active');
            $(this).addClass('item-active')
            $(this).removeClass('noTitle');
        }
    })
}
// 選擇某個問題/通知進行編輯
function modifyNotify(e){
    $(e.currentTarget).addClass(function(){
        if(!$(this).hasClass('item-active')){
            optionText.value = '';
            $('.select-content').hide();
            $('.item-noreply .js-item').removeClass('item-active');
            $(this).addClass('item-active')
            $(this).removeClass('noTitle');
        }
    })
}
// 改變問題類型，並清除原本的資料
function changeType(qd_type,question){
    question.qd_type = qd_type;
    question.qd_content = [];
}
// 新增問題選項
function addOption(array,num){
    if(optionText.value != '' && !optionText.value.match(/^\s+$/)){
        if(array.length != 0){
            var boolean = false;
            for (let i = 0; i < array.length; i++) {
                if(array[i].text == optionText.value){
                    boolean = true;
                    break;
                }
            }
            if(boolean){
                notification('已經有相同的選項了','warning');
            }else{
                if(array[array.length-1].type == 'other'){
                    array.splice(array.length-1,0,{type:'option',text:optionText.value});
                    questions[num].qd_content = array;
                    optionText.value = '';
                }else{
                    array.push({type:'option',text:optionText.value})
                    questions[num].qd_content = array;
                    optionText.value = '';
                }
            }
        }else{
            array.push({type:'option',text:optionText.value})
            questions[num].qd_content = array;
            optionText.value = '';
        }
    }else{
        notification('請填入選項文字','warning');
    }
}
// 新增"其他"選項
function addOtherOption(array,num){
    if(array.length != 0 && array[array.length-1].type == 'other'){
        notification('已有"其他"這個選項了','warning');
    }else{
        array.push({type:'other',text:''})
        questions[num].qd_content = array;
    }
}
// 刪除此選項
function deleteOption(array,num){
    array.splice(num,1);
}
// 新增問題
function addQuestion(){
    if(runSortableForQuestion){
        initSortableForQuestion()
        runSortableForQuestion=ref(false)
    }
    questions.push({
        qd_type:1,
        qd_content:[],
        qd_title:'',
        qd_order:questions.length+1,
        qd_image:[]
    });
}
// 新增通知
function addNotify(){
    if(runSortableForNotify){
        initSortableForNotify()
        runSortableForNotify=ref(false)
    }
    notifys.push({
        nd_title:'',
        nd_order:notifys.length+1,
        nd_image:[]
    });
}
// 複製此問題
function copyQuestion(num){
    let object = JSON.parse(JSON.stringify(questions[num]));
    object.qd_order = questions.length+1;
    object.qd_id = null;
    questions.push(object);
}
// 複製此通知
function copyNotify(num){
    let object = JSON.parse(JSON.stringify(notifys[num]));
    object.nd_order = notifys.length+1;
    object.nd_id = null;
    notifys.push(object);
}
// 刪除此問題
function deleteQuestion(num){
    ElMessageBox.confirm('您是否要刪除此問題？','刪除問題',{
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning',
            center: true,
        })
        .then(() => {
            questions.splice(num, 1);
            notification('刪除成功','success');
            optionText.value = '';
            $('.select-content').hide();
            $('.item-reply .js-item').removeClass('item-active');
        })
        .catch(() => {
            // 按取消鍵所需要執行的動作
        })
}
// 刪除此通知
function deleteNotify(num){
    ElMessageBox.confirm('您是否要刪除此通知？','刪除通知',{
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning',
            center: true,
        })
        .then(() => {
            notifys.splice(num,1);
            notification('刪除成功','success');
            optionText.value = '';
            $('.select-content').hide();
            $('.item-noreply .js-item').removeClass('item-active');
        })
        .catch(() => {
            // 按取消鍵所需要執行的動作
        })
}
// 刪除此問卷-彈窗確認
function deleteOwner_confirm(){
    ElMessageBox.confirm('您是否要刪除此問卷？','刪除問卷',{
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning',
            center: true,
        })
        .then(() => {
            deleteOwner();
        })
        .catch(() => {
            // 按取消鍵所需要執行的動作
        })
}
// 關閉所有彈窗
function closeAll(){
    $('.js-item').removeClass('item-active');
    $('.select-content').hide();
}
// 每個頁面都需要檢查token是否過期
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
        notification('checkToken系統出錯','error');
    }
}
//////////////////////// 圖片上傳事件 ////////////////////////
///
// 選擇圖片上傳
function selectImage(e){
    $(e.currentTarget).find("input[type='file']").click()
}
async function getFile(e){
    const files = e.target.files
    let filename = files[0].name
    if ( filename.lastIndexOf('.') <= 0 ) {
        notification('別鬧，傳個正確的圖上來！','warning');
        return
    }
    let fd = new FormData()
    fd.append('imageFile',files[0])
    // let fd = new FormData()
    // fd.append('imageFile',files[0])
    // const {data,pending,error,refresh} = await useFetch(self.config+'image-create',{
    //     method:"POST",
    //     body:fd
    // });
    const reader = new FileReader();
    reader.addEventListener('load',() => {
        qd_image.push(reader.result)
    })
    reader.readAsDataURL(files[0])
}
async function uploadImage(e,type,target){
    uploadImageFinished=ref(false)
    let number = 0;
    const files = e.target.files
    let filename = files[0].name
    if ( filename.lastIndexOf('.') <= 0 ) {
        notification('別鬧，傳個正確的圖上來！','warning');
        return
    }
    // 上傳圖片需要點時間，先用base64顯示出來，等等在用圖片路徑取代
    const reader = new FileReader();
    reader.addEventListener('load',() => {
        if(type === 'question'){
            target.qd_image.push(reader.result)
            number = target.qd_image.length
        } else if (type === 'notify'){
            target.nd_image.push(reader.result)
            number = target.nd_image.length
        }
    })
    reader.readAsDataURL(files[0])

    let fd = new FormData()
    fd.append('imageFile',files[0])
    const {data,pending,error,refresh} = await useFetch(config.value+'image-create',{
            method:"POST",
            body:fd
        });
    if(pending){
        if(type === 'question'){
            target.qd_image.splice(number-1,1,data.value)
            uploadImageFinished=ref(true)
        } else if (type === 'notify'){
            target.nd_image.splice(number-1,1,data.value)
            uploadImageFinished=ref(true)
        }
    }
    if(error.value){
        uploadImageFinished=ref(true)
        notification('uploadImage出錯','error');
    }
}
// 刪除指定圖片
function deleteImage(type,num,array){
    if(type === 'question'){
        array.qd_image.splice(num,1)
    } else if(type === 'notify'){
        array.nd_image.splice(num,1)
    }
}
//////////////////////// 修改區 ////////////////////////
///
// 修改問卷
async function modify(target){
    if(!uploadImageFinished.value){
        notification('圖片尚未上傳成功，請稍後再嘗試','warning');
        return
    }
    if(!owner.od_name){
        $('.owner_name').addClass('warning')
        notification('请输入站名','warning');
        return
    }else if(!owner.od_suffix){
        $('.owner_suffix').addClass('warning')
        notification('请输入后置码','warning');
        return
    }

    let q_boolean = false;
    let q_num = 0;
    for (let i = 0; i < questions.length; i++) {
        if(questions[i].qd_title == ""){
            q_boolean = true;
            q_num = i;
            $('.item-reply .item').eq(q_num).addClass('noTitle');
        }
        questions[i].qd_order = i+1;
    }
    if(q_boolean){
        notification('問題的標題尚未填寫，無法送出問卷','warning');
        return
    }

    let n_boolean = false;
    let n_num = 0;
    for (let i = 0; i < notifys.length; i++) {
        if(notifys[i].nd_title == ""){
            n_boolean = true;
            n_num = i;
            $('.item-noreply .item').eq(n_num).addClass('noTitle');
        }
        notifys[i].nd_order = i+1;
    }
    if(n_boolean){
        notification('通知的標題尚未填寫，無法送出問卷','warning');
        return
    }

    owner.last_update_user = user.ud_account;
    const dd = {
        'owner':owner,
        'question':questions,
        'notify':notifys
    }
    const {data,pending,error,refresh} = await useFetch(config.value+'owner-modify',{
            method:"POST",
            body:dd
        });
    if(data.value){
        if(target == 'index'){
            if(sessionStorage.getItem("localData") != null){
                var localData = JSON.parse(sessionStorage.getItem("localData"));
            }else{
                var localData = {};
            }
            localData.upload = '修改成功！';
            sessionStorage.setItem("localData",JSON.stringify(localData));
            return navigateTo('/')
        }else if(target == 'preview'){
            // 假設 previewUrl 包含了預覽頁面的 URL
            const previewUrl = '/preview/' + owner.od_id;
            // 打開新窗口
            window.open(previewUrl, '_blank');
        }
    }
    if(error.value){
        notification('modify出錯','error');
        return
    }
}
// 刪除問卷
async function deleteOwner(){
    owner.last_update_user = user.ud_account;
    const dd = {
        'od_id':owner.od_id,
    }
    const {data,pending,error,refresh} = await useFetch(config.value+'owner-delete',{
            method:"POST",
            body:dd
        });
    if(data.value){
        if(sessionStorage.getItem("localData") != null){
            var localData = JSON.parse(sessionStorage.getItem("localData"));
        }else{
            var localData = {};
        }
        localData.upload = '刪除成功！';
        sessionStorage.setItem("localData",JSON.stringify(localData));
        return navigateTo('/')
    }
    if(error.value){
        notification('delete出錯','error');
        return
    }
}
//////////////////////// 推播框設定 ////////////////////////
///
// 推撥提示框
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
//////////////////////// 監聽設定 ////////////////////////
watch(owner,(newValue, oldValue) => {
    if(owner.od_name){
        $('.owner_name').removeClass('warning');
    }
    if(owner.od_suffix){
        $('.owner_suffix').removeClass('warning');
    }
});
</script>

<template>
<div @click="closeAll()" class="container edit page create">
    <!-- header -->
    <header>
        <section class="header-content">
            <!-- top -->
            <div class="header-top clearfix">
                <NuxtLink to="/" title="返回列表" class="btn-link">
                    <FontAwesome iconName="angle-left"></FontAwesome>
                    <span>返回列表</span>
                </NuxtLink>
                <div class="header-menu">
                    <a @click="modify('index')" href="javascript:void(0)" class="btn btn-primary">
                        <FontAwesome iconName="floppy-disk"></FontAwesome>
                        <span>储存问卷</span>
                    </a>
                    <a @click="modify('preview')" href="javascript:void(0)" class="btn btn-primary">
                        <FontAwesome iconName="eye"></FontAwesome>
                        <span>预览问卷</span>
                    </a>
                    <a @click="deleteOwner_confirm()" href="javascript:void(0)" class="btn btn-delete js-btn">
                        <FontAwesome iconName="trash-can"></FontAwesome>
                        <span>删除问卷</span>
                    </a>
                </div>
            </div>
            <!-- bottom -->
            <div class="header-bottom">
                <div class="header-edit clearfix">
                    <input class="owner_name" type="text" placeholder="请输入站名" v-model="owner.od_name">
                    <div class="header-detail clearfix">
                        <div class="code clearfix">
                            <span>后置码</span><input class="owner_suffix" type="text" placeholder="请输入后置码" v-model="owner.od_suffix">
                        </div>
                        <div class="man">
                            <div><span>建立人</span>{{user.ud_name}}</div>
                            <!-- <div><span>最後修改人</span>{{user.ud_name}}</div> -->
                            <!-- <div><span>最後修改時間</span>{{nowDateTime}}</div> -->
                        </div>
                    </div>
                </div>
            </div>
            <a href="javascript:void(0)" class="side-nav" @click="setSideNav()">
                <FontAwesome iconName="bars"></FontAwesome>
            </a>
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
                    <!-- 1 選擇題 -->
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
                            <div v-for="(question,index) in questions" class="item js-item" @click.stop="modifyQuestion($event)" :id="'Q'+index" :key="question.qd_order">
                                <div class="moveIcon"></div>
                                <div class="num">{{ index+1 }}</div>
                                <div class="content-wrap">
                                    <div class="question-wrap">
                                        <div class="question clearfix">
                                            <textarea name="" id="" class="js-textarea" v-model="question.qd_title"></textarea>
                                            <div class="select-wrap js-select-wrap" @click.stop="typeToggle($event)">
                                                <div class="select-title js-select-title">
                                                    <span :class="{'choose':question.qd_type == 1,'response':question.qd_type == 2}">{{ question.qd_type == 1 ? '选择题':'简答题' }}</span>
                                                </div>
                                                <div class="select-content js-select-content">
                                                    <ul>
                                                        <li @click="changeType(1,question)" class="type-option">选择题</li>
                                                        <li @click="changeType(2,question)" class="type-short-response">简答题</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <a @click="selectImage($event)" href="javascript:void(0)" class="btn">
                                                <input type="file" :name="'imageInput'+index" accept="image/*" @change="uploadImage($event,'question',question)" style="display: none">
                                                <FontAwesome iconName="image"></FontAwesome>
                                            </a>
                                        </div>
                                    </div>
                                    <div class="content">
                                        <div v-if="question.qd_image.length > 0" id="previewDiv">
                                            <div v-for="(img,index) in question.qd_image">
                                                <img :src="img">
                                                <a @click="deleteImage('question',index,question)" href="javascript:void(0)" class="btn-delete">
                                                    <FontAwesome iconName="xmark"></FontAwesome>
                                                </a>
                                            </div>
                                        </div>
                                        <div v-if="question.qd_type == 1" class="editor edit-choose-wrap">
                                            <div class="edit-choose">
                                                <el-radio-group v-model="question.qd_answer" class="ml-4" disabled>
                                                    <el-radio v-for="(con,num) in question.qd_content" disabled>
                                                        <input :placeholder="con.type == 'other' ? '其他':'请填入文字'" type="text" v-model="con.text" :disabled="con.type == 'other' ? true:false">
                                                        <a @click="deleteOption(question.qd_content,num)" href="javascript:void(0)" class="btn-delete">
                                                            <FontAwesome iconName="xmark"></FontAwesome>
                                                        </a>
                                                    </el-radio >
                                                </el-radio-group>
                                                <div>
                                                    <!-- 新增選項 -->
                                                    <div class="choose-item choose-add clearfix">
                                                        <div class="border-wrap">
                                                            <i class="choose-icon"></i>
                                                            <input v-model="optionText" v-on:keyup.enter="addOption(question.qd_content,index)" type="text" class="js-choose-option" placeholder="新增選項">
                                                            <span class="choose_tip">Tips：請按 Enter 新增選項</span>
                                                        </div>
                                                    </div>
                                                    <div class="choose-item choose-add clearfix">
                                                        <div class="border-wrap">
                                                            <i class="choose-icon"></i>
                                                            <div class="js-add-else"><a @click="addOtherOption(question.qd_content,index)" href="javascript:void(0)">新增"其他"</a></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-else-if="question.qd_type == 2" class="editor">
                                            <div class="disable"></div>
                                        </div>
                                        <div class="editor-wrap">
                                            <a @click="copyQuestion(index)" href="javascript:void(0)" class="btn-link">
                                                <FontAwesome iconName="copy"></FontAwesome>
                                                <span>複制</span>
                                            </a>
                                            <a @click="deleteQuestion(index),closeAll()" href="javascript:void(0)" class="btn-link btn-link-delete js-btn">
                                                <FontAwesome iconName="trash-can"></FontAwesome>
                                                <span>刪除</span>
                                            </a>
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
                            <div v-for="(notify,index) in notifys" :key="notify.nd_order" class="item js-item" @click.stop="modifyNotify($event)" :id="'N'+index">
                                <div class="moveIcon"></div>
                                <div class="num">{{ index+1 }}</div>
                                <div class="content-wrap">
                                    <div class="question-wrap">
                                        <div class="question clearfix">
                                            <textarea name="" id="" class="js-textarea" v-model="notify.nd_title"></textarea>
                                            <a @click="selectImage($event)" href="javascript:void(0)" class="btn">
                                                <input type="file" :name="'imageInput'+index" accept="image/*" @change="uploadImage($event,'notify',notify)" style="display: none">
                                                <FontAwesome iconName="image"></FontAwesome>
                                            </a>
                                        </div>
                                    </div>
                                    <div class="content">
                                        <div v-if="notify.nd_image.length > 0" id="previewDiv">
                                            <div v-for="(img,index) in notify.nd_image">
                                                <img :src="img">
                                                <a @click="deleteImage('notify',index,notify)" href="javascript:void(0)" class="btn-delete">
                                                    <FontAwesome iconName="xmark"></FontAwesome>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="editor-wrap">
                                            <a @click="copyNotify(index)" href="javascript:void(0)" class="btn-link">
                                                <FontAwesome iconName="copy"></FontAwesome>
                                                <span>複制</span>
                                            </a>
                                            <a @click="deleteNotify(index),closeAll()" href="javascript:void(0)" class="btn-link btn-link-delete js-btn">
                                                <FontAwesome iconName="trash-can"></FontAwesome>
                                                <span>刪除</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 右側邊功能列 -->
                <div class="page-add-wrap">
                    <div class="page-add">
                        <a @click="addQuestion()" href="javascript:void(0)" class="btn btn-primary">
                            <FontAwesome iconName="plus"></FontAwesome>
                            <p class="description"><span>新增问题</span></p>
                        </a>
                        <a @click="addNotify()" href="javascript:void(0)" class="btn">
                            <FontAwesome iconName="message"></FontAwesome>
                            <p class="description"><span>新增通知</span></p>
                        </a>
                        <a @click="goToTop($event)" href="javascript:void(0)" class="btn js-gototop">
                            <FontAwesome iconName="angle-up"></FontAwesome>
                        </a>
                    </div>
                </div>
            </div>
            <div @click="setSideNav()" class="overlay"></div>
            <!-- 刪除問卷 -->
            <div class="popup-wrap js-popup-paper">
                <div class="popup-title error">
                    删除问卷
                </div>
                <div class="popup-content">
                    您是否要删除此问卷？
                </div>
                <div class="popup-btn-wrap clearfix">
                    <a href="javascript:void(0)" class="btn">取消</a>
                    <a href="javascript:void(0)" class="btn btn-primary">刪除</a>
                </div>
            </div>
            <!-- 刪除問題 -->
            <div class="popup-wrap js-popup-item">
                <div class="popup-title error">
                    删除问题
                </div>
                <div class="popup-content">
                    您是否要删除此问题？
                </div>
                <div class="popup-btn-wrap clearfix">
                    <a href="javascript:void(0)" class="btn">取消</a>
                    <a href="javascript:void(0)" class="btn btn-primary">刪除</a>
                </div>
            </div>
        </article>
    </main>
</div>
</template>
<style scoped>
</style>
