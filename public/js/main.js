
$.fn.hasAttr = function (name) {
    return this.attr(name) !== undefined;
};
String.prototype.toJSON=function () {
    return JSON.parse(this.valueOf());
}
function getName(el) {
    return el.constructor.name;
}

function post(Url, data = {}) {
    return new Promise((resolve, reject) => {
        $.post('/' + Url, data, (Data) => {
            resolve(Data);
        });
    })
}

function get(Url, data = {}) {
    return new Promise((resolve, reject) => {
        $.get('/' + Url, data, (Data) => {
            resolve(Data);
        });
    })
}

function api(method, data = {}) {
    return new Promise((resolve, reject) => {
        $.post('/api/' + method, data, (Data) => {
            resolve(Data);
        });
    })
}

function getImgUrl(url) {
    return '/public/img/' + url;
}

function getJsUrl(url) {
    return '/public/js/' + url;
}

function getCssUrl(url) {
    return '/public/Css/' + url;
}

function getUrl(url) {
    return '/public/' + url;
}

function getFormData(selector,highlight=1) {
    data = {}
    $(selector).find("input").each(function () {
        let id=$(this).attr("id");
        if(!id) return 0;
        if ($(this).val() == "") {
            if(highlight) $(this).css('border', ' 1px solid #dc3545');
        } else {
            data[id] = $(this).val();
            if(highlight) $(this).css('border', ' 1px solid #ced4da');
        }
    })
    $(selector).find("select").each(function () {
        let id=$(this).attr("id");
        if(!id) return 0;
        if ($(this).val() == 0) {
            if(highlight) $(this).css('border', ' 1px solid #dc3545');
        } else {
            data[id] = $(this).val();
            if(highlight) $(this).css('border', ' 1px solid #ced4da');
        }
    })
    $(selector).find("*[contenteditable=true]").each(function () {
        let id=$(this).attr("id");
        if(!id) return 0;
        if ($(this).text() == 0) {
            if(highlight) $(this).css('border', ' 1px solid #dc3545');
        } else {
            if(highlight) $(this).css('border', ' 1px solid #ced4da');
            data[id] = $(this).text();
        }
    })
    return data;
}

function sendFiles(element, Url, func) {
    files = element.files;
    var data = new FormData();
    $.each(files, function (key, value) {
        data.append(key, value);
    });
    data.append('my_file_upload', 1);
    $.ajax({
        url: Url,
        type: 'POST', // важно!
        data: data,
        cache: false,
        //dataType    : 'json',
        processData: false,
        contentType: false,
        success: function (answer, status, jqXHR) {// ОК - файлы загружены
            console.log(answer)
            func(JSON.parse(answer))
        },
        error: function (jqXHR, status, errorThrown) {// функция ошибки ответа сервера
            console.log('ОШИБКА AJAX запроса: ' + status, jqXHR);
        }
    });
}

function sendFilesPost(element, Url, DATA, func) {
    files = element.files;
    var data = new FormData();
    $.each(files, function (key, value) {
        data.append(key, value);
    });
    data.append('my_file_upload', 1);
    for (key in DATA) {
        data.append(key, DATA[key])
    }
    $.ajax({
        url: Url,
        type: 'POST', // важно!
        data: data,
        cache: false,
        //dataType    : 'json',
        processData: false,
        contentType: false,
        success: function (answer, status, jqXHR) {// ОК - файлы загружены
            console.log(answer)
            func(JSON.parse(answer))
        },
        error: function (jqXHR, status, errorThrown) {// функция ошибки ответа сервера
            console.log('ОШИБКА AJAX запроса: ' + status, jqXHR);
        }
    });
}

function showError(text) {
    $("#error").html(text)
}

function delError() {
    $("#error").html("")
}

class Accaunt {
    reload() {
        document.location.href = document.location.href;
    }

    async leave() {
        await api("leave")
        accaunt.reload()
    }

    goTo(where) {
        location.href = where;
    }

    async registration() {
        delError()
        let data = await api("registration", getFormData("#registration"));
        console.log(data);
        let json = JSON.parse(data)
        if (json.status == "success") {
            accaunt.goTo($.cookie("url") || "/")
        } else {
            showError(json.error)
        }
    }

