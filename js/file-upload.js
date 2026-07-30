//file-upload

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const thumbnails = document.getElementById("thumbnails");
const errorContainer = document.getElementById("errorContainer");
const MAX_SIZE = 30 * 1024 * 1024; // 30MB in bytes

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.classList.add("error-message");
  errorDiv.textContent = message;
  errorContainer.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const files = e.dataTransfer.files;
  handleFiles(files);
});

dropZone.addEventListener("click", (e) => {
  if (e.target === dropZone || e.target.tagName === "P") {
    fileInput.click();
  }
});

fileInput.addEventListener("change", () => {
  const files = fileInput.files;
  handleFiles(files);
});

function handleFiles(files) {
  for (const file of files) {
    if (file.type.startsWith("image/")) {
      if (file.size > MAX_SIZE) {
        showError(`圖片不可大於 30MB`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const thumbnailContainer = document.createElement("div");
        thumbnailContainer.classList.add("thumbnail-container");

        const img = document.createElement("img");
        img.src = e.target.result;
        img.classList.add("thumbnail");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          thumbnailContainer.remove();
        });

        thumbnailContainer.appendChild(img);
        thumbnailContainer.appendChild(deleteBtn);
        thumbnails.appendChild(thumbnailContainer);
      };
      reader.readAsDataURL(file);
    }
  }
}