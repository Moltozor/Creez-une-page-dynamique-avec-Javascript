let modal = null;
import { isAdmin, url } from "./script.js";

/* --------- CODE TUTORIEL ------------ */

const openModal = function () {
  modal = document.querySelector("#modal1");
  modal.style.display = null;

  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
};

const closeModal = function () {
  if (modal === null) return;

  modal.style.display = "none";
  modal.removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-close").removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation);
  modal = null;
};

const stopPropagation = async function (e) {
  e.stopPropagation();
  //e.preventDefault();
};



document.querySelector(".modify").addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  const galleryModify = document.querySelector(".gallery-modify");
  galleryModify.innerHTML = "";
  openModal();
  getworks();
  setupModalGallery();
  updateModalSize();
});



/* ------------------------------------- */

function handleRemoveWorks(id, modalWrapper, container) {
  // Create a trash can icon
  const trash_can = document.createElement("i");
  trash_can.className = "fa-solid fa-trash-can";
  trash_can.id = id;

  // Remove Picture
  trash_can.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      const token = window.localStorage.getItem("token");
      const id = event.target.id;

      const init = {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(url + "works/" + id, init);
      if (response.ok) {
        modalWrapper.innerHTML = "";
        getworks();
      } else {
        console.log("Échec de la suppression. Statut :", response.status);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  });
  container.appendChild(trash_can);
}



function handleWorksDisplayInGallery(data) {
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
  }
}


function handleWorksDisplayInModal(data) {
  const modalWrapper = document.querySelector(".gallery-modify");

  for (let i = 0; i < data.length; i++) {
    // Create a containt for image and icon
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.display = "inline-block";

    // Create image
    const modalImg = document.createElement("img");
    modalImg.src = data[i].imageUrl;

    handleRemoveWorks(data[i].id, modalWrapper, container);

    // Assemble everything
    container.appendChild(modalImg);

    // Add to wrapper
    modalWrapper.appendChild(container);
  }
}

async function getworks() {
  try {
    const response = await fetch(url + "works");
    const data = await response.json();

    handleWorksDisplayInGallery(data);

    handleWorksDisplayInModal(data)

  } catch (error) {
    console.log("Message d'erreur:", error);
  }
}

getworks();



/* -------------- FORMULARY OF MODAL -------------- */

const form = `<form id="photoForm">
    <!-- 1. Photo -->
    <div class="form-group">
    <i class="form-display fa-regular fa-image"></i>

    <label for="image" class="form-display">+ Ajouter photo</label>
    <input type="file" id="image" name="image" accept="image/*" style="display: none;" required>

    <p class="form-display form-text">jpg, png : 4mo max</p>

    <img id="preview" alt="Aperçu de l'image" style="display:none;">
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

  </form>`;


function addPicture() {
  const addButton = document.querySelector(".add-picture");
  const galleryModify = document.querySelector(".gallery-modify");
  const titleModal = document.querySelector(".title-modal");
  const arrowLeft = document.querySelector(".arrow-left");

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
    arrowLeft.style.display = "block";
    document.querySelector(".close-modal").style.justifyContent = "space-between";
  };

  function injectForm() {
    if (typeof form !== "string") {
      console.error("Le formulaire n'est pas défini !");
      return;
    }
    galleryModify.innerHTML = form;
    displayPicture();

    function displayPicture() {
      const inputImage = document.getElementById('image');
      const preview = document.getElementById('preview');

      inputImage.addEventListener("change", (e) => {
        const displayElements = document.querySelectorAll(".form-display");

        displayElements.forEach((elements) => {
          elements.style.display = "none";
        });

        const file = e.target.files[0];

        const url = URL.createObjectURL(file);
        preview.src = url;
        preview.style.display = 'block';
        preview.style.height = "100%";
        preview.style.width = "129px";
      });


    };
  };

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
      const response = await fetch(url + "categories");
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

      categories.forEach((cat) => {
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
      const response = await fetch(url + "works", {
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
};

addPicture();

function setupModalGallery() {
  const galleryModify = document.querySelector(".gallery-modify");
  document.querySelector(".gallery-modify").innerHTML = ""; // TEST

  galleryModify.style.display = "grid";
  galleryModify.style.paddingBottom = "67.3px";
  galleryModify.style.marginTop = "46px";
  document.querySelector(".title-modal").textContent = "Galerie photo";
  document.querySelector(".add-picture").style.display = "block";
  document.querySelector(".arrow-left").style.display = "none";
  document.querySelector(".close-modal").style.justifyContent = "end";
};


function handleAdminActions() {
  if (isAdmin) {
    const logOut = document.querySelector(".log");
    const filter_gallery = document.querySelector(".filter_gallery");
    const inlineBlock = document.querySelector(".inline_block");


    // DYNAMIC RULES
    logOut.innerText = "logout";
    filter_gallery.style.display = "none";
    inlineBlock.style.marginBottom = "92px";
    document.querySelector(".modify").style.display = "flex"

    logOut.addEventListener("click", (event) => {
      const token = window.localStorage.getItem("token");

      if (token) {
        event.preventDefault();


        window.localStorage.removeItem("token");

        // DYNAMIC RULES
        logOut.innerText = "login";
        document.querySelector(".modify").style.display = "none";
        document.querySelector(".filter_gallery").style.display = "flex";
      }

    });

  };
};

function updateModalSize() {
  const modal = document.querySelector(".gallery-modify");

  setTimeout(() => {
    const width = modal.offsetWidth;
    modal.style.width = `${width}px`;
    console.log(width);
  }, 150);
};

document.querySelector(".arrow-left").addEventListener("click", () => {
  getworks();
  setupModalGallery();
});

handleAdminActions();