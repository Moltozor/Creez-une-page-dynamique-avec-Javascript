

export const url = `http://localhost:5678/api/`;
export let isAdmin = window.localStorage.getItem("token");

fetch(url + `works`)
    .then(reponse => reponse.json())
    .then(data => {
        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = "";


        for (let i = 0; i < data.length; i++) {
            const figure = document.createElement("figure");

            const img = document.createElement("img");
            const figcaption = document.createElement("figcaption");
            img.src = data[i].imageUrl;
            img.alt = data[i].title;
            figcaption.innerText = data[i].title;

            figure.appendChild(img);
            figure.appendChild(figcaption);

            document.querySelector(".gallery").appendChild(figure);

        };
    });

fetch(url + `categories`)
    .then(reponse => reponse.json())
    .then(data => {


        for (let i = 0; i < data.length; i++) {
            const button = document.createElement("button");

            button.innerText = data[i].name;
            button.id = data[i].id;

            document.querySelector(".filter_gallery").appendChild(button);

        }


        document.querySelectorAll(".filter_gallery button").forEach(button => {
            button.addEventListener(`click`, (event) => {
                let event_id = event.target.id;
                event_id = Number(event_id);

                document.querySelector(".gallery").innerHTML = "";

                fetch(url + `works`)
                    .then(reponse => reponse.json())
                    .then(data => {

                        for (let i = 0; i < data.length; i++) {
                            const figure = document.createElement("figure");
                            const img = document.createElement("img");
                            const figcaption = document.createElement("figcaption");

                            if (event_id === 0 || data[i].categoryId === event_id) {
                                img.src = data[i].imageUrl;
                                img.alt = data[i].title;
                                figcaption.innerText = data[i].title;

                                figure.appendChild(img);
                                figure.appendChild(figcaption);
                                document.querySelector(".gallery").appendChild(figure);
                            }

                        }
                    });
            });

        });
    });


/* -------------------- */

function handleAdminActions() {
    if (isAdmin) {
        const logOut = document.querySelector(".log");
        const filter_gallery = document.querySelector(".filter_gallery");
        const inlineBlock = document.querySelector(".inline_block");


        // DYNAMIC RULES
        logOut.innerText = "Logout";
        filter_gallery.style.display = "none";
        inlineBlock.style.marginBottom = "92px";

        logOut.addEventListener("click", (event) => {
            if (isAdmin) {
                event.preventDefault();
            }
            isAdmin = window.localStorage.removeItem("token");

            // DYNAMIC RULES
            logOut.innerText = "Login";
            document.querySelector(".modify").style.display = "none";
            document.querySelector(".filter_gallery").style.display = "flex";
        });
    };
}

function filterGallery_Color(selector) {
    const color = document.getElementById(selector);

    if (!selector) { console.log("Aucun selecteur trouver"); return; }
    else { color.classList = "colorButton"; }

    setTimeout(() => {
        document.querySelectorAll(".filter_gallery button").forEach(buttons => {
            buttons.addEventListener("click", event => {

                document.querySelectorAll(".filter_gallery button").forEach(btn => {
                    btn.classList.remove("colorButton");
                });
                event.target.classList.add("colorButton");
            })
        });
    }, 150);


};

filterGallery_Color("0");

handleAdminActions();







