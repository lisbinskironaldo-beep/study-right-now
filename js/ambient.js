/* =====================================================
   YOUTUBE PLAYER
===================================================== */

const YT_API_KEY = "AIzaSyA0cotyjGl5YJwbl0SeB73C04lfCRMrJS8"

const ytSearchCache = {}
async function youtubeSearch(query){

ytCursor = 0

/* CACHE */

if(ytSearchCache[query]){
renderYoutubeResults(ytSearchCache[query])
return
}

const url =
`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(query)}&key=${YT_API_KEY}`

const res = await fetch(url)
const data = await res.json()

const results = document.getElementById("youtubeResults")

if(!data.items){
console.log("YouTube API error:", data)
results.innerHTML=`<div class="ambient-empty">Nenhum resultado</div>`
return
}

/* salvar cache */

ytSearchCache[query] = data.items

renderYoutubeResults(data.items)

}

function renderYoutubeResults(items){

const results = document.getElementById("youtubeResults")

results.innerHTML = items.map(v=>{

const id = v.id?.videoId
if(!id) return ""

const title = v.snippet.title
const thumb = v.snippet.thumbnails.medium.url

return `
<div class="youtube-result" data-id="${id}">

<div class="youtube-thumb-wrapper">
<img class="youtube-thumb" src="${thumb}">
<button class="yt-play">▶</button>
</div>

<div class="youtube-title">
${title.slice(0,60)}
</div>

<button class="yt-fav ${AmbientEngine.categories.favorites.sounds.find(f=>f.youtube===id)?"fav-on":""}">F</button>

</div>
`

}).join("")

document.querySelectorAll(".yt-play").forEach(btn=>{
btn.onclick = (e)=>{
const id = e.target.closest(".youtube-result").dataset.id
playYoutube(id)
}
})

}

let ytCursor=0

let ytPresetCursor = 0

let ytPresetMode = false

function bindYoutubeKeyboard(){

const search=document.getElementById("youtubeSearch")

search.addEventListener("keydown",(e)=>{

const rows=document.querySelectorAll(".youtube-result")

if(e.key==="ArrowDown"){
e.preventDefault()
ytCursor++
if(ytCursor>=rows.length) ytCursor=rows.length-1
}

if(e.key==="ArrowUp"){
e.preventDefault()
ytCursor--
if(ytCursor<0) ytCursor=0
}

if(e.key==="Enter"){

if(rows.length){

const id=rows[ytCursor].dataset.id
playYoutube(id)

}else{

youtubeSearch(search.value)

}

}

rows.forEach((r,i)=>{
r.classList.toggle("cursor",i===ytCursor)
})

})

}

let ytPlayer = null

window.onYouTubeIframeAPIReady = function(){

ytPlayer = new YT.Player("youtubePlayer",{
height:"0",
width:"0",
videoId:"",
playerVars:{
autoplay:0,
controls:0,
rel:0
},

events:{
onReady:onYTReady,
onStateChange:onYTState
}

})

}

let ytReady=false

function onYTReady(){
ytReady=true
}

function onYTState(e){

/* quando começa tocar */

if(e.data===YT.PlayerState.PLAYING){

updateYTTime()

}

}

async function youtubePreset(type){

  const res = await fetch("youtube-catalog.json")
  const catalog = await res.json()

  const items = catalog[type]
  if(!items) return

  const results = document.getElementById("youtubeResults")
  if(!results) return

  results.innerHTML = items.map(v => `

<div class="youtube-result" data-id="${v.id}">

<button class="yt-fav">F</button>

<div class="youtube-thumb-wrapper">
<img class="youtube-thumb" src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg">
<button class="yt-play">▶</button>
</div>

<div class="youtube-title">
${v.title.slice(0,60)}
</div>

</div>

`).join("")

  document.querySelectorAll(".yt-play").forEach(btn=>{
btn.onclick=(e)=>{
const id=e.target.closest(".youtube-result").dataset.id
playYoutube(id)
}
})

document.querySelectorAll(".yt-fav").forEach(btn=>{

btn.onclick=(e)=>{

e.stopPropagation()

const row = btn.closest(".youtube-result")
const id = row.dataset.id
const title = row.querySelector(".youtube-title").textContent

const favs = AmbientEngine.categories.favorites.sounds

const pos = favs.findIndex(v => v.youtube === id)

if(pos === -1){

favs.push({
name:title,
youtube:id
})

btn.classList.add("fav-on")

}else{

favs.splice(pos,1)
btn.classList.remove("fav-on")

}

localStorage.setItem(
"ambient_favorites",
JSON.stringify(favs)
)

}

})

}

