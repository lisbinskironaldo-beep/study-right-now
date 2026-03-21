const QuestionsStore = {

key: "questions_profile_v1",

data: {
},

load() {

const saved = localStorage.getItem(this.key)

if (saved) {
this.data = JSON.parse(saved)
}

},

save() {
localStorage.setItem(this.key, JSON.stringify(this.data))
},

registerAnswer(contextKey, topic, correct, time) {

if (!this.data[contextKey]) {
this.data[contextKey] = {}
}

const ctx = this.data[contextKey]

if (!ctx[topic]) {
ctx[topic] = { hits: 0, errors: 0, avgTime: 0 }
}

const t = ctx[topic]

if (correct) t.hits++
else t.errors++

t.avgTime = (t.avgTime + time) / 2

this.save()
},

getProfile(contextKey) {
return this.data[contextKey] || {}
}

}