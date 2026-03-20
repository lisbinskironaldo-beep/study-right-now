const QuestionsStore = {

key: "questions_profile_v1",

data: {
topics: {}
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

registerAnswer(topic, correct, time) {

if (!this.data.topics[topic]) {
this.data.topics[topic] = {
hits: 0,
errors: 0,
lastSeen: Date.now(),
avgTime: 0
}
}

const t = this.data.topics[topic]

if (correct) t.hits++
else t.errors++

t.lastSeen = Date.now()

t.avgTime = ((t.avgTime || 0) + time) / 2

this.save()

},

getProfile() {
return this.data.topics
}

}