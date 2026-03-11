const AmbientPlayer = {

playIndex(i){

if(!AmbientState.visible[i]) return

const item = AmbientState.visible[i]
if(!item || !item.id) return

AmbientState.currentVideo = item.id
localStorage.setItem("ambient_last_video", item.id)

if(!AmbientState.history.includes(item.id)){
AmbientState.history.push(item.id)
}

if(AmbientState.history.length > 20){
AmbientState.history.shift()
}

AmbientState.cursor = i
AmbientState.playing=true

AmbientState.lastTime = 0
localStorage.setItem("ambient_last_time",0)

this.loadVideo(item.id)

AmbientUI.renderList()

},

loadVideo(id){

if(!window.YT || !YT.Player){
return
}

if(!window.YT || !YT.Player) return

if(!AmbientState.player){

AmbientState.player = new YT.Player("youtubePlayer",{

height:"0",
width:"0",
videoId:id,

playerVars:{
autoplay:1,
controls:0,
rel:0
},

events:{

onReady:(e)=>{

e.target.setVolume(AmbientState.volume*100)
e.target.playVideo()

if(AmbientState.lastTime){
e.target.seekTo(AmbientState.lastTime,true)
}

AmbientState.playing=true
document.getElementById("ambientPlay").textContent="⏸"

AmbientPlayer.startProgress()

},

onStateChange:(e)=>{

if(e.data===YT.PlayerState.ENDED){

AmbientPlayer.next()
AmbientUI.renderList()

}

if(e.data===YT.PlayerState.PLAYING){

AmbientPlayer.startProgress()

}

}

}

})

return

}

AmbientState.player.loadVideoById({
videoId:id,
startSeconds:AmbientState.lastTime || 0
})

AmbientState.player.playVideo()

AmbientState.playing=true
document.getElementById("ambientPlay").textContent="⏸"

AmbientPlayer.startProgress()

},

toggle(){

if(!AmbientState.player) return
if(!AmbientState.visible.length) return

if(AmbientState.playing){

AmbientState.player.pauseVideo()
AmbientState.playing=false
document.getElementById("ambientPlay").textContent="▶"

if(this.progressInterval){
clearInterval(this.progressInterval)
this.progressInterval = null
}

}else{

AmbientState.player.playVideo()
AmbientState.playing=true
document.getElementById("ambientPlay").textContent="⏸"

this.startProgress()

}

},

next(){

let i = AmbientState.cursor+1

if(i>=AmbientState.visible.length){

AmbientState.history.push(AmbientState.currentVideo)

AmbientYoutube.buildRandomList()
return

}
if(!AmbientState.visible[i]) return
this.playIndex(i)
AmbientUI.renderList()

},

prev(){

let i = AmbientState.cursor-1

if(i<0){

i=AmbientState.visible.length-1

if(i<0) return

}

this.playIndex(i)
AmbientUI.renderList()

},

startProgress(){

if(this.progressInterval){
clearInterval(this.progressInterval)
}

this.progressInterval=setInterval(()=>{

if(!AmbientState.player || !AmbientState.playing) return

const cur=AmbientState.player.getCurrentTime()
const dur=AmbientState.player.getDuration()

localStorage.setItem("ambient_last_time", cur)

if(!dur || dur === Infinity) return

const seek=document.getElementById("ambientSeek")
const curTxt=document.getElementById("ambientTimeCurrent")
const durTxt=document.getElementById("ambientTimeTotal")

if(seek){
seek.value=(cur/dur)*100
}

if(curTxt){
curTxt.textContent=this.formatTime(cur)
}

if(durTxt){
durTxt.textContent=this.formatTime(dur)
}

},500)

},

formatTime(sec){

sec = Math.floor(sec)

const h = Math.floor(sec / 3600)
const m = Math.floor((sec % 3600) / 60)
const s = sec % 60

if(h > 0){
return h + ":" + (m<10?"0"+m:m) + ":" + (s<10?"0"+s:s)
}

return m + ":" + (s<10?"0"+s:s)

},

}