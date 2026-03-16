const AmbientYoutube = {

async loadCatalog(){

const res = await fetch("data/youtube-catalog.json")
const data = await res.json()

AmbientState.catalog = data || {}

Object.keys(data).forEach(cat=>{

const list = data[cat]

if(!Array.isArray(list)) return

list.forEach(v=>{

if(!v || !v.id) return

v.category = cat

})

})

this.buildRandomList()

},

buildRandomList(){

const all = []

if(!AmbientState.catalog) return

Object.values(AmbientState.catalog).forEach(list=>{
list.forEach(v=>all.push(v))
})

const unique = []
const seen = new Set()

all.forEach(v=>{
if(v && v.id && !seen.has(v.id)){
seen.add(v.id)
unique.push(v)
}
})

const shuffled = this.shuffle(unique)

/* evitar repetir músicas recentes */

let filtered = shuffled.filter(v => !AmbientState.history.slice(-20).includes(v.id))

if(filtered.length < 8){
AmbientState.history = []
filtered = shuffled
}

/* nova lista */

const playable = filtered.filter(v => v && v.id && v.title)

let list = playable.slice(0,13)

if(list.length < 10){

const fallback = shuffled.filter(v =>
v && v.id && !list.find(x => x.id === v.id)
)

list = list.concat(fallback.slice(0,10 - list.length))

}

AmbientState.visible = list

AmbientState.cursor = 0

AmbientUI.renderList()

const last = localStorage.getItem("ambient_last_video")

if(last){

const idx = AmbientState.visible.findIndex(v=>v.id===last)

if(idx !== -1){
AmbientPlayer.playIndex(idx)
return
}

}

AmbientPlayer.playIndex(0)

},

buildCategory(cat){

if(!AmbientState.catalog) return

const source = AmbientState.catalog[cat]

if(!source || !source.length) return

const list = this.shuffle(source.filter(v => v && v.id))

if(!list.length) return

AmbientState.visible = list.slice(0,13)

AmbientState.cursor = 0

AmbientUI.renderList()

AmbientPlayer.playIndex(0)

},

shuffle(arr){

return arr
.map(v=>({v, r:Math.random()}))
.sort((a,b)=>a.r-b.r)
.map(o=>o.v)

}

}