    async login() {
        delError()
        let data = await api("login", getFormData("#login"))
        console.log(data);
        var json = JSON.parse(data)
        if (json.status == "success") {
            accaunt.goTo($.cookie("url") || "/")
        } else {
            showError(json.error)
        }
    }
}

if (location.pathname == $.cookie("url")) $.removeCookie("url")

const accaunt = new Accaunt()

class USER {
    constructor() {
        this.users = {}
        this.funcs = [];
        this.que = [];

    }
    async load(id) {
        if (id in this.users) return this.users[id]
        let user = JSON.parse(await api('getUser', {id}))
        this.users[id] = user;
        return user

    }

    async getByToken(token) {
        let user = JSON.parse(await api('getUser', {token}))
        this.users[user.id] = user;
        return user
    }

    get(user_id) {
        if (user_id in this.users) return this.users[user_id]
    }
}
const User = new USER();
class myDate{
    constructor(date) {
        this.date=date;
    }
}
class Camera{
    constructor(width=640,height=480,fps=30) {
        this.width = width;
        this.height = height;
        this.video = document.createElement('video');
        this.video.width = width;
        this.video.height = height;
        this.video.autoplay = true;
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d');
        this.fps = fps;
        this.isRecording=true;
        let me=this;
        this.media=navigator.mediaDevices.getUserMedia({video: true}).then(function (stream) {
            if(me.isRecording){
                me.video.srcObject = stream;
                me.video.play();
            }
            me.stream=stream;
        });
    }

