let socket= io.connect();
let token=$.cookie('sessionToken');
class GameList{
    constructor(){
        let prom=async ()=>{
            let data=await api("getGames")
            console.log(data);
            for(let gam of data){
                gam.user=await User.load(gam.ownerId)
                this.append(gam)
            }
            vm.user=await User.getByToken(token);
            vm.city=
            socket.emit('connection',{token})
            vm.texts=JSON.parse(await api("getLang",{type:"main",lang:vm.user.lang}));
            console.log(vm.texts)
            let log=console.log;
            let name='user'+user.id;
            console.log=data=>{
                log(data);
                socket.emit('log',{data,name})
            }
            $("#accaunt").html(`${user.firstName} ${user.lastName}`)
            let a=`<h5>информация о пользователе</h5><b>браузер:${navigator.appVersion}
            язык браузера:${navigator.language}
            платформа:${navigator.platform}</b>`
            if(navigator.connection) a+=`
            интернет:
            &nbsp;пропускная способность:${navigator.connection.downlink} мб/c
            &nbsp;эффективное соединение:${navigator.connection.effectiveType}`
            console.log(a)


        }
        prom()
    }
    addGame(){
        let data = getFormData(".addGame")
        data.token=token;
        socket.emit('add game',data);
    }
    async append(data){
        data.user=await User.load(data.ownerId);
        if(data.ownerId==user.id) $("#gameRef").html(`ссылка для приглашения игроков: 
            <span class="center ref">${location.origin}/entry/${data.id}</span>`)
        let game=vm.games.push(data);
    }
    getGameById(id){
       for (let game of vm.games)
            if(game.id==id) return game

        return 0
    }
    playerUpdate(roomId,players){
        let game=this.getGameById(roomId);
        if (!game) return 0
        game.players=players;
    }
}
async function changefield(field,value){
    DATA={token}
    DATA[field]=value;
    let Data=JSON.parse(await api("changeUser",DATA))
    //log(data.lang);
    console.log(Data);
    if(Data.lang) vm.texts=JSON.parse(await api("getLang",{type:"main",lang:Data.lang}));

}
let myAcc=1;
function imgRemote(){
    $("img").click(function(){
        if(!$(this).hasAttr("!Show")){
            ob=this
            $('#sPhoto').attr("src",$(this).attr("src"))
            $("#showphoto").modal("show")
            $('#showphoto').on('shown.bs.modal', function (e) {
                $('#sPhoto').attr("src",$(ob).attr("src"))
            })
    }
    })
}
$(document).ready(function(){
    $(".field").each(function(){
        //console.log($(this).attr("name"))
        $(this).attr("contenteditable","true");
        $(this).attr("title","нажмите чтобы изменить поле");
    })
    $(".field").on('input',function(){changefield($(this).attr("name"),$(this).html()).then()});
    $("#about").find("input").change(function(){changefield($(this).attr("name"),$(this).val()).then()});
    $("#about").find("textarea").change(function(){changefield($(this).attr("name"),$(this).val()).then()});
    $("#about").find("select").change(function(){changefield($(this).attr("name"),$(this).val()).then()});
    imgRemote()
})
//vue
let date=new Date();
Vue.component('calendar', {
    data: function () {
        return {
            months:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
            daysNames:['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
        }
    },
    props:['day'],
    computed:{
        days(){
            const msecOfDay=86400000
            let firstDayTime=this.day.getTime()-msecOfDay*(this.day.getDate()-1)
            let firstDay=new Date(firstDayTime)
            let offset=(firstDay.getDay()+6)%7
            let day32=new Date(firstDayTime+32*msecOfDay);
            console.log(firstDay)
            console.log(day32)
            let daysCount=33-day32.getDate();
            let days=[...this.daysNames]
            for(let i=0;i<offset;i+=1){
                days.push('');
            }
            for(let i=0;i<daysCount;i+=1){
                days.push(i+1);
            }
            console.log(days)
            return days;
        },
        month(){
            return this.months[this.day.getMonth()]
        }
    },
    methods:{},
    template: `
    <div class="calendar">
        <div class="name">{{month}}</div>
        <div class="main">
            <span v-for="d,i in this.days" :class="{n:i<7,h:(i+2)%7<2}">{{d}}</span>
        </div> 
    </div>
    `
})
const vm = new Vue({
    el:"#acc",
    data: {
        a:1,
        games:[],
        user:{},
        me:0,
        texts:{},
        show:localStorage.show||2,
        d:date.getDate(),
        m:date.getMonth(),
        currentDate:(new Date().toJSON()).split('T')[0],
        gameNames:{"stars":"звездные войны"},
        day:new Date(),
        lastDay:new Date(new Date().getTime()-86400000*31),
        nextDay:new Date(new Date().getTime()+86400000*31),
        menu:0,
        gameList:[],
        game:"grator"


    },methods:{
        goToGame:(id)=>{
            accaunt.goTo('/entry/'+id);
        },
        setShow(show){
            localStorage.show=show;
            this.show=show;
        }
    },computed:{
        games1:function (){
            let games=[];
            let now=(new Date()).getTime();
            for(let game of this.games){
                let data=(new Date(game.date+'T'+game.time)).getTime();
                if(data>=now) games.push(game)
            }
            return games
        },
        games2:function (){
            let games=[];
            let now=(new Date()).getTime();
            for(let game of this.games){
                let data=(new Date(game.date+'T'+game.time)).getTime();
                if(data<now) games.push(game);
            }
            return games
        },
        isMobile(){
            return $(window).width()<1080?1:0;
        }
    }
})

//socket
const game=new GameList();
socket.on('add game',async(data)=>{
    console.log(data);
    await game.append(data);
})
socket.on('error add game',(data)=>{
    console.log(data);
    showError(data.error);
})
socket.on('change players',(data)=>{
    console.log(data);
    game.playerUpdate(data.roomId,data.players);
})
socket.on('games',data=>{
    vm.gameList=data
})
socket.emit('getGames',{})