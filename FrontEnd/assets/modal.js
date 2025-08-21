let modal = null;
import { isAdmin, url } from "./script.js";

/* --------- Open and close modal ------------ */

const openModal = function () {
  modal = document.querySelector("#modal1");
  modal.style.display = "flex";

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


// Button modify
document.querySelector(".modify").addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  openModal();
  updateModalSize();
});

/* ------------------------------------- */

// Remove works
function handleRemoveWorks(id, container) {
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
        getworks();

      } else {
        console.log("Deletion failed. Status:", response.status);
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  });


  container.appendChild(trash_can);
};

// Display in gallery
function handleWorksDisplayInGallery(data) {
  const gallery = document.querySelector(".gallery");
  gallery.replaceChildren();

  for (let i = 0; i < data.length; i++) {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");
    img.src = data[i].imageUrl;
    img.alt = data[i].title;
    figcaption.textContent = data[i].title;

    figure.appendChild(img);
    figure.appendChild(figcaption);

    gallery.appendChild(figure);
  };
};

// Display in modal
function handleWorksDisplayInModal(data) {
  const modalWrapper = document.querySelector(".gallery-modify");
  modalWrapper.replaceChildren();

  for (let i = 0; i < data.length; i++) {
    // Create a containt for image and icon
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.display = "inline-block";

    // Create image
    const modalImg = document.createElement("img");
    modalImg.src = data[i].imageUrl;

    handleRemoveWorks(data[i].id, container);

    // Assemble everything
    container.appendChild(modalImg);

    // Add to wrapper
    modalWrapper.appendChild(container);
  };
};

// get works in gallery and modal
async function getworks() {
  try {
    const response = await fetch(url + "works");
    const data = await response.json();

    handleWorksDisplayInModal(data);

    handleWorksDisplayInGallery(data);
  } catch (error) {
    console.log("Error message:", error);
  }
};

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
    <select id="category" name="category" value="Sélectionner une catégorie" style="margin-bottom: 47px" required>
    </select>

    <div class="validButton">
    <button class="valider" type="submit">Valider</button>
    </div>

  </form>`;

// Set up the modal UI/form and inject the form
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
  // rules style of the image into Form UI
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
  // Inject form, into addPicture()
  function injectForm() {
    if (typeof form !== "string") {
      console.error("The form is not defined!");
      return;
    };
    galleryModify.innerHTML = form;
    displayPicture();

  };
  // set up form, into addPicture()
  function setupForm() {
    const photoForm = document.querySelector("#photoForm");
    if (!photoForm) {
      console.error("Form not found");
      return;
    };

    chargerCategories();

    // Delete any old submission listener
    photoForm.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleFormSubmit(event);
    });
  };
  // Adding categories since API for the form
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
      console.error("Error loading categories:", error);
      const select = document.getElementById("category");
      if (select) {
        select.innerHTML = '<option value="">Erreur de chargement</option>';
      };
    }
  };
  // Handle of submit
  async function handleFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const token = window.localStorage.getItem("token");
    const fileInput = document.querySelector("#image");
    const titleInput = document.querySelector("#title");
    const categoryInput = document.querySelector("#category");

    if (!fileInput || !titleInput || !categoryInput) {
      alert("Form fields not found.");
      return;
    };

    if (!validateForm(fileInput, titleInput, categoryInput)) {
      alert("Please fill in all fields in the form.");
      return;
    };

    if (!token) {
      alert("You must be logged in to add a project.");
      return;
    };

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    formData.append("title", titleInput.value);
    formData.append("category", categoryInput.value);

    try {
      const response = await fetch(url + "works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error sending project.");
      };

      alert("Project added successfully!");
      closeModal();
      getworks();
      setupModalGallery();

      event.target.reset();
    } catch (error) {
      console.error(error);
      alert("An error occurred while sending the project.");
    }
  };

  function validateForm(fileInput, titleInput, categoryInput) {
    return (
      fileInput.files.length > 0 &&
      titleInput.value.trim() !== "" &&
      categoryInput.value.trim() !== ""
    );
  };
};

addPicture();

// Back to the UI gallery
function setupModalGallery() {
  const galleryModify = document.querySelector(".gallery-modify");
  document.querySelector(".gallery-modify").innerHTML = "";

  galleryModify.style.display = "grid";
  galleryModify.style.paddingBottom = "67.3px";
  galleryModify.style.marginTop = "46px";
  document.querySelector(".title-modal").textContent = "Galerie photo";
  document.querySelector(".add-picture").style.display = "block";
  document.querySelector(".arrow-left").style.display = "none";
  document.querySelector(".close-modal").style.justifyContent = "end";
};

// Handle admin token and style rules
function handleAdminActions() {
  if (isAdmin) {
    const logOut = document.querySelector(".log");
    const filter_gallery = document.querySelector(".filter_gallery");
    const inlineBlock = document.querySelector(".inline_block");


    // DYNAMIC RULES
    logOut.innerText = "logout";
    filter_gallery.style.display = "none";
    inlineBlock.style.marginBottom = "92px";
    document.querySelector(".modify").style.display = "flex";

    logOut.addEventListener("click", (event) => {
      const token = window.localStorage.getItem("token");

      if (token) {
        event.preventDefault();


        window.localStorage.removeItem("token");

        // DYNAMIC RULES
        logOut.innerText = "login";
        document.querySelector(".modify").style.display = "none";
        document.querySelector(".filter_gallery").style.display = "flex";
      };

    });

  };
};

// Arrow left of form UI
document.querySelector(".arrow-left").addEventListener("click", () => {
  getworks();
  setupModalGallery();
});

// For the size of modal
function updateModalSize() {
  const modal = document.querySelector(".gallery-modify");

  setTimeout(() => {
    const width = modal.offsetWidth;
    modal.style.width = `${width}px`;
  }, 150);
};
handleAdminActions();