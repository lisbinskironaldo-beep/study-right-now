const AmbientUI = {

init(){

const root = document.getElementById("ambientRoot")
root.style.display="block"
AmbientState.panelMode = 0


root.innerHTML = `

<div id="ambientMini" class="ambient-mini" title="Clique para abrir a biblioteca">
<div class="ambient-player">

<div class="ambient-progress">

<span id="ambientTimeCurrent">0:00</span>

<input id="ambientSeek"
type="range"
min="0"
max="100"
value="0"
step="0.1">

<span id="ambientTimeTotal">0:00</span>

</div>

<div class="ambient-controls">

<button id="ambientPrev">⏮</button>
<button id="ambientPlay">▶</button>
<button id="ambientNext">⏭</button>

<input id="ambientVolume"
type="range"
min="0"
max="1"
step="0.01"
value="${AmbientState.volume}">

</div>

</div>

</div>


<div class="ambient-panel">

<div class="ambient-header">
<span id="ambientNow">🎧 Focus Sounds</span>
<button id="ambientShuffle">↻</button>
</div>

<div id="ambientList" class="ambient-list"></div>

</div>

`

this.bindControls()

const mini = document.getElementById("ambientMini")

mini.onclick = (e)=>{

if(
e.target.id === "ambientPlay" ||
e.target.id === "ambientPrev" ||
e.target.id === "ambientNext" ||
e.target.id === "ambientSeek" ||
e.target.id === "ambientVolume"
){
return
}

const panel = document.querySelector(".ambient-panel")
if(!panel) return

if(panel.style.display === "flex"){

panel.style.display = "none"
AmbientState.panelMode = 1

}else{

panel.style.display = "flex"
AmbientState.panelMode = 0

}

}

},

renderList(){

const list = document.getElementById("ambientList")
if(!list) return
if(!AmbientState.visible.length){
list.innerHTML = ""
return
}

if(!list) return

list.innerHTML = AmbientState.visible.map((v,i)=>{

const fav = AmbientState.favorites.includes(v.id)

return `

<div class="ambient-item cat-${v.category || "default"} ${
i===AmbientState.cursor ? "cursor" : ""
} ${
v.id===AmbientState.currentVideo ? "playing" : ""
} ${
fav ? "favorite" : ""
}"
data-id="${v.id}">

<img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg">

<div class="ambient-title">
${fav ? "★ " : ""}${v.title}
</div>

</div>

`

}).join("")

this.bindItems()
const now = document.getElementById("ambientNow")

const playing = (AmbientState.visible || []).find(v => v && v.id === AmbientState.currentVideo)
if(now && playing){
now.textContent = "🎧 " + playing.title
}

const panel = document.querySelector(".ambient-panel")

if(panel && playing && playing.category){

panel.className = "ambient-panel panel-" + playing.category

}

let active = list.querySelector(".ambient-item.playing")

if(!active){
active = list.querySelector(".ambient-item.cursor")
}

const items = list.querySelectorAll(".ambient-item")

if(items[AmbientState.cursor]){

items[AmbientState.cursor].scrollIntoView({
block:"nearest",
behavior:"smooth"
})

}

},

bindItems(){

document.querySelectorAll(".ambient-item")
.forEach((row,i)=>{

if(!AmbientState.visible[i]) return

row.onclick=()=>{

if(i === AmbientState.cursor){

AmbientPlayer.toggle()
return

}

AmbientState.cursor=i
AmbientPlayer.playIndex(i)

this.renderList()

}

})

},

bindControls(){

document.addEventListener("click",(e)=>{

if(e.target.id==="ambientShuffle"){
AmbientYoutube.buildRandomList()
}

if(e.target.id==="ambientPlay"){
AmbientPlayer.toggle()
}

if(e.target.id==="ambientNext"){
AmbientPlayer.next()
}

if(e.target.id==="ambientPrev"){
AmbientPlayer.prev()
}

})

const vol=document.getElementById("ambientVolume")

if(vol){

vol.oninput=()=>{

AmbientState.volume=vol.value

localStorage.setItem("ambient_volume",AmbientState.volume)

if(AmbientState.player){
AmbientState.player.setVolume(vol.value*100)
}

}

}

const seek = document.getElementById("ambientSeek")

if(seek){

seek.oninput = ()=>{

if(!AmbientState.player) return

const dur = AmbientState.player.getDuration()
if(!dur) return

const newTime = (seek.value/100) * dur

AmbientState.player.seekTo(newTime,true)

}

}

}

}

document.addEventListener("DOMContentLoaded",()=>{

AmbientUI.init()
AmbientYoutube.loadCatalog()

})