const API_URL = "https://quiz-backend.onrender.com/questions";

async function addQuestion() {
  const question = document.getElementById("question").value;
  const options = [
    document.getElementById("opt1").value,
    document.getElementById("opt2").value,
    document.getElementById("opt3").value,
    document.getElementById("opt4").value
  ];
  const answer = document.getElementById("answer").value;
  const msg = document.getElementById("msg");

  // Validation
  if (!question || options.includes("") || !answer) {
    msg.innerText = "Please fill all fields.";
    msg.style.color = "red";
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, options, answer })
    });

    if (!response.ok) throw new Error("Failed to add question");

    msg.innerText = "Question added successfully!";
    msg.style.color = "green";

    // Clear fields
    document.querySelectorAll("input").forEach(i => i.value = "");

  } catch (error) {
    msg.innerText = "Error adding question.";
    msg.style.color = "red";
  }
}

// const API_URL = "http://localhost:3000/questions";

// const questions = [
//   {
//     question: "What does HTML stand for?",
//     options: [
//       "Hyper Text Markup Language",
//       "High Text Machine Language",
//       "Hyperlinks and Text Markup Language",
//       "Home Tool Markup Language"
//     ],
//     answer: "Hyper Text Markup Language"
//   },
//   {
//     question: "Which CSS property is used to change text color?",
//     options: ["text-color", "color", "font-color", "background-color"],
//     answer: "color"
//   },
//   {
//     question: "Which keyword is used to declare a variable in JavaScript?",
//     options: ["var", "int", "string", "declare"],
//     answer: "var"
//   }
// ];

// async function addQuestions() {
//   for (const q of questions) {
//     await fetch(API_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(q)
//     });
//     console.log("Added:", q.question);
//   }
// }

// addQuestions();

