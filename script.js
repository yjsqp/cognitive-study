let phase = "";
let totalTrials = 0;
let currentTrial = 0;
let correct = 0;
let reactionTimes = [];
let startTime;
let currentDirection;

let baselineData = {};
let postData = {};
let recoveryData = {};

let participant = {};

function showInstructions() {
    participant = {
        age: age.value,
        gender: gender.value,
        caffeine: caffeine.value,
        sleep: sleep.value,
        screenTime: screenTime.value
    };

    formSection.classList.add("hidden");
    instructionsSection.classList.remove("hidden");
}

function startPractice() {
    phase = "practice";
    totalTrials = 5;
    startTask("Practice Round (5 Trials)");
}

function startBaseline() {
    phase = "baseline";
    totalTrials = 25;
    startTask("Baseline Test (25 Trials)");
}

function startPostTest() {
    playlistSection.classList.add("hidden");
    phase = "post";
    totalTrials = 25;
    startTask("Post-Exposure Test (25 Trials)");
}

function startRecoveryTest() {
    recoverySection.classList.add("hidden");
    phase = "recovery";
    totalTrials = 25;
    startTask("Recovery Test (25 Trials)");
}

function startTask(title) {
    instructionsSection.classList.add("hidden");
    taskSection.classList.remove("hidden");

    taskTitle.textContent = title;

    currentTrial = 0;
    correct = 0;
    reactionTimes = [];

    nextTrial();
}

function nextTrial() {
    if (currentTrial >= totalTrials) {
        endPhase();
        return;
    }

    currentTrial++;
    counter.textContent = currentTrial + " / " + totalTrials;

    // Decide middle arrow direction
    currentDirection = Math.random() > 0.5 ? "left" : "right";

    // Decide if trial is congruent or incongruent
    let congruent = Math.random() > 0.5;

    let arrows = "";

    if (congruent) {
        // All arrows same direction
        arrows = currentDirection === "left" ? "<<<<<" : ">>>>>";
    } else {
        // Middle different from sides
        if (currentDirection === "left") {
            arrows = ">><>>"; // middle is <
        } else {
            arrows = "<<><<"; // middle is >
        }
    }

    stimulus.textContent = arrows;

    startTime = Date.now();
}

    currentTrial++;
    counter.textContent = currentTrial + " / " + totalTrials;

    currentDirection = Math.random() > 0.5 ? "left" : "right";
    stimulus.textContent = currentDirection === "left" ? "←" : "→";

    startTime = Date.now();


document.addEventListener("keydown", function(event) {
    if (!["practice","baseline","post","recovery"].includes(phase)) return;

    let key = event.key.toLowerCase();
    if (key !== "f" && key !== "j") return;

    let reaction = Date.now() - startTime;
    reactionTimes.push(reaction);

    if (
        (key === "f" && currentDirection === "left") ||
        (key === "j" && currentDirection === "right")
    ) {
        correct++;
    }

    nextTrial();
});

function average(arr) {
    return arr.reduce((a,b)=>a+b,0) / arr.length;
}

function endPhase() {
    taskSection.classList.add("hidden");

    let data = {
        accuracy: correct,
        avgRT: average(reactionTimes).toFixed(2)
    };

    if (phase === "practice") {
        alert("Practice complete. Starting baseline.");
        startBaseline();
    }
    else if (phase === "baseline") {
        baselineData = data;
        playlistSection.classList.remove("hidden");
    }
    else if (phase === "post") {
        postData = data;
        startRecoveryTimer();
    }
    else if (phase === "recovery") {
        recoveryData = data;
        showResults();
    }
}

function startRecoveryTimer() {
    recoverySection.classList.remove("hidden");
    let time = 300;

    let interval = setInterval(() => {
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;
        timer.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
        time--;

        if (time < 0) {
            clearInterval(interval);
            startRecoveryTest();
        }
    }, 1000);
}

function showResults() {
    resultsSection.classList.remove("hidden");

    results.innerHTML = `
        <h3>Baseline</h3>
        Accuracy: ${baselineData.accuracy}/25<br>
        Avg RT: ${baselineData.avgRT} ms<br><br>

        <h3>Post Exposure</h3>
        Accuracy: ${postData.accuracy}/25<br>
        Avg RT: ${postData.avgRT} ms<br><br>

        <h3>Recovery</h3>
        Accuracy: ${recoveryData.accuracy}/25<br>
        Avg RT: ${recoveryData.avgRT} ms
    `;
}

function downloadResults() {
    let csv =
`Age,${participant.age}
Gender,${participant.gender}
Caffeine,${participant.caffeine}
Sleep,${participant.sleep}
ScreenTime,${participant.screenTime}

Baseline Accuracy,${baselineData.accuracy}
Baseline AvgRT,${baselineData.avgRT}

Post Accuracy,${postData.accuracy}
Post AvgRT,${postData.avgRT}

Recovery Accuracy,${recoveryData.accuracy}
Recovery AvgRT,${recoveryData.avgRT}
`;

    let blob = new Blob([csv], { type: 'text/csv' });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "experiment_results.csv";
    a.click();
}
