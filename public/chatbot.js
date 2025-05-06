let recognition;
let finalTranscript = '';
let chatHistory = [];

const predefinedQA = {
  "bijli": "Bijli ke adhik bill ka karan adhik upyog ya galti ho sakti hai.",
  "bill": "Bijli ke adhik bill ka karan adhik upyog ya galti ho sakti hai.",
  "road": "Sadak nirmaan me karcha sarkari tender ke anusar hota hai.",
  "karcha": "Sadak nirmaan me karcha sarkari tender ke anusar hota hai.",
  "ration": "Ration card sambandhi jankari aapke rajya ki sarkari website par uplabdh hai.",
  "pension": "Pension ke liye aapko sarkari yojna ke tahat form bharna hota hai.",
  "pani": "Pani ki samasya ke liye nagar nigam me shikayat darj karein.",
  "sadak": "Sadak nirmaan me karcha sarkari tender ke anusar hota hai."
};

function toggleChat() {
  const box = document.getElementById("chatbox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

function startVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Voice recognition not supported");
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.lang = "hi-IN";
  recognition.interimResults = false;

  recognition.onresult = function(event) {
    finalTranscript = event.results[0][0].transcript;
    document.getElementById("userInput").value = finalTranscript;
    sendMessage();
  };
  recognition.start();
}

function speak(text) {
  const msg = new SpeechSynthesisUtterance();
  msg.text = text;
  msg.lang = 'hi-IN';
  window.speechSynthesis.speak(msg);
}

function sendMessage() {
  const input = document.getElementById("userInput").value.toLowerCase();
  if (!input) return;

  chatHistory.push({ question: input });

  const messages = document.getElementById("messages");
  messages.innerHTML += <div><strong>आप:</strong> ${input}</div>;

  let answer = "Maaf kijiye, mujhe aapka prashn samajh nahi aaya";

  // Keyword-based partial match
  for (const key in predefinedQA) {
    if (input.includes(key)) {
      answer = predefinedQA[key];
      break;
    }
  }

  chatHistory[chatHistory.length - 1].answer = answer;
  messages.innerHTML += <div><strong>Bot:</strong> ${answer}</div>;

  speak(answer);
  document.getElementById("userInput").value = "";

  if (chatHistory.length >= 3) {
    document.getElementById("submitSection").style.display = "block";
  }
}
function downloadRTIPDF() {
    const text = chatHistory.map((qna, i) =>
      `${i + 1}. प्रश्न: ${qna.question}\nउत्तर: ${qna.answer}\n`
    ).join("\n");
  
    const blob = new Blob([`RTI Application\n\n${text}`], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "RTI-Application.txt";
    link.click();
  }
  