function playYoutube(id){

if(AmbientEngine.currentAudio){
AmbientEngine.fadeOut(AmbientEngine.currentAudio)
AmbientEngine.currentAudio=null
}

if(!window.YT || !YT.Player){
return
}

if(!ytPlayer){
ytPlayer = new YT.Player("youtubePlayer",{
height:"0",
width:"0",
videoId:id,
playerVars:{
autoplay:1,
controls:0,
rel:0
}
})
return
}

ytPlayer.loadVideoById(id)
ytPlayer.playVideo()

const seek = document.getElementById("ytSeek")
const cur = document.getElementById("ytCurrent")
const dur = document.getElementById("ytDuration")

if(seek) seek.value = 0
if(cur) cur.textContent = "0:00"
if(dur) dur.textContent = "0:00"

}

/* =====================================================
   AMBIENT ENGINE
===================================================== */

const AmbientEngine = {

categories:{

    /* ================= CHUVA ================= */


rain:{
icon:"🌧",
label:"Chuva",
sounds:[

{name:"Stormfall",src:"assets/sounds/Stormfall.wav"},
{name:"Rainveil",src:"assets/sounds/Rainveil.mp3"},
{name:"Downpour",src:"assets/sounds/Downpour.wav"},
{name:"Mistfall",src:"assets/sounds/Mistfall.mp3"},
{name:"Cloudburst",src:"assets/sounds/Cloudburst.wav"},
{name:"Stormhush",src:"assets/sounds/Stormhush.wav"},
{name:"Greyflow",src:"assets/sounds/Greyflow.wav"},
{name:"Nightrain",src:"assets/sounds/Nightrain.mp3"},
{name:"Stillstorm",src:"assets/sounds/Stillstorm.mp3"}
]
},

    /* ================= CAFÉ ================= */

cafe:{
icon:"☕",
label:"Café",
sounds:[
    {name:"Café suave",src:"assets/sounds/cafe.mp3"}
]},

    /* ================= BIBLIOTECA ================= */

library:{
icon:"📚",
label:"Biblioteca",
sounds:[
    {name:"Biblioteca silenciosa",src:"assets/sounds/white.mp3"}
]},

    /* ================= NATUREZA ================= */

nature:{
icon:"🌿",
label:"Natureza",
sounds:[
    {name:"Forest Wind",src:"assets/sounds/forest.mp3"},
    {name:"Night Crickets",src:"assets/sounds/crickets.mp3"},
    {name:"River Flow",src:"assets/sounds/river.mp3"}
]
},

    /* ================= LAREIRA ================= */

fireplace:{
icon:"🔥",
label:"Lareira",
sounds:[
{name:"Fireplace Calm",src:"assets/sounds/fireplace.mp3"},
{name:"Warm Fire",src:"assets/sounds/fire2.mp3"}
]
},

    /* ================= CIDADE ================= */

city:{
icon:"🌆",
label:"Cidade",
sounds:[
{name:"Night City",src:"assets/sounds/city.mp3"},
{name:"Distant Traffic",src:"assets/sounds/traffic.mp3"},
{name:"Metro Ambience",src:"assets/sounds/metro.mp3"}
]
},

    /* ================= YOUTUBE ================= */

youtube:{
icon:"▶",
label:"YouTube",
sounds:[
]
},

/* ================= FAVORITOS ================= */

favorites:{
icon:"⭐",
label:"Favoritos",
sounds:[]
},

},

currentAudio:null,
currentCategory:null,
currentIndex:0,
cursorIndex:0,
currentCategoryIndex:0,

/* ================= INIT ================= */

init(){

bindYoutubeKeyboard()

const search=document.getElementById("youtubeSearch")

if(search){


search.addEventListener("keydown",(e)=>{

if(e.key==="Enter"){
youtubeSearch(search.value)
}

})

}

const savedFav=localStorage.getItem("ambient_favorites")
if(savedFav){
this.categories.favorites.sounds=JSON.parse(savedFav)
}

this.bindOutsideClick()

this.renderPlayerCategories()

this.currentCategory=Object.keys(this.categories)[0]
this.renderPlayerSounds(this.currentCategory)

this.bindKeyboard()
this.bindPlayer()

const p=document.getElementById("ambientPrev")
const n=document.getElementById("ambientNext")
const t=document.getElementById("ambientPlay")
const volume=document.getElementById("ambientVolume")

if(volume){
volume.addEventListener("input",(e)=>{
if(this.currentAudio){
this.currentAudio.volume=parseFloat(e.target.value)
}
})
}

if(p)p.onclick=()=>this.prev()
if(n)n.onclick=()=>this.next()
if(t)t.onclick=()=>this.toggle()

},

/* ================= PLAY ================= */

play(src){

/* parar qualquer áudio anterior */

if(this.currentAudio){
this.currentAudio.pause()
this.currentAudio.currentTime=0
this.currentAudio=null
}

/* parar youtube se estiver tocando */

if(typeof ytPlayer!=="undefined" && ytPlayer && ytPlayer.stopVideo){
ytPlayer.stopVideo()
}

const sound=this.categories[this.currentCategory].sounds[this.currentIndex]

/* se for youtube */

if(sound.youtube){

playYoutube(sound.youtube)

document.querySelectorAll(".ambient-sound")
.forEach(r=>r.classList.remove("playing"))

const row=document.querySelector(`.ambient-sound[data-index="${this.currentIndex}"]`)
if(row)row.classList.add("playing")

return
}

/* áudio local */

const audio=new Audio(src)
audio.loop=true

const volumeSlider=document.getElementById("ambientVolume")
audio.volume=volumeSlider?parseFloat(volumeSlider.value):0.3

audio.play()

this.fadeIn(audio)

this.currentAudio=audio

document.querySelectorAll(".ambient-sound")
.forEach(r=>r.classList.remove("playing"))

const row=document.querySelector(`.ambient-sound[data-index="${this.currentIndex}"]`)
if(row)row.classList.add("playing")

},

toggle(){

if(!this.currentAudio)return

if(this.currentAudio.paused){
this.currentAudio.play()
}else{
this.currentAudio.pause()
}

},

prev(){

const sounds=this.categories[this.currentCategory].sounds

this.currentIndex=(this.currentIndex-1+sounds.length)%sounds.length
this.cursorIndex=this.currentIndex

this.play(sounds[this.currentIndex].src)

},

next(){

const sounds=this.categories[this.currentCategory].sounds

this.currentIndex=(this.currentIndex+1)%sounds.length
this.cursorIndex=this.currentIndex

this.play(sounds[this.currentIndex].src)

},

/* ================= FADE ================= */

fadeIn(audio){

let volume=0

const interval=setInterval(()=>{

volume+=0.05

if(volume>=0.3){
volume=0.3
clearInterval(interval)
}

audio.volume=volume

},50)

},

fadeOut(audio){

let volume=audio.volume

const interval=setInterval(()=>{

volume-=0.05

if(volume<=0){
volume=0
clearInterval(interval)
audio.pause()
}

audio.volume=volume

},50)

},

/* ================= RENDER ================= */

renderPlayerCategories(){

const container=document.getElementById("ambientCategories")
if(!container)return

const keys=Object.keys(this.categories)

container.innerHTML=keys.map((key,i)=>`
<div class="ambient-category ${i===this.currentCategoryIndex?"active":""}"
data-index="${i}">
${this.categories[key].icon}
</div>
`).join("")

container.querySelectorAll(".ambient-category").forEach(cat=>{

cat.onclick=(e)=>{

e.stopPropagation()

const index=parseInt(cat.dataset.index)

this.currentCategoryIndex=index

const key=Object.keys(this.categories)[index]

this.currentCategory=key
this.cursorIndex=0

this.renderPlayerCategories()
this.renderPlayerSounds(key)

}

})

},

renderPlayerSounds(category){

const yt=document.getElementById("ambientYoutube")

if(yt){
yt.classList.toggle("hidden",category!=="youtube")
}

const container=document.getElementById("ambientSounds")

if(category==="youtube"){
container.innerHTML=""
return
}
if(!container)return

const sounds=this.categories[category].sounds

if(category==="favorites" && sounds.length===0){
container.innerHTML=`
<div class="ambient-empty">
Nenhum favorito ainda
</div>
`
return
}
const favs = this.categories.favorites.sounds

container.innerHTML = sounds.map((s,i)=>`
<div class="ambient-sound" data-cat="${category}" data-index="${i}">
<span class="ambient-play">▶</span>
<span class="ambient-title">${s.name}</span>
<span class="ambient-fav ${favs.some(f=>f.src===s.src) ? "fav-on" : ""}">
F
</span>
</div>
`).join("")

container.querySelectorAll(".ambient-sound").forEach(row=>{

row.onclick=()=>{

const cat=row.dataset.cat
const index=parseInt(row.dataset.index)

if(this.currentAudio && this.currentCategory===cat && this.currentIndex===index){
this.toggle()
return
}

const favBtn=row.querySelector(".ambient-fav")

favBtn.onclick=(e)=>{

e.stopPropagation()

const cat=row.dataset.cat
const index=parseInt(row.dataset.index)

const sound=this.categories[cat].sounds[index]

const favs=this.categories.favorites.sounds
const pos=favs.findIndex(s=>s.src===sound.src)

if(pos===-1){

favs.push(sound)
favBtn.classList.add("fav-on")

}else{

favs.splice(pos,1)
favBtn.classList.remove("fav-on")

if(cat==="favorites"){
this.renderPlayerSounds("favorites")
}

}

localStorage.setItem("ambient_favorites",JSON.stringify(favs))

}

this.currentCategory=cat
this.currentIndex=index
this.cursorIndex=index

const sound=this.categories[cat].sounds[index]

this.play(sound.src)

if(sound.youtube){
playYoutube(sound.youtube)
}

}

})

},

/* ================= KEYBOARD ================= */

bindKeyboard(){

document.addEventListener("keydown",(e)=>{

const panel=document.getElementById("ambientPanelNew")

/* fechar com ESC */

if(e.key==="Escape"){
panel.classList.remove("open")
return
}

/* abrir painel com ↑ */

if(e.key==="ArrowUp" && panel && !panel.classList.contains("open")){
panel.classList.add("open")
return
}

if(!panel || !panel.classList.contains("open")) return

const rows=document.querySelectorAll(".ambient-sound")

/* ================= YOUTUBE NAV ================= */

if(this.currentCategory==="youtube"){

const presets=document.querySelectorAll(".youtube-presets button")

/* entrar no modo presets */

if(e.key==="ArrowDown" && !ytPresetMode){

ytPresetMode=true

presets.forEach(b=>b.classList.remove("cursor"))
ytPresetCursor=0

if(presets.length){
presets[ytPresetCursor].classList.add("cursor")
}

return
}

/* sair dos presets */

if(e.key==="ArrowUp" && ytPresetMode){

ytPresetMode=false

presets.forEach(b=>b.classList.remove("cursor"))

return
}

/* navegar dentro dos presets */

if(ytPresetMode){

if(e.key==="ArrowRight"){

ytPresetCursor++

if(ytPresetCursor>=presets.length) ytPresetCursor=0

presets.forEach(b=>b.classList.remove("cursor"))
presets[ytPresetCursor].classList.add("cursor")

return
}

if(e.key==="ArrowLeft"){

ytPresetCursor--

if(ytPresetCursor<0) ytPresetCursor=presets.length-1

presets.forEach(b=>b.classList.remove("cursor"))
presets[ytPresetCursor].classList.add("cursor")

return
}

if(e.key==="Enter"){

const btn=presets[ytPresetCursor]

if(btn) btn.click()

return
}

}

}

const search=document.getElementById("youtubeSearch")

/* se estiver digitando na busca */

if(search && document.activeElement===search){

if(e.key==="ArrowDown"){
search.blur()
this.cursorIndex=0
return
}

}

if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Enter"].includes(e.key)){
e.preventDefault()
}

if(rows.length){

if(e.key==="ArrowDown"){

/* se estiver na categoria youtube, ir para a busca */

if(this.currentCategory==="youtube"){
const search=document.getElementById("youtubeSearch")
if(search){
search.focus()
return
}
}

this.cursorIndex++
if(this.cursorIndex>=rows.length)this.cursorIndex=rows.length-1
}

if(e.key==="ArrowUp"){
this.cursorIndex--
if(this.cursorIndex<0)this.cursorIndex=0
}

}

if(e.key==="ArrowRight"){

const keys = Object.keys(this.categories)

this.currentCategoryIndex++

if(this.currentCategoryIndex >= keys.length){
this.currentCategoryIndex = 0
}

this.currentCategory = keys[this.currentCategoryIndex]

this.renderPlayerCategories()
this.renderPlayerSounds(this.currentCategory)

this.cursorIndex = 0

return
}

if(e.key==="ArrowLeft"){

const keys = Object.keys(this.categories)

this.currentCategoryIndex--

if(this.currentCategoryIndex < 0){
this.currentCategoryIndex = keys.length - 1
}

this.currentCategory = keys[this.currentCategoryIndex]

this.renderPlayerCategories()
this.renderPlayerSounds(this.currentCategory)

this.cursorIndex = 0

return
}

if(e.key==="f"||e.key==="F"){

const row=rows[this.cursorIndex]
if(!row)return

const cat=row.dataset.cat
const index=parseInt(row.dataset.index)

const sound=this.categories[cat].sounds[index]

const favs=this.categories.favorites.sounds
const pos=favs.findIndex(s=>s.src===sound.src)

const favBtn=row.querySelector(".ambient-fav")

if(pos===-1){

favs.push(sound)
favBtn.classList.add("fav-on")

}else{

favs.splice(pos,1)
favBtn.classList.remove("fav-on")

if(cat==="favorites"){
this.renderPlayerSounds("favorites")
}

}

localStorage.setItem("ambient_favorites",JSON.stringify(favs))

return
}

if(e.key==="Enter"){

const row=rows[this.cursorIndex]
const cat=row.dataset.cat
const index=parseInt(row.dataset.index)

if(this.currentAudio && this.currentCategory===cat && this.currentIndex===index){
this.toggle()
return
}

this.currentCategory=cat
this.currentIndex=index

this.play(this.categories[cat].sounds[index].src)

}

if(rows.length){
rows.forEach((r,i)=>{
r.classList.remove("cursor")
if(i===this.cursorIndex)r.classList.add("cursor")
})
}

})

},

