let modal = null;
const focusableSelector = "button, a, input, textarea";
let focusables = [];
import { isAdmin, url } from "./script.js";


//let previouslyFocusedElement = document.querySelector(":focus");



const openModal = function (e) {
    e.preventDefault();
    modal = document.querySelector("#modal1");
    focusables = Array.from(modal.querySelectorAll(focusableSelector));
    focusables[0].focus(); // Ne marche pas
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
    modal.querySelector("js-modal-close").removeEventListener("click", closeModal);
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

async function getworks(e) {
    e.preventDefault();

    await fetch(url + "works")
    .then(response => response.json())
    .then(data => {
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


            // Assemble everything
            container.appendChild(modalImg);
            container.appendChild(trash_can);

            // Add to wrapper
            modalWrapper.appendChild(container);
        };

    });
}

getworks();




function toggleContainerSize(selector) {
    const conteneur = document.querySelector(selector);
    if (!conteneur) return;

    // lock the current size
    const width = conteneur.offsetWidth;

    conteneur.style.width = width + "px";
    conteneur.style.maxHeight = "fit-content";
}

// Event of the button
document.querySelector(".modify").addEventListener("click", () => {
    toggleContainerSize(".gallery-modify");
});


const form = `<form id="photoForm">
    <!-- 1. Photo -->
    <div class="form-group">
    <i class="fa-regular fa-image"></i>

    <label for="image">+ Ajouter photo</label>
    <input type="file" id="image" name="image" accept="image/*" style="display: none;" required>

    <p class="form-text">jpg, png : 4mo max</p>
  </div>

    <!-- 2. Titre -->
    <label for="title" style="margin-top: 30px;">Titre :</label>
    <input type="text" id="title" name="title" required>

    <!-- 3. Catégorie -->
    <label for="category" style="margin-top: 21px;">Catégorie :</label>
    <select id="category" name="category" value="Sélectionner une catégories" style="margin-bottom: 47px" required>
    </select>

    <div class="validButton">
    <button class="valider" type="submit">Valider</button>
    </div>

  </form>`


function addPicture() {
    const addButton = document.querySelector(".add-picture");
    const galleryModify = document.querySelector(".gallery-modify");
    const titleModal = document.querySelector(".title-modal");

    if (!addButton || !galleryModify || !titleModal) return;

    addButton.addEventListener("click", () => {
        setupModalUI();
        injectForm();
        setupForm();
    });

    function setupModalUI() {
        titleModal.textContent = "Ajout Photo";
        galleryModify.style.display = "flex";
        galleryModify.style.justifyContent = "center";
        galleryModify.style.paddingBottom = "0px";
        galleryModify.style.marginTop = "36px";
        addButton.style.display = "none";
    }

    function injectForm() {
        if (typeof form !== "string") {
            console.error("Le formulaire n'est pas défini !");
            return;
        }
        galleryModify.innerHTML = form;
    }

    function setupForm() {
        const photoForm = document.querySelector("#photoForm");
        if (!photoForm) {
            console.error("Formulaire non trouvé");
            return;
        }

        chargerCategories();

        // Supprimer tout ancien écouteur de soumission
        photoForm.addEventListener("submit", (event) => {
            event.preventDefault();
            event.stopPropagation();
            handleFormSubmit(event);
        });
    }

    async function chargerCategories() {
        try {
            const response = await fetch(`${url}categories`);
            const categories = await response.json();

            const select = document.getElementById("category");
            if (!select) return;

            select.innerHTML = "";

            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            categories.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat.id;
                option.textContent = cat.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error("Erreur lors du chargement des catégories :", error);
            const select = document.getElementById("category");
            if (select) {
                select.innerHTML = '<option value="">Erreur de chargement</option>';
            }
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log("Message:", event);

        const token = window.localStorage.getItem("token");
        const fileInput = document.querySelector("#image");
        const titleInput = document.querySelector("#title");
        const categoryInput = document.querySelector("#category");

        if (!fileInput || !titleInput || !categoryInput) {
            alert("Champs du formulaire introuvables.");
            return;
        }

        if (!validateForm(fileInput, titleInput, categoryInput)) {
            alert("Veuillez remplir tous les champs du formulaire.");
            return;
        }

        if (!token) {
            alert("Vous devez être connecté pour ajouter un projet.");
            return;
        }

        const formData = new FormData();
        formData.append("image", fileInput.files[0]);
        formData.append("title", titleInput.value);
        formData.append("category", categoryInput.value);

        try {
            console.log(token);
            const response = await fetch(`${url}works`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'envoi du projet.");
            }

            const data = await response.json();
            alert("Projet ajouté avec succès !");
            event.target.reset();
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de l'envoi du projet.");
        }
    }

    function validateForm(fileInput, titleInput, categoryInput) {
        return (
            fileInput.files.length > 0 &&
            titleInput.value.trim() !== "" &&
            categoryInput.value.trim() !== ""
        );
    }
}

addPicture();

async function deleteWork() {

    const trash_can = document.querySelectorAll(".fa-trash-can");
    const token = localStorage.getItem("token");


    if (!trash_can) {
        console.log("Aucun selecteur trouver");
        return;
    }
    else if (!token) {
        console.log("Vous n'êtes pas connecter");
        return;
    }

    addId();

    async function addId() {
        const trash_can = document.querySelectorAll(".fa-trash-can");
        try {
            const response = await fetch(url + "works");
            const data = await response.json();


            trash_can.forEach((icon, i) => {
                icon.id = data[i].id;
            });


        } catch (error) {
            console.log("Erreur:", error);
        }
    };

    trash_can.forEach(icon => {
        /* icon.addEventListener("click", async event => {
             event.preventDefault();
             event.stopPropagation();
 
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
         });*/
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
                const response = await fetch(
                    `http://localhost:5678/api/works/${id}`,
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


}

deleteWork();


