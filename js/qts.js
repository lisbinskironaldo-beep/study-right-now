const QTS = {

    maxTotalRows: 20,
    maxIntervals: 5,

    data: JSON.parse(localStorage.getItem("qts_core_v6")) || {
        showTimeColumn: false,
        showSunday: true,
        showSaturday: true,

        structure: Array.from({ length: 6 }, () => ({ type: "row" })),
        grid: {}
    },

    days: [
        "Domingo","Segunda","Terça",
        "Quarta","Quinta","Sexta","Sábado"
    ],

    init() {
        this.normalize();
        this.render();

    },

    normalize() {

        if (!Array.isArray(this.data.structure))
            this.data.structure = [];

        if (this.data.structure.length === 0)
            this.data.structure =
                Array.from({ length: 6 }, () => ({ type: "row" }));

        if (this.data.structure.length > this.maxTotalRows)
            this.data.structure =
                this.data.structure.slice(0, this.maxTotalRows);

        this.save();
    },

    render() {

        const container =
            document.getElementById("qtsModule");

        container.innerHTML = `
            <h2 style="text-align:center;margin-bottom:20px;">
                Quadro Horário
            </h2>

            <div class="qts-templates">
    <button data-template="estudo">Estudo</button>
    <button data-template="work">Trabalho</button>
    <button data-template="gym">Treino</button>
    <button data-template="clean">Limpo</button>
</div>

            <div style="text-align:center;margin-bottom:15px;">
                <label>
                    <input type="checkbox" id="toggleTimeCol"
                    ${this.data.showTimeColumn ? "checked":""}>
                    HORÁRIO
                </label>
                <label style="margin-left:10px;">
                    <input type="checkbox" id="toggleSunday"
                     ${this.data.showSunday ? "checked":""}>
                    Domingo
                </label>

                <label style="margin-left:10px;">
                    <input type="checkbox" id="toggleSaturday"
                    ${this.data.showSaturday ? "checked":""}>
                    Sábado
                </label>
            </div>

            <div id="qtsGrid"></div>

            <div class="qts-controls">
                <div class="row-control">
                    <button id="removeRowBtn" class="row-btn left">−</button>
                    <div class="row-label">Linhas</div>
                    <button id="addRowBtn" class="row-btn right">+</button>
                <div class="row-control">
    <button id="removeIntervalBtn" class="row-btn left">−</button>
    <div class="row-label">Intervalos</div>
    <button id="addIntervalBtn" class="row-btn right">+</button>
</div>
        `;

        this.bindControls();
        this.buildGrid();

        // templates (sempre rebind após render)
document.querySelectorAll(".qts-templates button")
.forEach(btn => {

btn.onclick = () => {

const type = btn.dataset.template
this.applyTemplate(type)

}

})
    },

    bindControls() {

        const printBtn = document.getElementById("printQtsBtn");

if (printBtn) {
    printBtn.onclick = () => {

        const printContent =
            document.getElementById("qtsGrid").outerHTML;
            

        const win = window.open("", "", "width=900,height=700");
document.querySelectorAll("#qtsModule h2").forEach((el,i)=>{
if(i>0) el.remove()
})
        win.document.write(`
            <html>
            <head>
                <title>Quadro Horário</title>
                <style>


body {
font-family: Inter, sans-serif;
padding: 20px;
background: white;
color: #111;
zoom: 0.9;
}

/* TÍTULO */
h2{
text-align: center;
font-size: 380% !important;
font-weight: 700;
margin-bottom: 20px;
}

/* GRID */
#qtsGrid {
display: grid;
gap: 4px;
width: 100%;
table-layout: fixed;
}

/* CÉLULAS BASE */
#qtsGrid > div {
font-size: 30px;
line-height: 1.1;
border-radius: 4px;
padding: 4px 6px;
text-align: center;
min-height: 32px;
height: auto;
display:flex;
align-items:center;
justify-content:center;
white-space: normal;
word-break: normal;
overflow-wrap: break-word;
border: 1px solid #bbb;
}

/* HEADER */
.qts-header{
font-size: 15px;
background: #e9eef5;
font-weight: 700;
}

/* HORÁRIO */
.qts-time{
font-size: 28px;
background: #f2f6ff;
font-weight: 600;
}

/* INTERVALO */
.qts-interval{
background: #949393;
font-style: italic;
font-size: 28px;
height: 22px; /* menor que as outras */
}

/* DESTAQUE */
.qts-now{
background: #dbeaff !important;
outline: 1px solid #0078ff;
}

/* LIMPEZA */
*{
box-shadow:none !important;
backdrop-filter:none !important;
}

</style>
            </head>
            <body>
                <h2>Quadro Horário</h2>
                ${printContent}
            </body>
            </html>
        `);

        win.document.close();
        win.focus();
        win.print();
    };
}

        document.getElementById("toggleTimeCol").onchange = (e) => {
            this.data.showTimeColumn = e.target.checked;
            this.save();
            this.render();
        };

        const sunday = document.getElementById("toggleSunday")

if(sunday){
sunday.onchange = (e) => {
this.data.showSunday = e.target.checked
this.save()
this.render()
}
}

const saturday = document.getElementById("toggleSaturday")

if(saturday){
saturday.onchange = (e) => {
this.data.showSaturday = e.target.checked
this.save()
this.render()
}
}

        document.getElementById("addRowBtn").onclick = () => {

            if (this.data.structure.length >= this.maxTotalRows)
                return;

            this.data.structure.push({ type: "row" });
            this.save();
            this.render();
        };

        document.getElementById("removeRowBtn").onclick = () => {

            const lastRowIndex =
                [...this.data.structure]
                    .map((x,i)=>x.type==="row"?i:null)
                    .filter(x=>x!==null)
                    .pop();

            if (lastRowIndex === undefined) return;

            this.data.structure.splice(lastRowIndex,1);

            this.save();
            this.render();
        };

        // ADICIONAR INTERVALO
document.getElementById("addIntervalBtn").onclick = () => {

    const totalIntervals =
        this.data.structure
            .filter(x=>x.type==="interval")
            .length;

    if (totalIntervals >= this.maxIntervals)
        return;

    if (this.data.structure.length >= this.maxTotalRows)
        return;

    this.data.structure.push({ type:"interval" });

    this.save();
    this.render();
};

// REMOVER INTERVALO
document.getElementById("removeIntervalBtn").onclick = () => {

    const lastIntervalIndex =
        [...this.data.structure]
            .map((x,i)=>x.type==="interval"?i:null)
            .filter(x=>x!==null)
            .pop();

    if (lastIntervalIndex === undefined) return;

    this.data.structure.splice(lastIntervalIndex,1);

    this.save();
    this.render();
};
    },

    buildGrid() {

        const grid =
            document.getElementById("qtsGrid");

        grid.innerHTML = "";

        document.querySelectorAll(".qts-now").forEach(el=>el.classList.remove("qts-now"));

        const visibleDays = this.days.filter((d, i) => {

if(i === 0 && !this.data.showSunday) return false
if(i === 6 && !this.data.showSaturday) return false

return true

})

const columns =
    (this.data.showTimeColumn ? 1 : 0)
    + visibleDays.length;

        grid.style.display = "grid";
        grid.style.gridTemplateColumns =
            `repeat(${columns}, 1fr)`;

        if (this.data.showTimeColumn)
            grid.appendChild(this.createHeader("HORÁRIO"));


visibleDays.forEach(d =>
    grid.appendChild(this.createHeader(d))
);

        this.data.structure.forEach((item, index) => {

            if (item.type === "interval") {
                grid.appendChild(
                    this.createIntervalRow(columns, index)
                );
                return;
            }

            const rowIndex = index;

            if (this.data.showTimeColumn)
                grid.appendChild(
                    this.createTimeCell(rowIndex)
                );

visibleDays.forEach((day, colIndex) =>
    grid.appendChild(
        this.createEditableCell(rowIndex, day, colIndex)
    )
);
        });

        this.highlightCurrentTime();
    },

    createHeader(text) {
        const cell = document.createElement("div");
        cell.textContent = text;
        cell.classList.add("qts-header");
        return cell;
    },

    createIntervalRow(columns, index) {

        const cell = document.createElement("div");
        cell.contentEditable = true;
        cell.tabIndex = 0;
cell.dataset.row = index;
cell.dataset.col = -1;

        const value = this.data.structure[index].duration || "Intervalo";

cell.innerHTML = `<span class="qts-interval-label">${value}</span>`;

cell.addEventListener("click",(e)=>{

// se foi arraste, ignora clique
if(cell._dragging) return

e.stopPropagation()

this.openIntervalPicker(cell, index)

})

        cell.style.gridColumn = `span ${columns}`;
        cell.classList.add("qts-interval");

        cell.onblur = () => {
    this.data.structure[index].duration = cell.textContent;
    this.save();
};


cell.addEventListener("keydown",(e)=>{

const r = parseInt(cell.dataset.row)

// BAIXO → vai pra próxima linha válida
if(e.key==="ArrowDown"){
e.preventDefault()

let next = document.querySelector(
`#qtsGrid div[data-row="${r+1}"][data-col="0"]`
)

if(next) next.focus()
}

// CIMA → mesma lógica
if(e.key==="ArrowUp"){
e.preventDefault()

let prev = document.querySelector(
`#qtsGrid div[data-row="${r-1}"][data-col="0"]`
)

if(prev) prev.focus()
}

e.stopPropagation()

})
        return cell;
    },

    createTimeCell(row) {

        const cell =
            document.createElement("div");
            cell.addEventListener("focus", () => {
                cell._leftOnce = false

const range = document.createRange()
range.selectNodeContents(cell)
range.collapse(false)

const sel = window.getSelection()
sel.removeAllRanges()
sel.addRange(range)

})

        cell.contentEditable = true;
        cell.dataset.row = row;
cell.dataset.col = -1;
        cell.tabIndex = 0;

cell.addEventListener("keydown",(e)=>{

if(e.key==="Enter" && !e.shiftKey){
e.preventDefault()
cell.blur()
return
}

// DIREITA (vai para primeira célula da linha)
if(e.key==="ArrowRight"){
e.preventDefault()

const next = document.querySelector(
`#qtsGrid div[data-row="${row}"][data-col]:not([data-col="-1"])`
)

if(next){
next.focus()
return
}
}

if(e.key==="ArrowLeft"){

const sel = window.getSelection()

if(sel && sel.rangeCount > 0){

const range = sel.getRangeAt(0)

// se NÃO está no começo → não sai
if(range.startOffset !== 0){
return
}

}

e.preventDefault()

// pega a última célula válida da linha
const cells = document.querySelectorAll(
`#qtsGrid div[data-row="${row}"][data-col]:not([data-col="-1"])`
)

if(cells.length > 0){
cells[cells.length - 1].focus()
}
}

// BAIXO (mantém coluna horário)
if(e.key==="ArrowDown"){
e.preventDefault()

let r = row + 1
let next = null

while(!next){

if(r > 50) break

next = document.querySelector(
`#qtsGrid .qts-time[data-row="${r}"]`
)

// se não achou horário, tenta célula normal
if(!next){
next = document.querySelector(
`#qtsGrid div[data-row="${r}"][data-col="0"]`
)
}

r++
}

if(next) next.focus()
}

// CIMA
if(e.key==="ArrowUp"){
e.preventDefault()

let r = row - 1
let prev = null

while(!prev){

if(r < 0) break

prev = document.querySelector(
`#qtsGrid .qts-time[data-row="${r}"]`
)

if(!prev){
prev = document.querySelector(
`#qtsGrid div[data-row="${r}"][data-col="0"]`
)
}

r--
}

if(prev) prev.focus()
}

e.stopPropagation()

})
        cell.classList.add("qts-time");

        if (this.data.grid[row]?._time)
            cell.textContent =
                this.data.grid[row]._time;

        cell.onblur = () => {

this.data.grid[row] =
this.data.grid[row] || {};

this.data.grid[row]._time =
cell.textContent;

const text = cell.textContent.trim()

if(text){

let h = 0
let m = 0

if(text.includes(":")){
const parts = text.replace("h",":").split(":")
h = parseInt(parts[0])
m = parseInt(parts[1]) || 0
}else{
h = parseInt(text)
m = 0
}

if(!isNaN(h)){

// NORMALIZA A CÉLULA ATUAL
const formatted =
`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`

cell.textContent = formatted

this.data.grid[row]._time = formatted

// AUTO GERAR PRÓXIMO
const nextMinutes = (h * 60 + m) + 60

const nh = Math.floor(nextMinutes / 60)
const nm = nextMinutes % 60

const nextRow = row + 1

if(!this.data.grid[nextRow]){
this.data.grid[nextRow] = {}
}

if(!this.data.grid[nextRow]._time){

const nextFormatted =
`${String(nh).padStart(2,"0")}:${String(nm).padStart(2,"0")}`

this.data.grid[nextRow]._time = nextFormatted

const nextCell = document.querySelector(
`#qtsGrid .qts-time[data-row="${nextRow}"]`
)

if(nextCell){
nextCell.textContent = nextFormatted
}

}

}
}

this.save()

};

        return cell;
    },

    createEditableCell(row, day, colIndex) {

        const cell =
            document.createElement("div");

            cell.addEventListener("focus", () => {
                cell._leftOnce = false

const range = document.createRange()
range.selectNodeContents(cell)
range.collapse(false)

const sel = window.getSelection()
sel.removeAllRanges()
sel.addRange(range)

})

        cell.contentEditable = true;
        
cell.dataset.navIndex = 
document.querySelectorAll('#qtsGrid div[contenteditable="true"]').length;
cell.tabIndex = 0;
cell.dataset.row = row;
cell.dataset.col = colIndex;

cell.addEventListener("keydown",(e)=>{

// ENTER = salva (blur)
if(e.key==="Enter" && !e.shiftKey){
e.preventDefault()
cell.blur()
return
}

// SHIFT+ENTER = quebra de linha
if(e.key==="Enter" && e.shiftKey){
return
}

const sel = window.getSelection()

let atStart = false
let atEnd = false

if(sel && sel.rangeCount > 0){

const range = sel.getRangeAt(0)

// força leitura correta independente de nodes
const pre = range.cloneRange()
pre.selectNodeContents(cell)
pre.setEnd(range.startContainer, range.startOffset)

atStart = pre.toString().length === 0

const post = range.cloneRange()
post.selectNodeContents(cell)
post.setStart(range.endContainer, range.endOffset)

atEnd = post.toString().length === 0
}

const r = parseInt(cell.dataset.row)
const c = parseInt(cell.dataset.col)

// DIREITA
if(e.key==="ArrowRight"){
if(!atEnd) return
e.preventDefault()
this.navigateCell(r, c, "right")
}

// ESQUERDA
if(e.key==="ArrowLeft"){
if(!atStart) return
e.preventDefault()
this.navigateCell(r, c, "left")
}

// BAIXO
if(e.key==="ArrowDown"){
e.preventDefault()
this.navigateCell(r, c, "down")
}

// CIMA
if(e.key==="ArrowUp"){
e.preventDefault()
this.navigateCell(r, c, "up")
}
})

        if (this.data.grid[row]?.[day])
            cell.textContent =
                this.data.grid[row][day];

        cell.onblur = () => {
            this.data.grid[row] =
                this.data.grid[row] || {};
            this.data.grid[row][day] =
                cell.textContent;
            this.save();
        };

        return cell;
    },
    
   highlightCurrentTime(){

if(!this.data.showTimeColumn) return

const times = document.querySelectorAll(".qts-time")
if(!times.length) return

document.querySelectorAll(".qts-now").forEach(el=>el.classList.remove("qts-now"));

const now = new Date()
const currentMinutes = now.getHours()*60 + now.getMinutes()

times.forEach((cell)=>{

const text = cell.textContent.trim()
if(!text) return

const parts = text.replace("h",":").split(":")
const h = parseInt(parts[0])
const m = parseInt(parts[1]) || 0

if(isNaN(h)) return

const minutes = h*60 + m

if(currentMinutes >= minutes){

let el = cell

while(el && !el.classList.contains("qts-header")){

el.classList.add("qts-now")
el = el.nextElementSibling

}

}

})

setTimeout(()=>this.highlightCurrentTime(), 60000);

},

applyTemplate(type){

if(type === "clean"){

this.data.structure =
Array.from({ length: 6 }, () => ({ type: "row" }))

this.data.grid = {}

this.save()
this.render()

return
}

if(type === "estudo"){

this.data.structure = [
{ type:"row" },
{ type:"row" },
{ type:"row" },
{ type:"interval", duration:"Intervalo 20min" },
{ type:"row" },
{ type:"row" }
]

this.data.grid = {
0:{ _time:"07:00" },
1:{ _time:"08:00" },
2:{ _time:"09:00" },
4:{ _time:"10:20" },
5:{ _time:"11:20" }
}

this.save()
this.render()

return
}

console.log("template:", type)

},

    save() {
        localStorage.setItem(
            "qts_core_v6",
            JSON.stringify(this.data)
        );
    },

navigateCell(row, col, direction){

let r = row
let c = col

while(true){

if(direction === "down") r++
if(direction === "up") r--
if(direction === "right") c++
if(direction === "left") c--

if(r < 0 || r > 50) return

let target = document.querySelector(
`#qtsGrid div[data-row="${r}"][data-col="${c}"]`
)

if(target){
target.focus()
return
}

const interval = document.querySelector(
`#qtsGrid div.qts-interval[data-row="${r}"]`
)

if(interval){
continue
}

}
}
    
};

document.addEventListener("DOMContentLoaded", () => {
    QTS.init();
});