/* ================= UI ================= */

bindPlayer(){

const main=document.getElementById("ambientMain")
const panel=document.getElementById("ambientPanelNew")

if(!main||!panel)return

main.onclick=()=>{
panel.classList.add("open")
}

},

bindOutsideClick(){

document.addEventListener("click",(e)=>{

const player=document.getElementById("ambientPlayer")
const panel=document.getElementById("ambientPanelNew")

if(player && panel && !player.contains(e.target) && !panel.contains(e.target)){
panel.classList.remove("open")
}

})

}

}

/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded",()=>{
AmbientEngine.init()
})

const Ambient=AmbientEngine

document.addEventListener("keydown",(e)=>{

if(e.key.toLowerCase()!=="k") return

const active=document.activeElement
if(!active) return

const tag=active.tagName.toLowerCase()

if(
tag==="input"||
tag==="textarea"||
tag==="button"||
active.isContentEditable
) return

const current=document.querySelector(".ambient-track.active")
if(!current) return

current.click()

})

let seeking = false

if(seek){

seek.addEventListener("mousedown",()=>seeking=true)
seek.addEventListener("mouseup",()=>seeking=false)

seek.addEventListener("input",()=>{

if(!ytPlayer) return

const duration = ytPlayer.getDuration()

if(!duration) return

const time = (seek.value/100) * duration

ytPlayer.seekTo(time,true)

})

}

