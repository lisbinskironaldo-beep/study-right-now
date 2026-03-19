window.QuestionsPage = {

data: {
errors: {},
current: 0,
questionsDB: {

ENEM: {
matematica: [
{
question: "2 + 2 = ?",
options: ["3", "4", "5", "6"],
correct: 1,
topic: "basico"
},
{
question: "5 x 3 = ?",
options: ["15", "10", "20", "8"],
correct: 0,
topic: "multiplicacao"
}
],
portugues: [
{
question: "Plural de pão?",
options: ["pães", "pãos", "pãoes", "pãoses"],
correct: 0,
topic: "gramatica"
}
]
},

OAB: {
direito: [
{
question: "CF foi criada em?",
options: ["1988", "1990", "2000", "1970"],
correct: 0,
topic: "constitucional"
}
]
}

}
},

init() {
QuestionsStore.load()
this.render()
},

render() {

const list = this.getCurrentQuestions()

if (!list.length) {
document.getElementById("questionsContainer").innerHTML = "Sem questões"
return
}

const q = list[this.data.current]

const container = document.getElementById("questionsContainer")

container.innerHTML = `
<div class="q-box">

<div class="q-header">

<div style="margin-bottom:6px;">

<span id="q-base" style="cursor:pointer;">
${QuestionsContext.get().base}
</span>

•

<span id="q-focus" style="cursor:pointer;">
${QuestionsContext.get().focus}
</span>

</div>

Questão ${this.data.current + 1}/${this.getCurrentQuestions().length}

</div>

<div class="q-question">
${q.question}
</div>

<div class="q-options">
${q.options.map((opt,i)=>`
<button class="q-option" data-i="${i}">
${opt}
</button>
`).join("")}
</div>

<div id="q-diagnosis" class="q-diagnosis"></div>

</div>
`

this.bind()
this.renderDiagnosis()
this.bindContextSwitch()

},

bind() {

document.querySelectorAll(".q-option").forEach(btn => {

btn.onclick = () => {

const index = Number(btn.dataset.i)
this.answer(index)

}

})

},

answer(index) {

const list = this.getCurrentQuestions()
const q = list[this.data.current]

const correct = index === q.correct

QuestionsStore.registerAnswer(q.topic, correct)

this.showFeedback(correct, q, index)

},

next() {

this.data.current++

if (this.data.current >= this.getCurrentQuestions().length) {
alert("Fim")
this.data.current = 0
}

this.render()
},

showFeedback(correct, q, index) {

const container = document.querySelector(".q-box")

const selected = q.options[index]
const right = q.options[q.correct]

const feedback = document.createElement("div")
feedback.className = "q-feedback"

feedback.innerHTML = correct
? `✅ Correto`
: `❌ Errado<br>Resposta correta: ${right}`

container.appendChild(feedback)

setTimeout(() => {
this.next()
}, 1500)

},

renderDiagnosis() {

const el = document.getElementById("q-diagnosis")
if (!el) return

const profile = QuestionsStore.getProfile()

const entries = Object.entries(profile)

if (!entries.length) {
el.innerHTML = ""
return
}

const worst = entries.sort((a,b) => {
return (b[1].errors || 0) - (a[1].errors || 0)
})[0]

if (!worst) return

el.innerHTML = `
<div style="margin-top:20px;font-size:14px;opacity:0.7;">
⚠️ Foco recomendado: ${worst[0]}
</div>
`

},

bindContextSwitch() {

const baseEl = document.getElementById("q-base")
const focusEl = document.getElementById("q-focus")

if (baseEl) {
baseEl.onclick = () => {
const v = prompt("Base (ENEM, OAB, PM...)")
if (!v) return
QuestionsContext.setBase(v)
this.data.current = 0
this.render()
}
}

if (focusEl) {
focusEl.onclick = () => {
const v = prompt("Foco (matematica, portugues...)")
if (!v) return
QuestionsContext.setFocus(v)
this.data.current = 0
this.render()
}
}

},

getCurrentQuestions() {

const ctx = QuestionsContext.get()

const base = ctx.base
const focus = ctx.focus

const baseData = this.data.questionsDB[base]

if (!baseData) return []

const list = baseData[focus]

if (!list) return []

return list

}

}