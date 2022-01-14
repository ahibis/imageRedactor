Vue.component('jsonedit', {
    data: () => {
        return {
            path:[],
            isEdit:false
        }
    },
    props:["json","description"],
    computed:{
        pathStr:e=>e.path.join(">"),
        current:e=>{
            let current=e.json;
            for(move of e.path){
                current=current[move];
            }
            return current;
        }
    },
    methods:{
        open:function (data){
            this.path.push(data);
            this.isEdit=(getName(this.current)=="Array")&&(!this.description.denyEdit[data])?1:0;
        },close:function () {
            this.path.pop();
            let lastPath=this.path.length?this.path[this.path.length-1]:'';
            this.isEdit=(getName(this.current)=="Array")&&(!this.description.denyEdit[lastPath])?1:0;
        },getName:function (el){
            return getName(el);
        },addElement:function (){
            if(getName(current)=="Array") this.current.push("");
            else if(getName(current)=="Object") this.current[0]="";
        },trans:function (text){
            if(this.description.rus[text]){
                return this.description.rus[text]
            }
            return text;
        },changeInput:function (e){
            this.current[$(e.target).attr("pid")]=$(e.target).val();
        },deleteInput:function (e) {
            this.current.splice($(e.target).attr("pid"));
        }
    },
    template: `
    <div class="wrap">
        <h4>путь {{pathStr}}</h4>
        <button class="btn btn-success" v-if="path.length>0" @click="close">вернуться к предыдущему</button>
        <div v-if="typeof(current)=='object'">
            <h4>нажми на элемент чтобы перейти</h4>
            <div v-for="e,i in current">
                <div @click="open(i)" v-if="typeof(e)=='object'">*<span v-if="getName(current)=='Array'">элемент </span>{{trans(i)}}</div>
                <div class="row" v-else-if="getName(e)=='String'">
                    <div class="col-sm-2">
                        <span v-if="getName(current)=='Array'">элемент </span> {{trans(i)}}
                    </div>
                    <div class="col-sm-9">
                        <input class="form-control" :placeholder="i" :value="e" maxlength="20" :pid="i" @change="changeInput">
                    </div>
                </div>
                <div class="row" v-else-if="getName(e)=='Number'">
                    <div class="col-sm-2">
                        <span v-if="getName(current)=='Array'">элемент </span> {{trans(i)}}
                    </div>
                    <div class="col-sm-9">
                        <input class="form-control" :placeholder="i" :value="e" maxlength="20" :pid="i" @change="changeInput">
                    </div>
                </div>
            </div>
            <button v-if="isEdit" class="btn btn-success" @click="addElement">добавить элемент</button>
            <slot></slot>
        </div>
        
    </div>
    `
})


const vm = new Vue({
    el:"#admin",
    data: {
        logs:[],
        choose:"server.log",
        games:{},
        gamesDescription:{
            rus:{
                stages:"стадии",
                baseCardByStep:"кол-во базовых\nкарт за ход",
                cards:"параметры базовых карт",
                baseCards:"текст базовых карт",
                specialCards:"параметры базовых карт",
                specialCardByStep:"кол-во базовых карт за ход",
                decks:"колоды"
            },
            denyEdit:{
                grator:1,
                decks:1,
                specialCards:1,
                party:1,
                famaly:1,
                personality:1,
                classic:1,
                "":1
            }
        }

    },methods:{
        saveGames() {
            api('saveGames',{games:JSON.stringify(vm.games)});
        },
        commandEval(e) {
            api("commandEval",{text:$(e.target).val()});
        }
    }
})
api('getGamesInfo',{}).then(data=>vm.games=data)
setInterval(async ()=>{
    vm.logs=JSON.parse(await api("getLogs"))
    $("#logs").html((await get("public/logs/"+vm.choose)).replace(/\n/g,"<br>"))
},1000)