window.QuestionsPage = {

data: {
errors: {},
current: 0,
questionsDB: {

ENEM: {

matematica: {

algebra: [
{
question: "2 + 2 = ?",
options: ["3", "4", "5", "6"],
correct: 1,
topic: "equacao_basica",
difficulty: 1,
explanation: ""
},
{
question: "5 x 3 = ?",
options: ["15", "10", "20", "8"],
correct: 0,
topic: "multiplicacao",
difficulty: 1,
explanation: ""
}
],

geometria: [
{
question: "Área de um quadrado lado 2?",
options: ["2", "4", "6", "8"],
correct: 1,
topic: "area_quadrado",
difficulty: 1,
explanation: ""
}
],

estatistica: [
{
question: "Média de 2,4,6?",
options: ["3", "4", "5", "6"],
correct: 1,
topic: "media",
difficulty: 1,
explanation: ""
}
]

},

portugues: {

interpretacao: [
{
question: "Texto indica ideia principal?",
options: ["A", "B", "C", "D"],
correct: 0,
topic: "interpretacao_texto",
difficulty: 1,
explanation: ""
}
],

gramatica: [
{
question: "Plural de pão?",
options: ["pães", "pãos", "pãoes", "pãoses"],
correct: 0,
topic: "plural_irregular",
difficulty: 1,
explanation: ""
}
]

}

},

OAB: {

direito: {

constitucional: [
{
question: "CF foi criada em?",
options: ["1988", "1990", "2000", "1970"],
correct: 0,
topic: "constituicao_1988",
difficulty: 1,
explanation: ""
}
],

penal: [
{
question: "Princípio da legalidade significa?",
options: ["Sem lei não há crime", "Crime sem pena", "Lei retroativa", "Nenhuma"],
correct: 0,
topic: "legalidade",
difficulty: 1,
explanation: ""
}
]

}

}

} // fecha questionsDB

}, // fecha data

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
this.data.startTime = Date.now()

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

    const beforeLevel = this.getLevelData().level

const list = this.getCurrentQuestions()
const q = list[this.data.current]

const correct = index === q.correct

let xp = 0

if (correct) {
const time = Date.now() - this.data.startTime

if (time < 2000) xp = 15
else if (time < 5000) xp = 10
else xp = 5
}

document.getElementById("qFeedback").textContent =
correct ? `Correto +${xp} XP` : "Errado"

const time = Date.now() - this.data.startTime
QuestionsStore.registerAnswer(q.topic, correct, time)

const afterLevel = this.getLevelData().level

this.showFeedback(correct, q, index)

if (afterLevel > beforeLevel) {
this.showLevelUp(this.getLevelData().name)
}

},

next() {

this.data.current++

if (this.data.current >= this.getCurrentQuestions().length) {
this.data.sessionList = null
}

if (this.data.current >= this.getCurrentQuestions().length) {
this.data.current = 0
this.data.sessionList = null
}
document.getElementById("qFeedback").textContent = ""
this.render()
this.logSession()
},

showFeedback(correct, q, index) {

const container = document.getElementById("qFeedback")

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

let xp = 0

if (correct) {
const time = Date.now() - this.data.startTime

if (time < 2000) xp = 15
else if (time < 5000) xp = 10
else xp = 5
}

feedback.innerHTML = correct
? `✅ Correto +${xp} XP`
: `❌ Errado<br>Resposta correta: ${right}`

container.innerHTML = feedback.innerHTML

setTimeout(() => {
this.next()
}, 800)

},

renderDiagnosis() {


const el = document.getElementById("q-diagnosis")
const statsEl = document.getElementById("q-stats")
if (!el) return

const profile = QuestionsStore.getProfile()
const entries = Object.entries(profile)

if (!entries.length) {
el.innerHTML = ""
return
}

const ranked = entries
.map(([topic, data]) => {

const hits = data.hits || 0
const errors = data.errors || 0
const total = hits + errors

const errorRate = total ? (errors / total) : 0

return { topic, errorRate }

})
.sort((a,b) => b.errorRate - a.errorRate)
.slice(0, 3)

el.innerHTML = ranked.map(r => `
<div style="font-size:13px;opacity:0.8;">
⚠️ ${r.topic} — ${(r.errorRate * 100).toFixed(0)}% erro
</div>
`).join("")

if (!statsEl) return

const stats = entries.map(([topic, data]) => {

const hits = data.hits || 0
const errors = data.errors || 0
const total = hits + errors

const accuracy = total ? (hits / total) : 0

return { topic, accuracy }

}).sort((a,b) => b.accuracy - a.accuracy)

statsEl.innerHTML = stats.map(s => `
<div style="display:flex;justify-content:space-between;font-size:12px;opacity:0.8;">
<span>${s.topic}</span>
<span>${(s.accuracy * 100).toFixed(0)}%</span>
</div>
`).join("")

},

