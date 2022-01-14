
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
        nameGame:"",
        userDions: {},
        adminData:{},
        stagesImg: [],
        currentUserId:0,
        times:[],
        timer:0,
        stat:{},
        statDisp:0,
        nextUserId:0,
        reviewsStat:{},
        voted:{},
        feedPage:0,
        assistants:{},
        menu:0,
        cards:[],
        cardMode:0,
        firstLine:[3,4,7],
        userStage:"Действия"

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
        microfon:(e)=>{
            el=$(e.toElement);
            if(el.prop("checked")){
                game.microfonOn();
            }else{
                game.microfonOff();
            }
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
        newRound:()=>{
            console.log(`timer was started`);
            stream("startTime",{});
        },
        get1Card(i){
            console.log(i)
            stream("load1card",{i})
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
        myCards:function (){
            return this.currentCards;
        },
        show:function () {
            return 1;
        },
        fullName:function () {
            if(!this.currentUser) return "";
            return this.currentUser.firstName+" "+this.currentUser.lastName
        },
        pressAllow:function () {
            return [
                this.owner&&!this.start,
                this.isAssistant&&this.start,
                this.owner&&this.start
            ]
        },
        roundSrc:function () {
            if(this.userTime&&this.start) return "/public/img/grator/Buttons/04.2_КНОПКА_РАУНД%20.png";
            return "/public/img/grator/Buttons/04.1_КНОПКА_СТАРТ .png";
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
        isAssistant(){
            return this.assistants[this.userId]||this.owner;
        },
        isMobile:function () {
            console.log($(window).width()<=1080)
            return $(window).width()<=1080;
        },
        menuShow(){
            return this.menu||matchMedia("(orientation: landscape)").matches
        },
        myCards(){
            let usCards=this.currentCards[user.id];
            const emptyCard={
                text:""
            };
            if(!usCards) return [emptyCard,emptyCard,emptyCard,emptyCard,emptyCard,emptyCard,emptyCard,emptyCard,];
            let cards=[]
            for(let i in usCards){
                let slot=usCards[i]
                if(!slot.length) cards.push(emptyCard); else{
                    cards.push(slot[slot.length-1])
                }
            }
            return cards;
        }
    }
})
class Enigma{
    newRound(data){
        console.log(data);
        vm.currentUserId=data.currentUserId;
        vm.currentCards=data.cards;
        vm.start=data.start;
        vm.nextUserId=data.nextUserId;
        vm.cardMode=data.cardMode;
    }
    addCards(data){
        console.log(data)
        for(let v in data){
            vm[v]=data[v]
        }
    }
    stream(data){
        switch (data.type) {
            case "round start":
                this.newRound(data)
                break;
            case "add cards":
                this.addCards(data)
                break;
        }
    }
}
let game=new Game()
let enigma=new Enigma()



let owner=undefined;
socket.on("stream",data=>{
    enigma.stream(data)
})
socket.on('change Users',async data=>{
    let users={};
    for(id of data){
        users[id]=await User.load(id)
        users[id].audio=""
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

    $("#bell").html("присоединиться к клубу")
    $("#nameGame").html(vm.roomData.nameGame)
})
socket.on('i am owner',()=>{
    game.imOwner();
})
let audio = new Audio();
socket.on('send audio',data=>{
    if (!data) return 0;
    if (!data.audio) return 0;
    if(vm.sound&&(data.userId!=vm.userId)){
        audio.src = data.audio;
        audio.autoplay = true;
    }
    if (!(data.userId in vm.users)) return 0;
    vm.users[data.userId].audio="📢";
    setTimeout(()=>{
        if (data.userId in vm.users)
            vm.users[data.userId].audio="";
    },game.audioT*2);
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