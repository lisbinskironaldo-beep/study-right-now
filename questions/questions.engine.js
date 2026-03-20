window.QuestionsEngine = {

getNext(context, db, profile) {

const base = db[context.base]
if (!base) return []

const focusList = base[context.focus] || []
const all = focusList.length ? focusList : Object.values(base).flat()

const scores = {}

all.forEach(q => {

const p = profile[q.topic] || { errors:0, hits:0 }

const errorRate = p.errors / (p.hits + p.errors + 1)

const lastSeen = p.lastSeen || 0
const timeFactor = (Date.now() - lastSeen) / 100000

scores[q.topic] =
(errorRate * 0.6) +
(timeFactor * 0.3)

})

const sorted =
Object.entries(scores)
.sort((a,b)=>b[1]-a[1])

// pega top 3 piores
const pool = sorted.slice(0, 3)

// escolhe aleatório entre eles
const worstTopic =
pool[Math.floor(Math.random() * pool.length)]?.[0]

const filtered =
all.filter(q => q.topic === worstTopic)

// fallback se tiver poucas questões
if (filtered.length < 3) {
return this.shuffle(all)
}

return this.shuffle(filtered)

},

shuffle(arr){
return [...arr].sort(()=>Math.random()-0.5)
}

}