    onWorking(func){
        setInterval(()=>{

            if(this.isRecording){
                this.context.drawImage(this.video, 0, 0, this.width, this.height);
                func(this.canvas.toDataURL());
            }
        },1000/this.fps)
    }
}
function openUrlAtNewTab(url) {
    a=document.createElement("a");
    a.target="_blank";
    a.href=url;
    a.click();
}
window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
window.URL = window.URL || window.webkitURL;
class VideoPlayer{
    _base64ToArrayBuffer(base64) {
        let binary_string = window.atob(base64);
        let len = binary_string.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
    constructor(element=undefined) {
        this.videoElement=element||document.createElement("video");
        this.videoElement.autoplay=true;
        this._type=null;
        this.ping=0;
        this.lastTime=0;
        this._video=0;
        this._audio=0;
        this.onStatusChange=null;
    }
    async setType(type){
        if(type==this._type) return new Promise(resolve => {resolve()});
        this._type=type;
        this.mediaSource = new MediaSource();
        this.url = URL.createObjectURL(this.mediaSource);
        this.videoElement.src=this.url;
        let me=this;
        return new Promise(resolve=> {
            this.mediaSource.addEventListener("sourceopen", function()
            {
                me.sourceBuffer = me.mediaSource.addSourceBuffer(type);
                resolve();
            });
        })
    }
    fresh(){
        this.mediaSource = new MediaSource();
        this.url = URL.createObjectURL(this.mediaSource);
        this.videoElement.src=this.url;
        let me=this;
        return new Promise(resolve=> {
            this.mediaSource.addEventListener("sourceopen", function()
            {
                me.sourceBuffer = me.mediaSource.addSourceBuffer(me._type);
                resolve();
            });
        })
    }
    get video(){
        return this._video;
    }
    get audio(){
        return this._video;
    }
    timeHandler(type,time=0,step=100){
        this.lastTime=time;
        this.ping=(new Date()).getTime()-time;
        let video=this._video;
        let audio=this._audio;
        this._video=/vp8/.test(type)
        this._audio=/opus/.test(type)
        if(this.onStatusChange)
            if((this._video!=video)||(this._audio!=audio)){
                this.onStatusChange({video:this._video,audio:this._audio})
            }

        let me=this;
        setTimeout(()=>{
            if(time!=this.lastTime) return;
            let video=this._video;
            let audio=this._audio;
            me._video=0;
            me._audio=0;
            if(me.onStatusChange)
                if((me.video!=video)||(me.audio!=audio))
                    me.onStatusChange({video:me.video,audio:me.audio})
        },step+300)
    }
    appendBlob(blob,time=0,step=100){
        let me=this;
        this.setType(blob.type).then(function () {
            blob.arrayBuffer().then(data=>{
                me.sourceBuffer.appendBuffer(data)
                me.timeHandler(blob.type,time,step);
            })
        })
    }
    appendBuffer(buffer,type,time=0,step=100){
        let me=this;
        this.setType(type).then(function () {
            me.sourceBuffer.appendBuffer(buffer)
            me.timeHandler(type,time,step);
        })
    }
    appendBase64(base64,type,time=0,step=100,count){
        let me=this;
        this.count=this.count||0
        if(count==0){
            me.fresh()
        }
        //this.count=count;

        this.setType(type).then(function () {
            //console.log()
            if (
                me.mediaSource.readyState === "open" &&
                me.sourceBuffer &&
                me.sourceBuffer.updating === false
            ){
                me.sourceBuffer.appendBuffer(me._base64ToArrayBuffer(base64))
            }else{
                console.log("error"+count);

                //me.fresh();
            }

        })
    }
}
class MediaGet{
    constructor(audioOn=1,videoOn=1) {
        this.step=100;
        this.maxStream=60;
        this._audio=false;
        this._video=false;
        this.audio=audioOn;
        this.video=videoOn;

    }
    _arrayBufferToBase64( buffer ) {
        let binary = '';
        let bytes = new Uint8Array( buffer );
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return window.btoa( binary );
    }
    get audio(){
        return this._audio;
    }
    get video(){
        return this._video;
    }
    set audio(audio){
        this._audio=audio;
        this.change().then();
    }
    set video(video){
        this._video=video;
        this.change().then();
    }
    async change(){
        if(!(this.audio||this.video)){
            this.mediaRecorder.stop();
            return 0;
        }
        this.stream=await navigator.mediaDevices.getUserMedia({ audio: this.audio, video:this.video})
        if(this.mediaRecorder) if(this.mediaRecorder.state=="recording") this.mediaRecorder.stop();
        this.mediaRecorder = new MediaRecorder(this.stream,{});
        let me=this;
        let count=0;
        this.mediaRecorder.ondataavailable = function(blob) {
            if(me.videoPlayer) me.videoPlayer.appendBlob(blob.data);
            if(me.catchBuffer) me.catchBuffer(blob.data,count);
            if(me.catchBase64) me.catchBase64(blob.data,count);
            count++;
            console.info(count)
            if(count>me.maxStream){
                count=0;
                me.refresh()
            }
        }
        this.mediaRecorder.start(this.step);
    }
    refresh(){
        this.mediaRecorder.stop();
        this.mediaRecorder.start(this.step);
    }
    testStart(queryElement){
        this.videoPlayer=new VideoPlayer(queryElement);
        return this.videoPlayer
    }
    setCatchBuffer(func){
        let me=this;
        this.catchBuffer=(blob,count)=>{
            let time=(new Date()).getTime()
            blob.arrayBuffer().then(data=>{
                func({data,type:blob.type,time:time,step:me.step,count});
            })
        }
    }
    setCatchBase64(func){
        let me=this;
        this.catchBase64=(blob,count)=>{
            let time=(new Date()).getTime()
            blob.arrayBuffer().then(data=>{
                data=me._arrayBufferToBase64(data);
                func({data,type:blob.type,time:time,step:me.step,count});
            })
        }
    }
}
class constObject{
    constructor(name) {
        this._name=name;
        this._classes={};
        if(localStorage[this._name]){
            let data=JSON.parse(localStorage[this._name])
            for(let i in data){
                this[i]=data[i]
            }
        }
    }
    addName(object){
        for(let i in object){
            let o=object[i]
            if(i[0]=='_') continue;
            if(o==null||o==undefined) continue;
            let name=o.constructor.name;
            if(name=="String") continue;
            this.addName(o);
            if(!this._classes[name]) continue;
            o.__objectName=o.constructor.name;
        }
    }
    save(){
        let data={}
        for(let i in this){
            if(i[0]=='_') continue;
            data[i]=this[i];
        }
        this.addName(data);
        localStorage[this._name]=JSON.stringify(data);
    }
    fixObject(object,Class,Default){
        for(let i in object){
            let o=object[i]
            if(i[0]=='_') continue;
            if(o==null||o==undefined) continue;
            let name=o.constructor.name;
            if(name=="String") continue;
            if(o.__objectName){
                if(o.__objectName==Class.name){
                    object[i]=Object.assign(new Class(...Default),o)
                }
            }
            this.fixObject(o,Class,Default)
        }
    }
    addCLASS(Class,Default=[]){
        this.fixObject(this,Class,Default);
        this._classes[Class.name]=1;
    }
}
