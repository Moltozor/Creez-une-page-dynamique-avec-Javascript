

const url = "http://localhost:5678/api/";



const form = document.querySelector("#form");

form.addEventListener(`submit`, event => {
    event.preventDefault();

    let login = {
        email: event.target.querySelector("#email").value,
        password: event.target.querySelector("#password").value,
    };


    fetch(url + "users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login)
    })
        .then(async (response) => {
            const data = await response.json();
            console.log("message-2", data);

            if (data.token) {
                window.localStorage.setItem("token", data.token);
                //const token = window.localStorage.getItem("token");
                window.location.href = "../index.html";
            }
            else {
                const passwordFalse = document.querySelector(".passwordFalse");
                passwordFalse.style.display = "block";
                passwordFalse.style.marginTop = "8.85%";
                
                document.querySelector(".form form label").style.marginTop = "0";
            }

        })
});
