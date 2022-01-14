//vue
const vm = new Vue({
    el:"#game",
    data: {
        users:[],
        owner:0,
        start:0,
        roomId:0,
        roomData:{},
        currentCards:{},
        sound:1,
        userAudio: {},
        startTime:0,
        time:'',
        userTime:0,
        usTime:'',
        userId:0,
        dions:0,
        stages:0,
        stage:"Этапы Игры",
        cards:[],
        specialCards:[],
        nameGame:"",
        chooseCard:{},
        chooseSpecialCard:{},
        blinkCard:-1,
        blinkSpecialCard:-1,
        userDions: {},
        adminData:{},
        stagesImg: [],
        currentUserId:0,
        decCards:["01_ЭМОЦИИ.png","02_ЦЕННОСТИ.png","03_МЕТАФОРЫ .png","04_ОБОРОТЫ РЕЧИ.png",
        "05_УВЛЕЧЕНИЯ.png","06_УБЕЖДЕНИЯ.png","07_ЦЕЛЬ .png","08_ПРОФЕССИИ.png"],
        cardMode:0,
        auto:0,
        times:[],
        timer:0,
        questions:0,
        objections:0,
        allowGet:0,
        groupQuest:0,
        feedback:0,
        reviews:0,
        feedbackData:{},
        digits:[1,2,3,4,5,6,7,8,9,10],
        reviewsData:{},
        stat:{},
        statDisp:0,
        nextUserId:0,
        reviewsStat:{},
        voted:{},
        feedPage:0,
        assistants:{},
        menu:0

    },
    methods: {
        roomStart:()=>{
            log("room start pressed");
            socket.emit('room start',{roomId})
        },
        cardComplete:function (id){
            console.log(`card complete ${id}`);
            if(!canComplete) return 0;
            socket.emit('card complete',{roomId,card:id,pos:!(vm.currentCards[id]).checked});
        },
        startBattle:()=>{
            console.log('start battle has been pressed');
            text=vm.start==1?"вы уверены что хотите начать баттл?":"вы уверены что хотите завершить баттл?";
            if(!confirm(text)) return 0;
            socket.emit('startBattle',{roomId});
        },
        endRoom:()=>{
            console.log('end room has been pressed');
            if(!confirm("вы уверены что хотите завершить игру?")) return 0;
            socket.emit('endRoom',{roomId});
        },
        userSkip:function(){
            console.log('user scip has been pressed');
            if(!vm.isAssistant) return 0;
            if(!confirm("вы уверены что пропустить игрока?")) return 0;
            socket.emit('userScip',{roomId});
        },
        chooseDeck:i=>{
            console.log(`choose deck ${i} has been pressed`);
            socket.emit('chooseDeck',{roomId,deck:i});
        },
        nextBattleCard:()=>{
            console.log(`next battle card has been pressed`);
            socket.emit('nextBattleCard',{roomId});
        },
        changeStage:()=>{
            console.log(`change stage has been pressed`);
            socket.emit('changeStage',{roomId});
        },
        move1:()=>{
            console.log(`load 1 line card has been pressed`);
            stream("load 1 card",{});
        },
        move2:()=>{
            console.log(`load 2 line card has been pressed`);
            stream("load 2 card",{});
        },
        newRound:()=>{
            console.log(`timer was started`);
            stream("startTime",{});
        },
        throwCard:i=>{
            console.log(`get card ${i}`);
            stream("choose card",{i});
        },
        autoMode:i=>{
            console.log(`auto mode= ${!vm.auto}`);
            stream("auto mode",{auto:!vm.auto});
        },
        changeTime:function (e) {
            console.log(`change timer`);
            stream("change timer",{timer:$(e.srcElement).val()});
        },
        throwSpecCard:i=>{
            console.log(`throw special ${i} card`);
            if(i>3) {
                if(!vm.allowGet) return;
                vm.allowGet=1;
            }
            stream("choose spec card",{i});
        },
        questionsOn:()=>{
            stream("questions on",{});
        },
        objectionsOn:()=>{
            stream("objections on",{});
        },
        stageChoose:i=>{
            stream("stage choose",{i});
        },
        bgroupQuest:()=>{
            stream("groupQuest",{});
        },
        bfeedback:()=>{
            stream("feedback",{});
        },
        breviews:()=>{
            stream("reviews",{});
        },
        sendStat:()=>{
            console.log(`send stat has been started`);
            if(Object.keys(vm.feedbackData).length<7){
                alert("вы не выбрали каждый пункт");
                return 0;
            }
            stream("sendStat",{stat:vm.feedbackData});
        },
        sendReview:()=>{
            console.log(`send review`);
            stream("sendReview",{stat:vm.reviewsData});
        },
        nextIssue:function () {
            if(this.feedbackData[this.feedPage]) this.feedPage+=1;
        }
    },
    computed:{
        currentUser:function () {
            if(!this.currentUserId) return {};
            return this.users[this.currentUserId]
        },
        isMyTurn:function () {
            if(!this.currentUser) return 0;
            return this.currentUser.id==this.userId;
        },
        blinkRound:function(){
            return !this.userTime&&this.start&&(this.isAssistant||this.isMyTurn);
        },
        blinkMove1:function () {
            return this.isMyTurn&&(this.cardMode==1)
        },
        blinkMove2:function () {
            return this.isMyTurn&&(this.cardMode==2)
        },
        blinkDecCard:function () {
            return (this.isMyTurn&&(this.cardMode==3||this.auto))||(!this.isMyTurn)&&(this.cardMode==4)
        },
        blinkSpecCards:function () {
            return (this.isMyTurn&&(this.cardMode==5||this.auto))
        },
        myCards:function (){
            if(this.owner) return this.currentCards;
            if(this.start==2) return this.currentCards;
            if(this.groupQuest) return this.currentCards;
            if(!this.currentCards) return 0;
            let cards=[];
            if(!this.currentCards) return {}
            for(let card of Object.values(this.currentCards)){
                if(card.userId==this.userId) cards.push(card)
            }
            return cards;
        },
        show:function () {
            if(this.statDisp) return 4;
            let isReviews=this.reviewsStat[this.userId]?!!Object.keys(this.reviewsStat[this.userId]).length:0;
            if(this.reviews&&!isReviews) return 3;
            let isFeed=this.voted[this.userId];
            if(this.feedback&&!isFeed) return 2;
            if(!this.myCards) return 0;
            if(this.myCards.length&&this.start) return 1;
            return 0;
        },
        fullName:function () {
            if(!this.currentUser) return "";
            return this.currentUser.firstName+" "+this.currentUser.lastName
        },
        pressAllow:function () {
            return [
                this.owner&&!this.start,
                this.owner&&this.start,
                this.isAssistant&&this.start,
                this.owner&&this.start==1&&(roomId!==0),
                this.owner&&this.start==1&&(roomId!==0),
                this.owner&&this.start,
                this.isAssistant&&this.start,
                this.owner,
                this.isAssistant&&this.start&&(roomId!==0),
                this.owner,
                this.start,
                this.owner&&this.start,
                this.owner&&(roomId!==0),
            ]
        },
        roundSrc:function () {
            if(this.userTime&&this.start) return "/public/img/grator/Buttons/04.2_КНОПКА_РАУНД%20.png";
            return "/public/img/grator/Buttons/04.1_КНОПКА_СТАРТ .png";

        },
        myStat:function () {
            if(this.owner){
                let stat={};
                for(let id in this.stat){
                    let myStat=this.stat[id];
                    let growSum=0
                    for (let i=0;i<7;i++){
                        let grow=Math.round(((myStat.stat[i]||0)+(myStat.grow[i]||0))/(myStat.round));
                        growSum+=grow*1;
                        stat[i]=stat[i]||[];
                        stat[i].push(grow);
                    }
                    stat[7]=stat[7]||[]
                    stat[8]=stat[8]||[]
                    stat[7].push(Math.round(growSum/7))
                    stat[8].push(this.userDions[id]||0);
                }
                return stat;
            }
            let myStat=this.stat[this.userId];
            if(!myStat) return 0;
            let stat={};
            for(let i=0;i<7;i++){
                let grow=Math.round(((myStat.stat[i]||0)+(myStat.grow[i]||0))/(myStat.round));
                stat[i]=[myStat.myStat[i]||0,myStat.stat[i]||0,grow];
            }
            return stat;
        },
        statColumn:function(){
            if(this.owner){
                let stat=[];
                for(let id in this.stat) {
                    let user=this.users[id]
                    stat.push(user.firstName+" "+user.lastName)
                }
                return stat;
            }
            return ["Моя оценка","Оценка группы","Зона развития"]
        },
        nextUser:function () {
            if(!this.nextUserId) return {firstName:""};
            return this.users[this.nextUserId]
        },
        sortUsers:function () {
            if(!this.currentUserId) return this.users;
            let first=[]
            let second=[]
            let sec=0;
            for(let user of Object.values(this.users)){
                if(user.id==this.currentUserId) sec=1;
                if(sec) first.push(user); else second.push(user);
            }
            return [...first,...second];
        },
        oc:function () {
            if(!this.stat[this.userId]) return 0;
            let stat=0;
            let myStat=this.stat[this.userId];
            for(let i=0;i<7;i++){
                let grow=Math.round(((myStat.stat[i]||0)+(myStat.grow[i]||0))/(myStat.round));
                stat+=grow;
            }
            return Math.round(stat);
        },
        isAssistant(){
            return this.assistants[this.userId]||this.owner;
        },
        isMobile:function () {
            console.log($(window).width()<=1080)
            return $(window).width()<=1080;
        },
        menuShow(){
            return this.menu||matchMedia("(orientation: landscape)").matches
        }
    }
})
setInterval(()=>{
    let cTime=(new Date).getTime()
    time=~~((cTime-vm.startTime)/1000);
    hours=~~(time/3600);
    minutes=~~(time/60)-hours*60;
    seconds=time-minutes*60-hours*3600;
    sec0=seconds<10?"0":"";
    hours=hours>0?`${hours} часов `:"";
    vm.time=`${hours}${minutes}:${sec0}${seconds}`;
    time=~~((cTime-vm.userTime)/1000);
    hours=~~(time/3600);
    minutes=~~(time/60)-hours*60;
    seconds=time-minutes*60-hours*3600;
    sec0=seconds<10?"0":"";
    vm.usTime=`${minutes}:${sec0}${seconds}`;
},1000)
setInterval(()=>{
    let cTime=(new Date).getTime()
    let time=~~((cTime-vm.userTime));
    if (!vm.userTime) time=0;
    let times=[]
    canComplete=1;
    if(!vm.userTime) canComplete=0;
    for(let i=1;i<5;i++){
        let time1=i*30000-time;
        if(time1<0) {
            time1=0;
            if(vm.start==2) if(vm.timer==i-1) canComplete=0;
        }
        //if((vm.timer==i-1)&&vm.owner&&vm.currentCards.length&&!time1){socket.emit('userScip',{roomId});}
        let sec=~~(time1/1000);
        let min=~~(sec/60);
        time1-=sec*1000;
        sec-=min*60;
        if(sec<10) sec='0'+sec;
        if(time1<10) time1='0'+time1;
        if(time1<100) time1='0'+time1;
        times.push(`${min}:${sec}:${time1}`)

    }
    times.push("free time");
    vm.times=times
},1)

