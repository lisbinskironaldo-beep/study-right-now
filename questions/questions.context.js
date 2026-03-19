const QuestionsContext = {

key: "questions_context_v1",

data: {
base: "ENEM",
focus: "matematica"
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

get() {
return this.data
}

}