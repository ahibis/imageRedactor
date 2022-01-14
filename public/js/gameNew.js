let socket= io.connect();
let token=$.cookie('sessionToken');
let canComplete=1;
let Log=console.log;
function stream(type,data) {
    data.typeOfEvent=type;
    data.roomId=roomId;
    socket.emit("stream",data);
}
class Game{
    constructor() {
        this.voice=[]
        this.reader=undefined;
        this.stageStep=50;
        this.stageTime=3000;
        this.cardStep=50;
        this.cardTime=1000;
        this.nCard=0;
        //this.recorderInit();
        socket.emit('connection',{token});
        setTimeout(()=>{
            console.log('пытаемся подключиться')
            socket.emit('room connect',{roomId,token});

        },100)
    }
    sendMessage(){
        let message=$("#messInput").text();
        $("#messInput").html("");
        socket.emit('send massage',{roomId,token,message})
    }
    async addMessage(data){
        let user=await User.load(data.ownerId);
        $("#messages").append(`<div class="message">🙍${user.firstName} ${user.lastName}> ${data.message}</div>`)
    }
    imOwner(){
        console.log("i'm owner");
        vm.owner=1;
    }

    startAnimationStage(stage){
        if(!stage) return 0;
        let i=0
        let id=setInterval(function () {
            i+=1;
            vm.stage=vm.stages[i%(vm.stages.length)];
            if((i>=~~(game.stageTime/game.stageStep))&&(vm.stage==stage)) clearInterval(id);
        },this.stageStep);
    }
    clearCard(){
        vm.chooseCard={}
        vm.chooseSpecialCard={}
        for(let card of vm.currentCards){
            if(card.sort=="base"){
                vm.chooseCard[card.type]=1;
            }else{
                vm.chooseSpecialCard[card.type]=1;
            }
        }
    }
    startAnimationCard(BadgeId,move){

        vm.blinkCard=-1;
        vm.blinkSpecialCard=-1;
        let i=0

        let maxCards=move ? vm.specialCards.length : vm.cards.length;
        let times=4*maxCards+BadgeId;
        let id=setInterval(function () {
            if(!move){
                vm.blinkCard=i % maxCards;
            }else{
                vm.blinkSpecialCard=i % maxCards;
            }
            if(i==times) {
                clearInterval(id);
                if(!move){
                    vm.chooseCard[BadgeId]=1;
                }else{
                    vm.chooseSpecialCard[BadgeId]=1;
                }
                vm.blinkCard=-1;
                vm.blinkSpecialCard=-1;
            }
            i+=1;
        },50);
    }
    loadImg(src){
        return new Promise((resolve,reject)=>{
            let img=new Image();
            img.src=src;
            img.onload=data=>resolve(img)
        })
    }
    canvasToImg(ctx){
        let src=ctx.toDataURL();
        let img=new Image();
        img.src=src;
        return img
    }
    saveImage(image) {
        let link = document.createElement("a");
        link.setAttribute("href", image.src);
        link.setAttribute("download", "certificate");
        link.click();
    }
    async drawCertificate() {
        let el=document.getElementById('certificate')
        el.width=2539;
        el.height=1768;
        let ctx = el.getContext("2d")
        log(ctx)
        let back=await this.loadImg('/public/img/сертефикат.png')
        console.dir(back,el)
        ctx.drawImage(back,0,0)

        ctx.fillStyle="#263871";
        ctx.textBaseline = "top";
        ctx.font = '50px AvantGardeCTT';
        ctx.fillText('GRATOR',1732,560);
        ctx.font = '58.33px AvantGardeCTT';
        ctx.textAlign = "center"
        ctx.fillText('Данный сертификат подтверждает, что',1340,700);
        ctx.font = '75px AvantGardeCTT';
        ctx.fillText(`${user.firstName} ${user.lastName}`,1340,780);
        ctx.font = '58.33px AvantGardeCTT';
        ctx.fillText2=function (text,x,y,offset=10){
            let texts=text.split("\n");
            let height=(/([\d.]*)/.exec(this.font))[0]*1;
            for(let i=0;i<texts.length;i++){
                this.fillText(texts[i],x,y+i*(height+offset))
            }
        }
        ctx.fillText2("успешно прошёл он-лайн игровой тренинг\nпо развитию коммуникативных навыков,\nречи, презентации, самопрезентации,\nс применением платформы\nGRATOR",
            1340,870);
        ctx.font = '41.67px AvantGardeCTT';
        ctx.textAlign='left'
        let owner=await User.get(vm.roomData.ownerId);
        ctx.fillText(`Организатор: ${owner.firstName} ${owner.lastName}`,255,1335);
        let date=new Date().toJSON().split('T')[0]
        ctx.fillText(`дата: ${date}`,2061,1335)
        ctx.font = '50.85px AvantGardeCTT';
        ctx.fillStyle="#FFF";
        ctx.fillText2("Автор игровой платформы\nИрина Пенина",500,1410,20)
        ctx.textAlign='center';
        ctx.fillStyle="#263871";
        ctx.font = '33.33px AvantGardeCTT';
        ctx.fillText("г. Москва",1270,1690)
        let img=this.canvasToImg(el)
        this.certificate=img;
        return img;
    }
}
Vue.component('user', {
    data: function () {
        return {
            count: 0,
            isUserSettings:0
        }
    },
    props:['user','lol','dions','i',"currentid","assistants"],
    computed:{
        Class:(e)=>{
            if(!e.user) return '';
            return e.user.id==vm.currentUser.id ? "currentUser":"";
        },
        muted:(e)=>{
            return vm.userAudio[e.user.id];
        },
        status() {
            if(this.assistants[this.user.id]) return "(ассистент)";
            if(this.user.id==vm.adminData.id) return "(мастер)";
            return "";
        },
        textAssistantButton(){
            if(this.assistants[this.user.id]) return "разжаловать ассистента";
            return 'сделать ассистентом'
        },
        isOwner(){
            return this.user.id==vm.adminData.id;
        },
        IIsOwner(){
            return vm.owner;
        }
    },
    methods:{
        mut(e){
            let el=$(e.toElement);
            socket.emit('mut',{roomId,userId:el.attr('uid')});
        },
        assyst(e){
            if(this.assistants[this.user.id]){
                delete this.assistants[this.user.id]
                stream('setAssistants',{assistants: this.assistants});
                return;
            }
            this.assistants[this.user.id]=1;
            stream('setAssistants',{assistants: this.assistants});
        },
        nextMove(e){
            stream("nextMove",{id:this.user.id})
        }

    },
    template:
        `<div @mouseover="isUserSettings=1" :class="{'green':user.id==currentid}"  @mouseleave="isUserSettings=0">
        🙍  {{user.firstName}} {{user.lastName}}{{status}} {{dions}} 
        <span @click="assyst" :class="{userStat:1,hide:!isUserSettings||isOwner||!IIsOwner}" >{{textAssistantButton}}</span>
        <span @click="nextMove" :class="{userStat:1,hide:!isUserSettings||!IIsOwner}" >Сделать следующим</span>
    </div>`
})