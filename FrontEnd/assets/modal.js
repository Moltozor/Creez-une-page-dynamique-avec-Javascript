let modal = null;
const focusableSelector = "button, a, input, textarea";
let focusables = [];
import { isAdmin, url } from "./script.js";


//let previouslyFocusedElement = document.querySelector(":focus");



const openModal = function (e) {
    e.preventDefault();
    modal = document.querySelector("#modal1");
    //focusables = Array.from(modal.querySelectorAll(focusableSelector));
    //focusables[0].focus(); // Ne marche pas
    modal.style.display = null;



    modal.addEventListener("click", closeModal);
    modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
    modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
};

const closeModal = function (e) {

    if (modal === null) return
    //if (previouslyFocusedElement !== null) previouslyFocusedElement.focus();

    e.preventDefault();
    modal.style.display = "none";
    //modal.setAttribute("aria-hidden", "true");
    //modal.removeAttribute("aria-modal");
    modal.removeEventListener("click", closeModal);
    modal.querySelector(".js-modal-close").removeEventListener("click", closeModal);
    modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation);
    modal = null;
};

const stopPropagation = async function (e) {
    e.stopPropagation();
};

const focusInModal = function (e) {
    e.preventDefault();
    let index = focusables.findIndex(f => f === modal.querySelector(":focus"));
    if (e.shiftKey === true) {
        index--;
    }
    else {
        index++;
    }
    if (index >= focusables.length) {
        index = 0
    }
    if (index < 0) {
        index = focusables.length - 1
    }
    focusables[index].focus();
};
document.querySelector(".modify").addEventListener("click", (e) => openModal(e));

window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Esc") {
        closeModal(e);
    };
    if (e.key === "Tab" && modal !== null) {
        focusInModal(e);
    }
});


/* ------------------------------------- */

async function getworks() {
    //e.preventDefault();

    try {
        const response = await fetch(url + "works");
        const data = await response.json();

        const modalWrapper = document.querySelector(".gallery-modify");

        for (let i = 0; i < data.length; i++) {
            // Create a containt for image and icon
            const container = document.createElement("div");
            container.style.position = "relative";
            container.style.display = "inline-block";

            // Create image
            const modalImg = document.createElement("img");
            modalImg.src = data[i].imageUrl;

            // Create a trash can icon
            const trash_can = document.createElement("i");
            trash_can.className = "fa-solid fa-trash-can";
            trash_can.id = data[i].id;


            // Assemble everything
            container.appendChild(modalImg);
            container.appendChild(trash_can);

            // Add to wrapper
            modalWrapper.appendChild(container);
        };
    } catch (error) {
        console.log("Message d'erreur:", error);
    }

    removePicture();

};

document.querySelector(".modify").addEventListener("click", getworks());


function toggleContainerSize(selector) {
    const conteneur = document.querySelector(selector);
    if (!conteneur) return;

    // lock the current size
    const width = conteneur.offsetWidth;

    conteneur.style.width = width + "px";
    conteneur.style.maxHeight = "fit-content";
};

// Event of the button
document.querySelector(".modify").addEventListener("click", () => {
    toggleContainerSize(".gallery-modify");
});

/* ------------------------------ */


async function removePicture() {
    const trash_can = document.querySelectorAll(".fa-trash-can");

    const token = localStorage.getItem("token");

    if (!token) {
        console.log("Vous n'êtes pas connecter");
        return;
    }

    try {
        trash_can.forEach(icon => {
            icon.addEventListener("click", async event => {
                event.preventDefault();
                const id = event.target.id;
                const init = {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                }

                const response = await fetch(url + "works/" + id,
                    init,
                );
                const data = await response.json();
                console.log(data);
            });
        });
    } catch (error) {
        console.log("Message d'erreur:", error);
    };
    /*
    trash_can.forEach(icon => {
        icon.addEventListener("click", async event => {
            //event.preventDefault();
            //event.stopPropagation();

            const id = event.target.id;
            console.log(id);

            if (token) {
                const response = await fetch(url + "works/" + id, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                });
                console.log(response);

            }
        });
        icon.addEventListener("click", async (e) => {
            const id = e.target.id;
            const init = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${isAdmin}`,
                },
            };
            try {
                const response = await fetch(url + "works" + id,
                    init
                );
                if (response.ok) {
                    //location.reload();
                    //getworks();
                    //pictureModal();
                }
            } catch (error) {
                console.log("image delete error", error);
            }
        });


    });

    */
};





