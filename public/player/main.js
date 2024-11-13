const userIn = document.getElementById("userIn");
const contentBox = document.getElementById("contentBox");

async function getPlayerInfo() {
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

    console.innerText = "";
    contentBox.innerText = data.result.username+" ["+data.result.elo+"]";
}