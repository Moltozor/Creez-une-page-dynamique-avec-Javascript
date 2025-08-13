

export const url = `http://localhost:5678/api/`;
export let isAdmin = window.localStorage.getItem("token");

getCategories();
filterGallery_Color("0");

async function getCategories() {
    await fetch(url + `categories`)
        .then(reponse => reponse.json())
        .then(data => {


            for (let i = 0; i < data.length; i++) {
                const button = document.createElement("button");

                button.innerText = data[i].name;
                button.id = data[i].id;

                document.querySelector(".filter_gallery").appendChild(button);

            };


            document.querySelectorAll(".filter_gallery button").forEach(button => {
                button.addEventListener(`click`, async (event) => {
                    let event_id = event.target.id;
                    event_id = Number(event_id);

                    document.querySelector(".gallery").innerHTML = "";

                    await fetch(url + `works`)
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
};

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