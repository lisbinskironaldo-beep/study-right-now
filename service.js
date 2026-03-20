const QuestionsService = {

async generateQuestions(params) {

return [
{
question: "2 + 2 = ?",
options: ["3","4","5","6"],
correct: 1,
topic: "basico"
},
{
question: "5 x 3 = ?",
options: ["15","10","20","8"],
correct: 0,
topic: "multiplicacao"
}
]

}

}