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

registerAnswer(topic, correct) {

if (!this.data.topics[topic]) {
this.data.topics[topic] = {
hits: 0,
errors: 0
}
}

if (correct) {
this.data.topics[topic].hits++
} else {
this.data.topics[topic].errors++
}

this.save()

},

getProfile() {
return this.data.topics
}

}