bindContextSwitch() {

const allBtn = document.getElementById("qAll")
const matBtn = document.getElementById("qMatematica")
const porBtn = document.getElementById("qPortugues")

const openBtn = document.getElementById("openStatsBtn")
const closeBtn = document.getElementById("closeStatsBtn")
const panel = document.getElementById("statsPanel")

// ===== STATS PANEL =====
if (openBtn && panel) {
openBtn.onclick = () => {
panel.style.display = "block"
this.renderStatsPanel()
}
}

if (closeBtn && panel) {
closeBtn.onclick = () => {
panel.style.display = "none"
}
}

// ===== FILTER =====
const ctx = QuestionsContext.get()

const updateUI = () => {

const subjects = QuestionsContext.get().subjects || []

allBtn?.classList.remove("active")
matBtn?.classList.remove("active")
porBtn?.classList.remove("active")

if (!subjects.length) {
allBtn?.classList.add("active")
return
}

if (subjects.includes("matematica")) {
matBtn?.classList.add("active")
}

if (subjects.includes("portugues")) {
porBtn?.classList.add("active")
}

}

const toggle = (value) => {

let list = ctx.subjects || []

if (list.includes(value)) {
list = list.filter(v => v !== value)
} else {
list.push(value)
}

QuestionsContext.setSubjects(list)
updateUI()
this.resetSession()
}

// ===== BUTTONS =====
if (matBtn) {
matBtn.onclick = () => toggle("matematica")
}

if (porBtn) {
porBtn.onclick = () => toggle("portugues")
}

if (allBtn) {
allBtn.onclick = () => {
QuestionsContext.setSubjects([])
updateUI()
this.resetSession()
}
}
updateUI()
},