class Grator{
    constructor() {
        this.usersMedia={};
        this.videosEl=document.getElementById("videos");
        //this.recorderInit()
    }
    recorderInit(){
        this.recorder=new MediaGet();
        this.recorder.setCatchBase64(data=>{
            data.id=vm.userId;
            stream("record",data);
        })
    }
    videoHandler(data){
        //console.log(data)
        if(!data.id) return 0;
        if(!this.usersMedia[data.id]){
            let text=document.createElement("span");
            let user=vm.users[data.id];
            text.style=`
            position: absolute; 
            color:black;
            font-size:1.5vw;
            margin-top:120px;`;
            if(user){
                text.innerHTML=`${user.firstName} ${user.lastName}`
            }
            let video=document.createElement("video");
            video.id="videoUser"+data.id;
            video.height=150;
            this.videosEl.append(text);
            this.videosEl.append(video);
            this.usersMedia[data.id]=new VideoPlayer(video);
        }
        //console.log(data.id);
        this.usersMedia[data.id].appendBase64(data.data,data.type,data.time,data.step);
    }
    stream(data){
        switch (data.type) {

        }
    }
}
const game=new Game();
const grator=new Grator();
socket.on("stream",data=>{
    grator.stream(data)
})
let owner=undefined;
socket.on('change Users',async data=>{
    let users={};
    for(id of data){
        users[id]=await User.load(id)
    }
    vm.users=users;
    console.log(data);
    if (vm.userId) if (!(vm.userId in vm.users)){socket.emit('room connect',{roomId,token});}
})
socket.on('send message',data=>{
    console.log(data)
    game.addMessage(data);
})
socket.on('load data',async data=>{
    Log('успешное соединение с сервером')
    Log(data);
    for(msg of data.messages){
        game.addMessage(msg);
    }
    delete data.messages;
    roomId=data.roomId;


    let name='user'+user.id;
    console.log=data=>{
        Log(data);
        socket.emit('log',{data,name})
    }
    let a=`<h5>информация о пользователе</h5><b>браузер:${navigator.appVersion}
            язык браузера:${navigator.language}
            платформа:${navigator.platform}</b>`
    if(navigator.connection) a+=`
            интернет:
            &nbsp;пропускная способность:${navigator.connection.downlink} мб/c
            &nbsp;эффективное соединение:${navigator.connection.effectiveType}`
    console.log(a)
    data.adminData=await User.load(data.roomData.ownerId);
    Object.assign(vm,data);
    game.clearCard();
    $("#bell").html("присоединиться к клубу")
    $("#nameGame").html(vm.roomData.nameGame)
})
socket.on('i am owner',()=>{
    game.imOwner();
})
socket.on("changeGameStage",async data=>{
    console.log(data);
    vm.currentUserId=data.currentUserId;
    vm.start=data.start;
    vm.cardMode=0;
    vm.currentCards=data.cards;
    vm.userTime=0;
    game.clearCard();
    vm.startTime=data.startTime;
})
socket.on('round start',async data=>{
    console.log(data);
    vm.currentUserId=data.currentUserId;
    vm.currentCards=data.cards;
    vm.userTime=data.userTime;
    vm.nextUserId=data.nextUserId;
    vm.feedbackData={};
    vm.feedPage=0;
    vm.cardMode=data.cardMode;
    vm.allowGet=1;
})
socket.on('add cards',async data=>{
    console.log(`change cards:${data.cards.length} badgeId:${data.badgeId} cardMode:${data.cardMode}`)
    vm.currentCards=data.cards;
    vm.startTime=data.startTime;
    vm.cardMode=data.cardMode;
    if(vm.start==1) game.startAnimationCard(data.badgeId,data.move);
})
socket.on('card complete',data=>{
    console.log(data)
    vm.currentCards[data.card].checked=data.pos;
    vm.userDions=data.userDions;
})
let audio = new Audio();
socket.on('startBattle',async data=>{
    vm.start=data.start;
    vm.currentUser=await User.get(data.userId);
    vm.currentCards=[];
    console.log(data);
})
socket.on('sendBattleCard',data=>{
    vm.userTime=data.userTime
    vm.currentCards.push(data.card);
})
socket.on('changeStage',data=>{
    console.log(data);
    game.startAnimationStage(data.stage);
})
socket.on('auto change',data=>{
    console.log(data);
    vm.auto=data.auto;
})
socket.on('change timer',data=>{
    console.log(data);
    vm.timer=data.timer;
})
socket.on('questions switch',data=>{
    console.log(data);
    vm.questions=data.questions;
})
socket.on('objections switch',data=>{
    console.log(data);
    vm.objections=data.objections;
})
socket.on('video stream',data=>{
    grator.videoHandler(data);
})
socket.on('change',async data=>{
    console.log(data);
    if(data.getCertificate){
        await  game.drawCertificate()
        game.saveImage(game.certificate)
    }
    for(key in data) vm[key]=data[key];
})
$(document).ready(()=>{
    $(document).keyup(e=>{
        if(e.keyCode==13){game.sendMessage();}
    })
})