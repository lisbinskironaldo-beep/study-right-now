const AmbientUI = {

init(){

const root = document.getElementById("ambientRoot")
root.style.display="block"
AmbientState.panelMode = 0


root.innerHTML = `

<div id="ambientMini" class="ambient-mini" title="Clique para abrir a biblioteca">

<div class="ambient-player">

<span class="mini-indicator left">❮</span>
<button id="ambientHelpBtn" title="Atalhos">⌘</button>
<span class="mini-indicator right">❯</span>
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

<div id="categorySelector" class="category-selector hidden">

<div class="category-wheel">

<div class="cat-item" data-cat="lofi">Lofi</div>
<div class="cat-item" data-cat="focus">Focus</div>
<div class="cat-item" data-cat="piano">Piano</div>
<div class="cat-item" data-cat="jazz">Jazz</div>

<div class="cat-item" data-cat="ambient">Ambient</div>
<div class="cat-item" data-cat="nature">Nature</div>
<div class="cat-item" data-cat="fireplace">fireplace</div>
<div class="cat-item" data-cat="rain">Rain</div>
<div class="cat-item" data-cat="white">Noise</div>

</div>

</div>


<div class="ambient-panel">

<div class="ambient-header">

<button id="ambientPanelHide" title="Esconder">
<svg viewBox="0 0 24 24" width="16" height="16">
<path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2"/>
</svg>
</button>

<button id="ambientFavBtn" title="Favoritos">
<svg viewBox="0 0 24 24" width="16" height="16">
<path d="M12 17l-5 3 1.5-5.5L4 9h5.7L12 4l2.3 5H20l-4.5 5.5L17 20z" fill="currentColor"/>
</svg>
</button>

<button id="ambientCatBtn" title="Categorias">
<svg viewBox="0 0 24 24" width="16" height="16">
<circle cx="6" cy="6" r="2" fill="currentColor"/>
<circle cx="18" cy="6" r="2" fill="currentColor"/>
<circle cx="6" cy="18" r="2" fill="currentColor"/>
<circle cx="18" cy="18" r="2" fill="currentColor"/>
</svg>
</button>

<button id="ambientShuffle" title="Embaralhar">
<svg viewBox="0 0 24 24" width="16" height="16">
<path d="M4 6h4l8 12h4M16 6h4v4" fill="none" stroke="currentColor" stroke-width="2"/>
</svg>
</button>



</div>

<div id="ambientList" class="ambient-list"></div>

</div>

`

this.bindControls()

const mini = document.getElementById("ambientMini")


let dragging = false
let offsetX = 0
let offsetY = 0

mini.addEventListener("mousedown",(e)=>{

if(e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") return

dragging = true
mini.classList.add("dragging")

const rect = mini.getBoundingClientRect()

offsetX = e.clientX - rect.left
offsetY = e.clientY - rect.top

})

document.addEventListener("mousemove",(e)=>{

if(!dragging) return

const x = e.clientX - offsetX
const y = e.clientY - offsetY

mini.style.left = x + "px"
mini.style.top = y + "px"

mini.style.bottom = "auto"

})

document.addEventListener("mouseup",()=>{

if(!dragging) return

dragging = false
mini.classList.remove("dragging")

localStorage.setItem("ambientMiniX",mini.style.left)
localStorage.setItem("ambientMiniY",mini.style.top)

})


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

<button class="fav-btn ${fav ? "active" : ""}" data-id="${v.id}">★</button>

<img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg">

<div class="ambient-title">
${v.title}
</div>

</div>

`

}).join("")

this.bindItems()

const panel = document.querySelector(".ambient-panel")

const playing = AmbientState.visible.find(
v => v.id === AmbientState.currentVideo
)

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

row.querySelector(".fav-btn")?.addEventListener("click",(e)=>{

e.stopPropagation()

const id = e.currentTarget.dataset.id

const idx = AmbientState.favorites.indexOf(id)

if(idx === -1){
AmbientState.favorites.push(id)
}else{
AmbientState.favorites.splice(idx,1)
}

localStorage.setItem("ambient_favorites",JSON.stringify(AmbientState.favorites))

AmbientUI.renderList()

})

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


/* fechar categorias clicando fora */

document.addEventListener("click",(e)=>{

const sel = document.getElementById("categorySelector")

if(!sel) return
if(sel.classList.contains("hidden")) return

const wheel = document.querySelector(".category-wheel")

if(!wheel) return

if(!wheel.contains(e.target) && e.target.id !== "ambientCatBtn"){

sel.classList.add("hidden")

}

})


/* fechar categorias com ESC */

document.addEventListener("keydown",(e)=>{

if(e.key !== "Escape") return

const sel = document.getElementById("categorySelector")

if(!sel) return

sel.classList.add("hidden")

})

document.addEventListener("click",(e)=>{

const btn = e.target.closest("button")
if(!btn) return

const id = btn.id


if(id==="ambientFavBtn"){

if(!AmbientState.favoritesMode){

let favList = []

Object.keys(AmbientState.catalog).forEach(cat=>{

const list = AmbientState.catalog[cat]

if(!Array.isArray(list)) return

list.forEach(v=>{
if(AmbientState.favorites.includes(v.id)){
favList.push(v)
}
})

})

AmbientState.visible = favList
AmbientState.cursor = 0
AmbientState.favoritesMode = true

}else{

AmbientState.favoritesMode = false
AmbientYoutube.buildRandomList()

}

AmbientUI.renderList()

}


if(id==="ambientPanelHide"){

const panel = document.querySelector(".ambient-panel")

if(panel){
panel.style.display="none"
}

AmbientState.panelMode = 1

}


if(id==="ambientShuffle"){

AmbientState.favoritesMode = false
AmbientYoutube.buildRandomList()

}


if(id==="ambientCatBtn"){

const sel = document.getElementById("categorySelector")

if(sel){
sel.classList.toggle("hidden")
}

}


if(e.target.id==="ambientPlay"){

if(!AmbientState.currentVideo){

if(AmbientState.visible.length){

AmbientState.cursor = 0
AmbientPlayer.playIndex(0)

AmbientUI.renderList()

}

return
}

AmbientPlayer.toggle()

}
if(id==="ambientNext"){
AmbientPlayer.next()
}

if(id==="ambientPrev"){
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


document.querySelectorAll(".cat-item").forEach(btn=>{

btn.onclick = ()=>{

const cat = btn.dataset.cat

AmbientYoutube.buildCategory(cat)

const sel = document.getElementById("categorySelector")

if(sel){
sel.classList.add("hidden")
}

}

})

}

}

document.addEventListener("DOMContentLoaded",()=>{

AmbientUI.init()
AmbientYoutube.loadCatalog()

})