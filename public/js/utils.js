const deleteElection = async (electionId, csrf) => {
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
