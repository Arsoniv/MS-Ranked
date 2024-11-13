const button = document.getElementById("button")
const userIn = document.getElementById("userIn");
const contentBox = document.getElementById("contentBox");

async function getPlayerInfo() {
    button.innerText = "Loading...";
    const response = await fetch("/api/getUserInfo", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: userIn.value
        })
    })

    const data = await response.json();

    button.innerText = "View Info";
    contentBox.innerText = data.result.username+" ["+data.result.elo+"]";
}