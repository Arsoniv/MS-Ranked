
let first = false;
let intervalNumber = 0;
const button = document.getElementById("button");
const nameIn = document.getElementById("nameIn");
const passIn = document.getElementById("passIn");

async function createAccount() {

    const response = await fetch("api/createAccount", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: nameIn.value,
            password: passIn.value
        })
    })

    if (response.status === 200) alert("account created");
    if (response.status === 311) alert("Username in use, please use another name or log in.");
}

async function queue() {
    button.innerText = "loading...";
    const response = await fetch("api/queue", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: nameIn.value,
            password: passIn.value
        })
    })
    if (response.status === 201) {
        button.innerText = "Queueing...";
        intervalNumber = setInterval(queuePing, 1000);
    }
    if (response.status === 200) {
        button.innerText = "Match found!";
        first = true;
        queuePing();
    }
}


async function queuePing() {
    const response = await fetch("api/pingQueue", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: nameIn.value
        })
    })

    if (response.status === 200) {
        const data = await response.json();
        console.log(data);

        button.innerText = "Match found!";
        clearInterval(intervalNumber);

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
        location = "play/";
    }

    

}