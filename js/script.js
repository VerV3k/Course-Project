document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.querySelector(".add-button");
  const overflowContainer = document.querySelector(".owerflow");
  const closeButton = document.querySelector(".cross");
  const form = document.querySelector(".add-user-form");
  const tableBody = document.querySelector(".table-position");

  let editMode = false;
  let currentUserId;

  const getStoredUsers = () => {
    return JSON.parse(localStorage.getItem("users")) || [];
  };

  const generateUniqueId = (storedUsers) => {
    let id;
    do {
      id = Math.floor(100 + Math.random() * 900);
    } while (storedUsers.some((user) => user.id === id));
    return id;
  };

  const populateTable = () => {
    tableBody.innerHTML = "";
    const storedUsers = getStoredUsers();
    storedUsers.forEach((user) => addToTable(user));
  };

  if (addButton) {
    addButton.addEventListener("click", () => {
      overflowContainer.style.display = "block";
      clearErrors();
      editMode = false;
      form.reset();
      document.querySelector(".position-text").textContent =
        "Добавить пользователя";
      document.querySelector(".add-button-ac").textContent =
        "Добавить пользователя";
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      overflowContainer.style.display = "none";
      clearErrors();
      editMode = false;
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors();

      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const role = document.getElementById("role").value.trim();
      const login = document.getElementById("login").value.trim();
      const password = document.getElementById("password").value.trim();

      const storedUsers = getStoredUsers();

      if (storedUsers.some((user) => user.login === login && !editMode)) {
        showError("loginError", "Логин должен быть уникальным.");
        return;
      }

      if (!login || /\s/.test(login)) {
        showError(
          "loginError",
          "Логин не может быть пустым и не должен содержать пробелов."
        );
        return;
      }

      if (!firstName || /\s/.test(firstName)) {
        showError(
          "firstNameError",
          "Имя не может быть пустым и не должно содержать пробелов."
        );
        return;
      }

      if (!lastName || /\s/.test(lastName)) {
        showError(
          "lastNameError",
          "Фамилия не может быть пустой и не должна содержать пробелов."
        );
        return;
      }

      if (!phone || phone.length < 17) {
        showError("phoneError", "Пожалуйста, введите полный номер телефона.");
        return;
      }

      if (!password || /\s/.test(password)) {
        showError(
          "passwordError",
          "Пароль не может быть пустым и не должен содержать пробелов."
        );
        return;
      }

      if (editMode) {
        const updatedUserData = {
          id: currentUserId,
          firstName,
          lastName,
          phone,
          role,
          login,
          password,
        };
        saveUpdatedUserData(updatedUserData);
      } else {
        const userId = generateUniqueId(storedUsers);
        const userData = {
          id: userId,
          firstName,
          lastName,
          phone,
          role,
          login,
          password,
        };
        saveUserData(userData);
        addToTable(userData);
      }

      overflowContainer.style.display = "none";
      form.reset();
    });
  }

  const saveUserData = (userData) => {
    const storedUsers = getStoredUsers();
    storedUsers.push(userData);
    localStorage.setItem("users", JSON.stringify(storedUsers));
  };

  const saveUpdatedUserData = (updatedUserData) => {
    let storedUsers = getStoredUsers();
    storedUsers = storedUsers.map((user) =>
      user.id === updatedUserData.id ? updatedUserData : user
    );
    localStorage.setItem("users", JSON.stringify(storedUsers));
    populateTable();
    overflowContainer.style.display = "none";
    form.reset();
  };

  const addToTable = (userData) => {
    const newRow = `
            <tr class="table-section__tr font-regular" data-id="${userData.id}">
                <td>${userData.id}</td>
                <td>${userData.firstName}</td>
                <td>${userData.lastName}</td>
                <td>${userData.role}</td>
                <td>${userData.login}</td>
                <td>${userData.password}</td>
                <td>${userData.phone}</td>
                <td><img src="../icons/edit.svg" alt="" class="edit-button"></td>
                <td><img src="../icons/delete.svg" alt="" class="delete-button"></td>
            </tr>`;

    tableBody.insertAdjacentHTML("beforeend", newRow);

    tableBody
      .querySelector(`tr[data-id="${userData.id}"] .delete-button`)
      .addEventListener("click", () => {
        deleteUser(userData.id);
      });

    tableBody
      .querySelector(`tr[data-id="${userData.id}"] .edit-button`)
      .addEventListener("click", () => {
        editUser(userData.id);
      });
  };

  const deleteUser = (id) => {
    let storedUsers = getStoredUsers();

    storedUsers = storedUsers.filter((user) => user.id !== id);

    localStorage.setItem("users", JSON.stringify(storedUsers));

    populateTable();
  };

  const editUser = (userId) => {
    editMode = true;
    currentUserId = userId;

    const storedUsers = getStoredUsers();
    const userToEdit = storedUsers.find((user) => user.id === userId);

    document.getElementById("firstName").value = userToEdit.firstName;
    document.getElementById("lastName").value = userToEdit.lastName;
    document.getElementById("phone").value = userToEdit.phone;
    document.getElementById("role").value = userToEdit.role;
    document.getElementById("login").value = userToEdit.login;

    overflowContainer.style.display = "block";

    document.querySelector(".position-text").textContent =
      "Редактировать пользователя";

    document.querySelector(".add-button-ac").textContent =
      "Сохранить изменения";
  };

  // Функция для маски номера телефона
  const maskPhoneInput = (event) => {
    const input = event.target;
    const value = input.value.replace(/\D/g, "");

    let formattedValue = "+7 (";

    if (value.length > 1) formattedValue += value.substring(1, 4);

    if (value.length >= 5) formattedValue += ") " + value.substring(4, 7);

    if (value.length >= 7) formattedValue += "-" + value.substring(7, 9);

    if (value.length >= 9) formattedValue += "-" + value.substring(9, 11);

    input.value = formattedValue;
  };

  document.getElementById("phone").addEventListener("input", maskPhoneInput);

  populateTable();

  const showError = (elementId, message) => {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
  };

  const clearErrors = () => {
    document.getElementById("firstNameError").textContent = "";
    document.getElementById("lastNameError").textContent = "";
    document.getElementById("phoneError").textContent = "";
    document.getElementById("loginError").textContent = "";
    document.getElementById("passwordError").textContent = "";
  };

  const allowOnlyLetters = (event) => {
    event.target.value = event.target.value.replace(/[^а-яА-ЯёЁa-zA-Z]/g, "");
  };

  document
    .getElementById("firstName")
    .addEventListener("input", allowOnlyLetters);
  document
    .getElementById("lastName")
    .addEventListener("input", allowOnlyLetters);

  // Функция для поиска пользователей по имени и фамилии
  const searchUsers = () => {
    const searchInput = document.querySelector(".search input[type=text]");
    const query = searchInput.value.toLowerCase();
    const rows = tableBody.querySelectorAll("tr");

    rows.forEach((row) => {
      const firstName = row.cells[1].textContent.toLowerCase();
      const lastName = row.cells[2].textContent.toLowerCase();

      if (firstName.includes(query) || lastName.includes(query)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  };

  const searchButton = document.querySelector(".btn-search");
  searchButton.addEventListener("click", searchUsers);
});
