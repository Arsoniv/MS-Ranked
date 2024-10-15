
let first = false;
let intervalNumber = 0;
const button = document.getElementById("button")
const nameIn = document.getElementById("nameIn")

async function queue() {
    button.innerText = "loading...";
    const response = await fetch("api/queue", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: nameIn.value
        })
    })
    if (response.status === 201) {
        button.innerText = "Queueing...";
        intervalNumber = setInterval(queuePing, 5000);
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