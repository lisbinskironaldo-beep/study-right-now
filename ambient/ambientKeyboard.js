const AmbientKeyboard = {

init(){

document.addEventListener("keydown",(e)=>{

if(e.altKey && (e.key==="k" || e.key==="K")){

e.preventDefault()

const sel = document.getElementById("categorySelector")

if(sel){
sel.classList.toggle("hidden")
}

}

if(e.key === "?"){

e.preventDefault()

let help = document.getElementById("ambientHelp")

if(help){
help.remove()
return
}

help = document.createElement("div")
help.id="ambientHelp"

help.innerHTML = `
<div class="ambient-help-box">

<button id="ambientHelpClose">✕</button>

<h3>Keyboard Shortcuts</h3>

<div>ALT + ENTER — favoritar</div>
<div>ALT + F — favoritos</div>
<div>ALT + S — embaralhar</div>
<div>ALT + M — modos do painel</div>
<div>↑ ↓ — navegar lista</div>
<div>← → — trocar música</div>
<div>ENTER — tocar</div>
<div>SPACE — play / pause</div>
<div>ESC — fechar player</div>
<div>? — painel de atalhos</div>

</div>
`

document.body.appendChild(help)

document.getElementById("ambientHelpClose").onclick=()=>{
help.remove()
}

}

if(
e.target.tagName==="INPUT" ||
e.target.tagName==="TEXTAREA" ||
e.target.isContentEditable
){
return
}

if(e.altKey && (e.key==="t" || e.key==="T")){

e.preventDefault()

/* se já estiver no modo teste volta para shuffle */

if(AmbientState.visible.length > 20){

AmbientYoutube.buildRandomList()
return

}

/* ativa modo teste */

const list = []

Object.entries(AmbientState.catalog).forEach(([cat,items])=>{
items.forEach(v=>{
v.category = cat
list.push(v)
})
})

AmbientState.visible = list
AmbientState.cursor = 0
AmbientState.favoritesMode = false

AmbientUI.renderList()
AmbientPlayer.playIndex(0)

}

const items = AmbientState.visible || []
const hasItems = items.length > 0

/* abrir fechar painel */

if(e.altKey && (e.key==="m" || e.key==="M")){

e.preventDefault()

const panel = document.querySelector(".ambient-panel")
const mini = document.getElementById("ambientMini")

if(!panel || !mini) return

AmbientState.panelMode++

if(AmbientState.panelMode > 2){
AmbientState.panelMode = 0
}

if(AmbientState.panelMode === 0){
panel.style.display="flex"
mini.style.display="flex"
AmbientState.ui.panelOpen = true
}

if(AmbientState.panelMode === 1){
panel.style.display="none"
mini.style.display="flex"
AmbientState.ui.panelOpen = false
}

if(AmbientState.panelMode === 2){
panel.style.display="none"
mini.style.display="none"
AmbientState.ui.panelOpen = false
}

}

/* navegar */

if(e.key==="ArrowDown" && AmbientState.visible.length){

e.preventDefault()

AmbientState.cursor++

if(AmbientState.cursor>=items.length)
AmbientState.cursor=0

AmbientUI.renderList()

}

if(e.key==="ArrowUp" && AmbientState.visible.length){

e.preventDefault()

AmbientState.cursor--

if(AmbientState.cursor<0)
AmbientState.cursor=items.length-1

AmbientUI.renderList()

}

/* tocar */

if(e.key==="Enter" && AmbientState.visible.length){

e.preventDefault()

AmbientPlayer.playIndex(AmbientState.cursor)

}

/* play pause */

if(e.code==="Space" && !e.altKey && AmbientState.player){

e.preventDefault()

AmbientPlayer.toggle()

}

if(e.key==="Escape"){

const help = document.getElementById("ambientHelp")

if(help){
help.remove()
return
}

const panel = document.querySelector(".ambient-panel")
const mini = document.getElementById("ambientMini")

if(panel) panel.style.display="none"
if(mini) mini.style.display="none"

AmbientState.panelMode = 2

}

/* next */

if(e.key==="ArrowRight" && AmbientState.visible.length){

e.preventDefault()

AmbientPlayer.next()

}

/* prev */

if(e.key==="ArrowLeft" && AmbientState.visible.length){

e.preventDefault()

AmbientPlayer.prev()

}

/* favoritos */

document.addEventListener("keydown",(e)=>{

if(e.altKey && e.key === "Enter"){

e.preventDefault()

const item = AmbientState.visible[AmbientState.cursor]

if(!item) return

const id = item.id

const idx = AmbientState.favorites.indexOf(id)

if(idx === -1){
AmbientState.favorites.push(id)
}else{
AmbientState.favorites.splice(idx,1)
}

localStorage.setItem(
"ambient_favorites",
JSON.stringify(AmbientState.favorites)
)

AmbientUI.renderList()

}

})

/* lista favoritos */

if(e.altKey && (e.key==="f" || e.key==="F")){

e.preventDefault()

if(AmbientState.favoritesMode){

AmbientState.favoritesMode=false
AmbientYoutube.buildRandomList()
return

}

if(!AmbientState.favorites.length) return

const favList = Object.values(AmbientState.catalog)
.flat()
.filter(v=>AmbientState.favorites.includes(v.id))

AmbientState.visible = favList.slice(0,8)
AmbientState.cursor = 0
AmbientState.favoritesMode=true

AmbientUI.renderList()
AmbientPlayer.playIndex(0)

}

/* shuffle */

if(e.altKey && (e.key==="s" || e.key==="S")){

e.preventDefault()

AmbientYoutube.buildRandomList()

}

/* discovery */

if(e.altKey && (e.key==="d" || e.key==="D")){

e.preventDefault()

AmbientYoutube.buildRandomList()

}

})

}

}

document.addEventListener("DOMContentLoaded",()=>{
AmbientKeyboard.init()
})

document.addEventListener("click",(e)=>{

if(e.target.id==="ambientHelpBtn"){

let help = document.getElementById("ambientHelp")

if(help){
help.remove()
return
}

help = document.createElement("div")
help.id="ambientHelp"

help.innerHTML = `

<div class="ambient-help-box">

<button id="ambientHelpClose">✕</button>

<h3>Keyboard Shortcuts</h3>

<div>ALT + ENTER — favoritar</div>
<div>ALT + F — favoritos</div>
<div>ALT + S — embaralhar</div>
<div>ALT + M — modos do painel</div>
<div>↑ ↓ — navegar lista</div>
<div>← → — trocar música</div>
<div>ENTER — tocar</div>
<div>SPACE — play / pause</div>
<div>ESC — fechar player</div>
<div>? — painel de atalhos</div>

</div>
`

document.body.appendChild(help)

const closeBtn=document.getElementById("ambientHelpClose")

if(closeBtn){
closeBtn.onclick=()=>{
help.remove()
}
}

}

})