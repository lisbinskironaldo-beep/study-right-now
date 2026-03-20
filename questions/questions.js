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

const btn = document.getElementById("startTrainingBtn")

if (btn) {
btn.onclick = () => {
this.data.current = 0
this.data.sessionList = null
this.render()
}
}

},

render() {

const list = this.getCurrentQuestions()
console.log("LIST:", list)


if (!list.length) {
document.getElementById("questionsContainer").innerHTML = "Sem questões"
return
}

const q = this.getCurrentQuestion()
if (!q) return
document.getElementById("qPergunta").textContent = q.question

const opcoesEl = document.getElementById("qOpcoes")

opcoesEl.innerHTML = q.options.map((opt,i)=>`
<button class="q-option" data-i="${i}">
${opt}
</button>
`).join("")

this.updateHeader()
console.log("Q:", q)

const btn = document.getElementById("startTrainingBtn")

if (btn) {
btn.onclick = () => {

this.data.current = 0
this.data.sessionList = null

this.render()

}
}

this.bind()
this.renderDiagnosis()
this.bindContextSwitch()

document.getElementById("qFeedback").textContent = ""

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

document.getElementById("qFeedback").textContent =
correct ? "Correto" : "Errado"

QuestionsStore.registerAnswer(q.topic, correct)

this.showFeedback(correct, q, index)

},

next() {

this.data.current++

if (this.data.current >= this.getCurrentQuestions().length) {
alert("Fim")
this.data.current = 0
}
document.getElementById("qFeedback").textContent = ""
this.render()
this.logSession()
},

showFeedback(correct, q, index) {

const container = document.querySelector(".q-box")

const buttons = document.querySelectorAll(".q-option")

buttons.forEach((btn, i) => {

btn.disabled = true

if (i === q.correct) {
btn.style.background = "#16a34a"
}

if (i === index && i !== q.correct) {
btn.style.background = "#dc2626"
}

})

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
}, 800)

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
this.resetSession()
}
}

if (focusEl) {
focusEl.onclick = () => {
const v = prompt("Foco (matematica, portugues...)")
if (!v) return
QuestionsContext.setFocus(v)
this.resetSession()
}
}

},

getCurrentQuestions() {

const ctx = QuestionsContext.get()
const profile = QuestionsStore.getProfile()

const base = ctx.base
const baseData = this.data.questionsDB[base]

if (!baseData) return []

// se não tem erros ainda → usa foco atual
if (!Object.keys(profile).length) {
const list = baseData[ctx.focus] || []
if (!this.data.sessionList) {
this.data.sessionList = this.shuffle([...list])
}

return this.data.sessionList
}

// encontra pior tópico
const worst = Object.entries(profile)
.sort((a,b) => (b[1].errors || 0) - (a[1].errors || 0))[0]

const worstTopic = worst[0]

// tenta achar lista que contenha esse tópico
const allSubjects = Object.values(baseData).flat()

const filtered = allSubjects.filter(q => q.topic === worstTopic)

if (filtered.length) {

if (!this.data.sessionList) {
this.data.sessionList = this.shuffle(filtered)
}

return this.data.sessionList
}

// fallback
const list = baseData[ctx.focus] || []

if (!this.data.sessionList) {
this.data.sessionList = this.shuffle([...list])
}

return this.data.sessionList
},

getCurrentQuestion() {

const list = this.getCurrentQuestions()

if (!list.length) return null

return list[this.data.current]

},

resetSession() {

this.data.current = 0
this.data.sessionList = null

this.render()

},

shuffle(array) {

const arr = [...array]

for (let i = arr.length - 1; i > 0; i--) {

let j = Math.floor(Math.random() * (i + 1))

let temp = arr[i]
arr[i] = arr[j]
arr[j] = temp

}

return arr

},

updateHeader() {

const ctx = QuestionsContext.get()

document.getElementById("qTema").textContent =
ctx.focus

document.getElementById("qProgress").textContent =
`${this.data.current + 1}/${this.getCurrentQuestions().length}`

},

logSession() {

const list = this.getCurrentQuestions()

console.log("TOTAL:", list.length)
console.log("ATUAL:", this.data.current)

}

}