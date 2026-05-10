const users = [{"id": 1 , "username": "yew"}, {"id": 3 , "username": "har"}, {"id": 2 , "username": "hoo"}]

const userID = users.map((user, index) =>  `"${index}" : "${user.id}"`)

console.log(userID[1])


const numbers = [1,4,5]
const sum = numbers.reduce((sum, price)=> sum + price, 0)
console.log(sum)



const food = [{"name":"nasi" , "category" : "rice"}, 
    {"name":"kuey tiaw" , "category" : "noodle"}]

    const noodle = food.filter(fooditem => fooditem.category == "noodle" 
        && fooditem.name=="nasi")

    console.log(noodle)

const students = [
  { id: "APU001", name: "Yew" },
  { id: "APU002", name: "Alex" }
];

const targetstudent = students.find(student => student.id == "APU001" )
console.log(targetstudent);


for (let i =  6 ; i>0;i--){
    console.log(i)
}
console.log("blast off")


const students = [
  { id: "APU001", name: "Yew", allow:false },
  { id: "APU002", name: "Alex", allow:true}
];



students.forEach((student) => {

    if (student.allow == true)
    console.log(student.id)
})


for (let i = 0; i<students.length ; i++ ){
    console.log(students[i].id)
}

const modules = [
  { id: 1, title: "SQL Injection", difficulty: "Hard", completed: true },
  { id: 2, title: "XSS Basics", difficulty: "Easy", completed: false },
  { id: 3, title: "CSRF Attacks", difficulty: "Medium", completed: false },
  { id: 4, title: "Brute Force", difficulty: "Easy", completed: true }
];

const moduleLabels = modules.map((module) => module.title )
console.log(JSON.stringify(moduleLabels))

const moduleStatus = modules.map((module)  => {
const status = module.completed? "completed" : "pending"
return `${module.title}: ${status}`
}

)

console.log(JSON.stringify(moduleStatus))






