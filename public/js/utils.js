const deleteElection = async (electionId, csrf) => {
    const conf = confirm("Are you sure you want to delete this election?");
    if (!conf) {
        return;
    }
    fetch(`/elections/${electionId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            _csrf: csrf,
        }),
    }).then((res) => {
        if (res.status == 200) {
            location.reload();
        }
    });
};
const hideMessage = () => {
    const message = document.getElementById("message");
    message.classList.remove("bottom-8");
    message.classList.add("-bottom-full");
};
const handleMessages = (messages) => {
    const message = document.getElementById("message");
    message.classList.add("bottom-8");
    message.classList.remove("-bottom-full");
    const messageList = document.getElementById("message-list");
    messageList.innerHTML = "";
    console.log(messages);
    messages.errors.forEach((message) => {
        const li = document.createElement("li");
        li.innerText = message.message;
        messageList.appendChild(li);
    });
    setTimeout(hideMessage, 5000);
};
