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
const showMessage = (messages, type) => {
    console.log(messages);
    const errorClasses = ["bg-red-500/40", "border-red-600"];
    const successClasses = ["bg-green-500/40", "border-green-600"];
    const message = document.getElementById("message");
    if (type === "success") {
        successClasses.forEach((className) => {
            message.classList.add(className);
        });
        errorClasses.forEach((className) => {
            message.classList.remove(className);
        });
    } else {
        errorClasses.forEach((className) => {
            message.classList.add(className);
        });
        successClasses.forEach((className) => {
            message.classList.remove(className);
        });
    }
    message.classList.add("bottom-8");
    message.classList.remove("-bottom-full");
    const messageList = document.getElementById("message-list");
    messageList.innerHTML = "";
    console.log(messages);
    messages.forEach((message) => {
        const li = document.createElement("li");
        li.innerText = message.message;
        messageList.appendChild(li);
    });
    setTimeout(hideMessage, 5000);
};

const copyToClipboard = (text) => {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showMessage([{ message: "Copied to clipboard" }], "success");
};