getCurrentQuestions() {

const ctx = QuestionsContext.get()
const profile = QuestionsStore.getProfile()

const base = ctx.base
const baseData = this.data.questionsDB[base]

if (!baseData) return []

let subject

if (ctx.focus === "all") {
subject = Object.values(baseData)
} else {
subject = baseData[ctx.focus]
}

if (!subject) return []

// transforma categorias em lista única
let all

if (Array.isArray(subject)) {
all = subject.flatMap(s => Object.values(s).flat())
} else {
all = Object.values(subject).flat()
}

// se não tem histórico → aleatório
if (!Object.keys(profile).length) {

if (!this.data.sessionList) {
this.data.sessionList = this.shuffle([...all])
}

return this.data.sessionList
}

// pega pior tópico
const worst = Object.entries(profile)
.sort((a,b) => (b[1].errors || 0) - (a[1].errors || 0))[0]

const worstTopic = worst?.[0]

// filtra por tópico
const filtered = all.filter(q => q.topic === worstTopic)

// fallback se vazio ou pequeno
const finalList = filtered.length >= 3 ? filtered : all

if (!this.data.sessionList) {
this.data.sessionList = this.shuffle([...finalList])
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


const total = this.getCurrentQuestions().length
const percent = ((this.data.current + 1) / total) * 100

const fill = document.getElementById("qProgressFill")
if (fill) fill.style.width = percent + "%"

const levelData = this.getLevelData()

const temaEl = document.getElementById("qTema")

if (temaEl) {
temaEl.textContent =
`${QuestionsContext.get().focus} — ${levelData.name}`
}

},

getLevelData() {

const profile = QuestionsStore.getProfile()

const entries = Object.values(profile)

if (!entries.length) return { level: 1, name: "Recruta" }

let totalScore = 0

entries.forEach(t => {

const hits = t.hits || 0
const errors = t.errors || 0
const total = hits + errors

const accuracy = total ? (hits / total) : 0
const speed = t.avgTime ? (1 / t.avgTime) * 1000 : 0

const score = (accuracy * 0.7) + (speed * 0.3)

totalScore += score

})

const avgScore = totalScore / entries.length

// normaliza para 1–19
const level = Math.min(19, Math.max(1, Math.floor(avgScore * 20)))

const ranks = [
"Recruta",
"Soldado",
"Cabo",
"3º Sargento",
"2º Sargento",
"1º Sargento",
"Subtenente",
"Aspirante",
"2º Tenente",
"1º Tenente",
"Capitão",
"Major",
"Tenente-Coronel",
"Coronel",
"General de Brigada",
"General de Divisão",
"General de Exército",
"Marechal",
"Comando Geral"
]

return {
level,
name: ranks[level - 1]
}

},

renderStatsPanel(selectedSubject = null) {

const el = document.getElementById("statsContent")
if (!el) return

const profile = QuestionsStore.getProfile()
const entries = Object.entries(profile)

if (!entries.length) {
el.innerHTML = "Sem dados ainda"
return
}

// 🔹 MAPEAR tópicos → matérias
const ctx = QuestionsContext.get()
const baseData = this.data.questionsDB[ctx.base]

// cria mapa topic → subject
const topicToSubject = {}

Object.entries(baseData).forEach(([subject, categories]) => {
Object.values(categories).forEach(list => {
if (!Array.isArray(list)) return

list.forEach(q => {
topicToSubject[q.topic] = subject
})
})
})

// 🔹 AGRUPAR POR MATÉRIA
const subjectMap = {}

entries.forEach(([topic, data]) => {

const subject = topicToSubject[topic]
if (!subject) return

if (!subjectMap[subject]) {
subjectMap[subject] = []
}

subjectMap[subject].push({ topic, data })

})

// 🔴 SE NÃO ESCOLHEU MATÉRIA → MOSTRA MATÉRIAS
if (!selectedSubject) {

const html = Object.entries(subjectMap).map(([subject, list]) => {

let totalHits = 0
let totalErrors = 0

list.forEach(({ data }) => {
totalHits += data.hits || 0
totalErrors += data.errors || 0
})

const total = totalHits + totalErrors
const acc = total ? totalHits / total : 0

// nível da matéria
const levelData = this.getLevelData()
const level = levelData.level

return `
<div style="
margin-bottom:20px;
cursor:pointer;
display:flex;
flex-direction:column;
align-items:center;
text-align:center;
" data-subject="${subject}">
<div style="display:flex;justify-content:space-between;">
<strong>${subject}</strong>
<span>${this.getLevelData().name}</span>
</div>

<div style="
height:120px;
display:flex;
align-items:flex-end;
justify-content:center;
gap:6px;
margin-top:10px;
">
<div style="
width:30px;
border-radius:6px;
height:${acc * 100}%;
background:#5b5bf7;
"></div>
</div>

</div>
`

}).join("")

el.innerHTML = html

// bind click
el.querySelectorAll("[data-subject]").forEach(div => {
div.onclick = () => {
this.renderStatsPanel(div.dataset.subject)
}
})

return
}

// 🔴 MOSTRAR TÓPICOS DA MATÉRIA

const list = subjectMap[selectedSubject] || []

const html = list.map(({ topic, data }) => {

const hits = data.hits || 0
const errors = data.errors || 0
const total = hits + errors

const acc = total ? hits / total : 0

return `
<div style="margin-bottom:15px;">
<div>${topic}</div>

<div style="height:100px;display:flex;align-items:flex-end;">
<div style="
width:20px;
height:${acc * 100}%;
background:#22c55e;
"></div>
</div>

<div style="font-size:12px;">
${(acc * 100).toFixed(0)}%
</div>

</div>
`

}).join("")

el.innerHTML = `
<button id="backStats">← Voltar</button>
${html}
`

document.getElementById("backStats").onclick = () => {
this.renderStatsPanel()
}

},

showLevelUp(rankName) {

const el = document.createElement("div")

el.style.position = "fixed"
el.style.top = "50%"
el.style.left = "50%"
el.style.transform = "translate(-50%, -50%) scale(0.8)"
el.style.background = "#111"
el.style.color = "#fff"
el.style.padding = "30px 50px"
el.style.borderRadius = "12px"
el.style.fontSize = "24px"
el.style.zIndex = "999"
el.style.opacity = "0"
el.style.transition = "all 0.3s ease"

el.innerHTML = `⬆️ PROMOVIDO<br><strong>${rankName}</strong>`

document.body.appendChild(el)

setTimeout(() => {
el.style.opacity = "1"
el.style.transform = "translate(-50%, -50%) scale(1)"
}, 50)

setTimeout(() => {
el.style.opacity = "0"
}, 1500)

setTimeout(() => {
el.remove()
}, 2000)

},

logSession() {

const list = this.getCurrentQuestions()

console.log("TOTAL:", list.length)
console.log("ATUAL:", this.data.current)

}

};