function formatTime(t){

const m = Math.floor(t/60)
const s = Math.floor(t%60)

return m + ":" + (s<10 ? "0"+s : s)

}

function updateYTTime(){

setInterval(()=>{

if(!ytPlayer) return
if(typeof ytPlayer.getDuration !== "function") return

const duration = ytPlayer.getDuration()
const current = ytPlayer.getCurrentTime()

/* ignora valores bugados */

if(!duration || duration < 1 || duration > 86400) return

const seek = document.getElementById("ytSeek")
const cur = document.getElementById("ytCurrent")
const dur = document.getElementById("ytDuration")

function format(t){
const m = Math.floor(t/60)
const s = Math.floor(t%60)
return m + ":" + (s<10 ? "0"+s : s)
}

if(seek){
seek.value = (current/duration)*100
}

if(cur){
cur.textContent = format(current)
}

if(dur){
dur.textContent = format(duration)
}

},500)

}

const playBtn=document.getElementById("ytPlayPause")
const backBtn=document.getElementById("ytBack")
const fwdBtn=document.getElementById("ytForward")

if(playBtn){

playBtn.onclick=()=>{

const state=ytPlayer.getPlayerState()

if(state===1){
ytPlayer.pauseVideo()
}else{
ytPlayer.playVideo()
}

}

}

if(backBtn){

backBtn.onclick=()=>{

const t=ytPlayer.getCurrentTime()
ytPlayer.seekTo(t-10,true)

}

}

if(fwdBtn){

fwdBtn.onclick=()=>{

const t=ytPlayer.getCurrentTime()
ytPlayer.seekTo(t+10,true)

}

}

const ytVolume=document.getElementById("ytVolume")

if(ytVolume){

ytVolume.addEventListener("input",()=>{

if(!ytPlayer) return

ytPlayer.setVolume(parseInt(ytVolume.value))

})

}