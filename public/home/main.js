const contentBox = document.getElementById("contentBox");
let orderedUsers = [];

let elo = 0;

setTimeout(queuePing, 800);
setInterval(getQueueCount, 5000)

const body = document.getElementById('body');

if (localStorage.getItem("loginName")) {
    login(localStorage.getItem("loginName"), localStorage.getItem("loginPassword"));
}else {
    displayLeaderBoard();
}

function logOut() {
    localStorage.removeItem("loginName");
    localStorage.removeItem("loginPassword");
    window.location.reload();
}



let first = false;
let intervalNumber = 0;
const button = document.getElementById("button");
const nameIn = document.getElementById("nameIn");
const passIn = document.getElementById("passIn");
const middleMenu = document.getElementById("middleMenu");
async function createAccount() {

    if (passIn.value.length < 8) {
        alert("Password must be at least 8 characters")
    }else {
        document.getElementById("createAccountButton").innerText = "Creating Account"
        const response = await fetch("api/createAccount", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userName: nameIn.value.trim(),
                password: passIn.value
            })
        })
        if (response.status === 200) document.getElementById("createAccountButton").innerText = "Logging In...";
        if (response.status === 200) setTimeout(login, 2000);
        if (response.status === 311) alert("Username in use (or invalid), please use another name or log in.");
    }
}

async function queue() {
    button.disabled = true;
    button.innerText = "loading...";
    const response = await fetch("api/queue", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: localStorage.getItem("loginName").trim(),
            password: localStorage.getItem("loginPassword")
        })
    })
    if (response.status === 201) {
        button.innerText = "Queueing...";
        intervalNumber = setInterval(queuePing, 1000);
        document.getElementById("leaveQueueButton").hidden = false;
    }
    if (response.status === 200) {
        button.innerText = "Match found!";
        first = true;
        intervalNumber = setInterval(queuePing, 1000);
    }
    if (response.status === 369) {
        button.innerText = "Queue Failed! (reload)";
    }
}

async function queuePing() {
    const response = await fetch("api/pingQueue", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: localStorage.getItem("loginName").trim()
        })
    })

    if (response.status === 200) {
        window.removeEventListener('beforeunload', leaveQueue);
        const data = await response.json();
        console.log(data);

        button.innerText = "Match found!";


        localStorage.setItem("mines", JSON.stringify(data.mines));
        localStorage.setItem("id", data.id);
        localStorage.setItem("firstMine", JSON.stringify(data.firstMine));

        if (first) {
            localStorage.setItem("userName", data.opponent);
            localStorage.setItem("opponent", data.you);
        }else {
            localStorage.setItem("userName", data.you);
            localStorage.setItem("opponent", data.opponent);
        }


        setTimeout(changeLocation, 1000)
    }

    function changeLocation() {
        window.location.assign("play/");
    }
}

async function leaveQueue() {
    const response = await fetch("/api/leaveQueue", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: localStorage.getItem("loginName").trim()
        })
    })
    window.location.reload();
}


window.addEventListener('beforeunload', function (event) {
    leaveQueue();
})

async function login(userName = nameIn.value.trim(), password = passIn.value) {
    const response102 = await fetch("api/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: userName,
            password: password
        })
    })

    const data = await response102.json();

    console.log(data);

    if (response102.status === 200) {
        button.disabled = false;
        button.hidden = false;
        middleMenu.innerHTML = '';

        elo = data.result.elo;

        const h2 = document.createElement("h2");
        h2.innerText = data.result.username +"\n"+data.result.elo+" elo";

        h2.style.fontFamily = "Arial, Helvetica, sans-serif";

        middleMenu.appendChild(h2);

        localStorage.setItem("loginName", data.result.username);
        localStorage.setItem("loginPassword", data.result.password);

        document.getElementById("signOutButton").hidden = false;
        displayLeaderBoard();
        getPlayerMatches(userName);
    }else {
        if (data["alert"] === 1) {
            alert(data["result"]);
        }
    }
}

async function displayLeaderBoard() {
    const leaderBoard = document.getElementById("leaderBoard")

    leaderBoard.innerHTML = "";

    const response102 = await fetch("api/getAllPlayers", {
        method: 'GET'
    })

    const data2 = await response102.json();

    const data = data2.result;

    data.sort((a, b) => b.elo - a.elo);
    data.slice(0, 10)

    console.log(data);

    let i = 1;

    orderedUsers = data;

    data.forEach((user) => {
        if (i <= 10) {
            const div = document.createElement("div");

            div.classList.add("themeBasic");

            if (i === 1) {
                div.style.borderColor = "#ffc94a";
            }
            if (i === 2) {
                div.style.borderColor = "#b8b8b8";
            }
            if (i === 3) {
                div.style.borderColor = "#ff954a";
            }
            if (i <= 3) {
                div.style.borderWidth = "3px";
            }

            if (user.username === localStorage.getItem("loginName") && localStorage.getItem("loginName") != null) {
                div.style.borderStyle = "double";
                div.style.borderWidth = "3px";
                if (i <= 3) {
                    div.style.borderWidth = "6px";
                }
            }

            div.innerText = i+" • "+user.username+" ["+user.elo+"]";

            leaderBoard.appendChild(div);
        }

        i++;
    })
}

async function getQueueCount() {
    const response = await fetch("/api/getPlayersInQueue", {
        method: 'GET'
    })

    const data2 = await response.json();

    const data = data2.result;

    if (data.length === 1) {
        document.getElementById("queueCount").innerText = "1 player in queue";
    } else {
        document.getElementById("queueCount").innerText = data.length + " players in queue";
    }
}

function showPlayerInfo(i, user) {
    const div = document.createElement("div");

    div.classList.add("themeBasic");

    if (i === 1) {
        div.style.borderColor = "#ffc94a";
    }
    if (i === 2) {
        div.style.borderColor = "#b8b8b8";
    }
    if (i === 3) {
        div.style.borderColor = "#ff954a";
    }
    if (i <= 3) {
        div.style.borderWidth = "3px";
    }

    if (user.username === localStorage.getItem("loginName") && localStorage.getItem("loginName") != null) {
        div.style.borderStyle = "double";
        div.style.borderWidth = "3px";
        if (i <= 3) {
            div.style.borderWidth = "6px";
        }
    }

    div.innerText = i + " • " + user.username + " [" + user.elo + "]";

    contentBox.appendChild(div);
}

function getPlayerInfo() {
    const userIn = document.getElementById("userIn");

    console.log(orderedUsers);

    if (orderedUsers.some(user => user.username.toLowerCase() === userIn.value.toLowerCase())) {
        const index = orderedUsers.findIndex(user => user.username.toLowerCase() === userIn.value.toLowerCase());
        showPlayerInfo(index + 1, orderedUsers[index]);
    }
}

function clearPlayerInfo() {
    contentBox.innerHTML = "";
}


async function getPlayerMatches(userNameIn) {
    const response = await fetch("api/getUserMatches", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: userNameIn
        })
    })

    const data2 = await response.json();
    let data = data2.response;

    data.sort((a, b) => b.id - a.id);
    data = data.slice(0, 10);

    const matchDiv = document.getElementById("matchDiv");

    data.forEach((match) => {

        const div = document.createElement("div");

        div.classList.add("themeBasic");

        if (match.winner.toLowerCase() === userNameIn.toLowerCase()) {
            div.style.borderColor = "green";
        } else {
            div.style.borderColor = "red";
        }

        div.innerText = " " + match.playerone + " vs " + match.playertwo;

        matchDiv.appendChild(div);
    })

}