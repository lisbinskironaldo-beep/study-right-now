const QuestionsContext = {

key: "questions_context_v1",

data: {
base: "ENEM",
focus: "matematica",
subjects: [],
topics: []
},

load() {
const saved = localStorage.getItem(this.key)
if (saved) this.data = JSON.parse(saved)
},

save() {
localStorage.setItem(this.key, JSON.stringify(this.data))
},

setBase(base) {
this.data.base = base
this.save()
},

setFocus(focus) {
this.data.focus = focus
this.save()
},

setSubjects(list) {
this.data.subjects = list
this.save()
},

setTopics(list) {
this.data.topics = list
this.save()
},

get() {
return this.data
}

}