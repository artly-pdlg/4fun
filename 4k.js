function load(){
    //new VConsole();
    createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);
    queue=new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    loadComplete=false;
    queue.on("complete",(e)=>{
     loadComplete=true;
    },this);
    queue.loadManifest([{id:"sound",src:"music.ogg"}]);
    queue.load();
}
function checkLongNote(i){
    n=map.note[i];
    b0=n.beat[0]+n.beat[1]/n.beat[2];
    b1=n.endbeat[0]+n.endbeat[1]/n.endbeat[2];
    dt0=b0*60000/bpm-T-offset;
    dt1=b1*60000/bpm-T-offset;
    if(dt0<-acc.good&&n.onHit=="none"){
        combo=0;
        eval="miss";  
        addEvalText();
        n.onHit="miss";
    }
    if(dt1<-acc.good){
        longNoteHiting[n.column]=null;
        noteContainer.removeChild(n.shape);
        delete map.note[i];
        if(i==noteBegin){
            while(map.note[noteBegin]==null&&noteBegin<noteEnd)
                noteBegin++;
        }
        return true;
    }
    return false;
}
function checkNote(i){
    n=map.note[i];
    dt=(n.beat[0]+n.beat[1]/n.beat[2])*60000/bpm-T-offset;
    if(dt<-acc.good){
        noteContainer.removeChild(n.shape);
        delete map.note[i];
        combo=0;
        eval="miss";    
        addEvalText();
        if(i==noteBegin){
            while(map.note[noteBegin]==null&&noteBegin<noteEnd)
                noteBegin++;
        }
        return true;
    }
    return false;   
}
function init(setting={}){
    w=document.body.clientWidth;
    h=document.body.clientHeight;
    document.getElementById("canvas").width=w;
    document.getElementById("canvas").height=h;
    stage=new createjs.Stage("canvas");
    createjs.Ticker.timingMode=createjs.Ticker.RAF;
    createjs.Touch.enable(stage);
    offset=map.note.pop().offset;
    if(typeof(offset)=="undefined")offset=0;
    bpm=map.time[0].bpm;
    noteBegin=0;
    noteEnd=map.note.length;
    noteAdded=0;
    speed=1000;
    if(setting.speed!=null)speed=1500-setting.speed*10;
    longNoteHiting=[];
    T=0;
    eval="";
    combo=0;
    acc={
        "best":51,
        "cool":76,
        "good":110,
        "miss":150,
    };
    noteColor=["#ffffff","#4a86e8","#4a86e8","#ffffff"];
}
function addEvalText(isRemove=true){
    if(isRemove){
        stage.removeChild(evalText);
        stage.removeChild(comboText);
    }
    evalText=new createjs.Text(eval,"50px Arial","black");
    comboText=new createjs.Text(""+combo,"50px Arial","black");
    evalText.x=w/2;
    evalText.y=h/4;
    evalText.textBaseline="middle";
    evalText.textAlign="center";
    comboText.x=w/2;
    comboText.y=h/4+50;
    comboText.textBaseline="middle";
    comboText.textAlign="center";
    stage.addChild(evalText);
    stage.addChild(comboText);
}
function evalByDt(dt){
    if(dt>acc.good){
        eval="miss";
        combo=0;
    }
    else if(Math.abs(dt)>acc.cool){
        eval="good";
        combo++;
    }     
    else if(Math.abs(dt)>acc.best){
        eval="cool";
        combo++;
    }
    else{
        eval="best";
        combo++;
    }   
}
function shapeNote(){
    for(i in map.note){
        n=map.note[i];
        n.shape=new createjs.Shape();
        if(n.endbeat==null){
            n.shape.graphics.f(noteColor[n.column]).r(0,0,w/4,h/30);
        }
        else{
            n.onHit="none";
            b0=n.beat[0]+n.beat[1]/n.beat[2];
            b1=n.endbeat[0]+n.endbeat[1]/n.endbeat[2];
            t=(b1-b0)*60000/bpm;
            n.shape.graphics.f(noteColor[n.column]).r(0,0,w/4,t*h/speed+h/30);
        }
        n.shape.x=n.column*w/4;
    }
}
function addCheckLine(){
    checkLineShape=new createjs.Shape();
    checkLineShape.graphics.f("black").r(0,0,w,h/30);
    checkLineShape.y=h*0.9;
    stage.addChild(checkLineShape);
}
function addNoteContainer(){
    noteContainer=new createjs.Container();
    stage.addChild(noteContainer);
}
function start4K(setting){
    load();
    init(setting);
    shapeNote();
    addNoteContainer();
    addCheckLine();
    ready(setting);
}
function stageAddEventListener(){
    stage.addEventListener("stagemousedown",(e)=>{
        col=Math.floor(e.stageX*4/w);
        for(i=noteBegin;i<noteEnd;i++){
            n=map.note[i];
            if(n==null)continue;
            if(n.column!=col)continue;
            if(n.endbeat==null){
                dt=(n.beat[0]+n.beat[1]/n.beat[2])*60000/bpm-T-offset;
                if(dt>acc.miss)break;
                evalByDt(dt);
                noteContainer.removeChild(n.shape);
                delete map.note[i];
            }
            else{
                b1=n.beat[0]+n.beat[1]/n.beat[2];
                b2=n.endbeat[0]+n.endbeat[1]/n.endbeat[2];
                dt0=b1*60000/bpm-T-offset;
                dt=b2*60000/bpm-T-offset;
                if(dt0>acc.loss)break;
                evalByDt(dt0);
                if(eval!="miss"){
                    n.onHit="hit";
                    longNoteHiting[n.column]=i;
                }
            }
            addEvalText();
            break;
        }
    });
    stage.addEventListener("stagemouseup",(e)=>{
        col=Math.floor(e.stageX*4/w);
        i=longNoteHiting[col];
        if(i!=null){
            n=map.note[i];
            b1=n.endbeat[0]+n.endbeat[1]/n.endbeat[2];
            dt1=b1*60000/bpm-T-offset;
            if(Math.abs(dt1)>acc.good){
                n.onHit="miss";
                combo=0;
                eval="miss";  
                addEvalText();
            }
        }
    });
}
function ready(setting){
    readyText=new createjs.Text("READY","50px Arial","black");
    readyText.x=w/2;
    readyText.y=h/4;
    readyText.textBaseline="middle";
    readyText.textAlign="center";
    area=new createjs.Shape();
    area.graphics.f("black").r(-w/2,-h/4,w,h);
    readyText.hitArea=area;
    stage.addChild(readyText);
    stage.update();
    readyText.addEventListener("click",(e)=>{
        if(!loadComplete){
            alert("loading...");
            return;
        }
        stage.removeChild(readyText);
        addEvalText(false);
        stageAddEventListener();
        createjs.Sound.play("sound");
        sleep(setting.delay);
        createjs.Ticker.addEventListener("tick",(e)=>{
        T=e.runTime;
        for(i=noteBegin;i<noteEnd;i++){
            n=map.note[i];
            if(n==null)continue;
            if(n.endbeat==null){
                if(checkNote(i))continue;
                n.shape.y=h*0.9-dt*h/speed-h/30;
                if(n.shape.y<0)break;
                if(i>=noteAdded){
                    noteContainer.addChild(n.shape);
                    noteAdded++;
                }
            }
            else{
                if(checkLongNote(i))continue;
                n.shape.y=h*0.9-dt1*h/speed-h/30;
                y0=h*0.9-dt0*h/speed;
                if(y0<0)break;
                if(i>=noteAdded){
                    noteContainer.addChild(n.shape);
                    noteAdded++;
                }
            }
        }
        stage.update();
    });
    });
}
function sleep(d){
  for(var t=Date.now();Date.now()-t<=d;);
}
