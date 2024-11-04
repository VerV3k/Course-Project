document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.querySelector(".add-button");
  const overflowContainer = document.querySelector(".owerflow");
  const closeButton = document.querySelector(".cross");
  const form = document.querySelector(".add-user-form");
  const tableBody = document.querySelector(".table-position");
  const searchInput = document.querySelector(".search input[type='text']");
  const searchButton = document.querySelector(".btn-search");
  const notificationContainer = document.querySelector(".owerflow-complitede"); // Container for notifications
  const notificationText = notificationContainer.querySelector(
    ".completed-chek span"
  );
  const exitCompletedButton =
    notificationContainer.querySelector(".exit-completed");

  let message;
  let editMode = false;
  let currentUserId;

  const getStoredUsers = () => JSON.parse(localStorage.getItem("users")) || [];

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
      const firstName = document.querySelector("#firstName").value.trim();
      const lastName = document.querySelector("#lastName").value.trim();
      const phone = document.querySelector("#phone").value.trim();
      const role = document.querySelector("#role").value.trim();
      const login = document.querySelector("#login").value.trim();
      const password = document.querySelector("#password").value.trim();

      const storedUsers = getStoredUsers();

      if (storedUsers.some((user) => user.login === login && !editMode)) {
        showError("loginError", "Логин должен быть уникальным.");
        return;
      }

      if (!/^[а-яА-ЯёЁ]+$/.test(firstName)) {
        showError(
          "firstNameError",
          "Имя должно содержать только русские буквы."
        );
        return;
      }

      if (!/^[а-яА-ЯёЁ]+$/.test(lastName)) {
        showError(
          "lastNameError",
          "Фамилия должна содержать только русские буквы."
        );
        return;
      }

      const validationResult = validateLoginAndPassword(login, password);
      if (!validationResult.isValid) {
        showError(
          validationResult.errorElementId,
          validationResult.errorMessage
        );
        return;
      }

      if (!phone || phone.length < 18) {
        showError(
          "phoneError",
          "Пожалуйста, введите полный номер телефона (должен быть не менее 18 символов)."
        );
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
        message = "Пользователь изменён";
        displayNotification(message);
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
        message = "Пользователь добавлен";
        displayNotification(message);
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

  // Изменения здесь: добавляем проверку на роль
  const addToTable = (userData) => {
    const newRow = `<tr class="table-section__tr font-regular" data-id="${
      userData.id
    }">
            <td>${userData.id}</td>
            <td>${userData.firstName}</td>
            <td>${userData.lastName}</td>
            <td>${userData.role}</td>
            <td>${userData.login}</td>
            <td>${userData.password}</td>
            <td>${userData.phone}</td>
            ${
              userData.role !== "Главный администратор"
                ? `<td><img src="../icons/edit.svg" alt="изменение" class="edit-button"></td>
                <td><img src="../icons/delete.svg" alt="удаление" class="delete-button"></td>`
                : `<td></td><td></td>`
            }
        </tr>`;

    tableBody.insertAdjacentHTML("beforeend", newRow);

    // Добавляем обработчики для кнопок удаления и редактирования только если это не главный администратор
    if (userData.role !== "Главный администратор") {
      tableBody
        .querySelector(`tr[data-id="${userData.id}"] .delete-button`)
        .addEventListener("click", () => {
          // Код для удаления пользователя
          handleDeleteUser(userData.id);
        });

      tableBody
        .querySelector(`tr[data-id="${userData.id}"] .edit-button`)
        .addEventListener("click", () => {
          editUser(userData.id);
        });
    }
  };

  // Функция для удаления пользователя
  const handleDeleteUser = (id) => {
    // Логика удаления пользователя
    // Например: показываем меню подтверждения удаления
    deleteUser(id);
    populateTable(); // Обновляем таблицу после удаления
  };
  const currentUser = JSON.parse(localStorage.getItem("currentUser")); // Получаем текущего пользователя
  const roleSelect = document.querySelector("#role"); // Получаем селектор ролей

  // Проверяем, является ли текущий пользователь обычным администратором
  if (currentUser && currentUser.role === "Администратор") {
    // Удаляем опцию главного администратора из селектора
    const adminOption = Array.from(roleSelect.options).find(
      (option) => option.value === "Главный администратор"
    );
    if (adminOption) {
      roleSelect.removeChild(adminOption); // Удаляем опцию
    }
  }
  const deleteUser = (id) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")); // Получаем текущего пользователя
    const storedUsers = getStoredUsers(); // Получаем всех пользователей
    const userToDelete = storedUsers.find((user) => user.id === id); // Находим пользователя, которого хотим удалить

    // Проверяем, является ли текущий пользователь главным администратором и пытается ли он удалить главного администратора
    if (
      currentUser.role !== "Главный администратор" &&
      userToDelete.role === "Главный администратор"
    ) {
      alert("Вы не имеете права удалять главного администратора.");
      return; // Прекращаем выполнение функции
    }

    let updatedUsers = storedUsers.filter((user) => user.id !== id); // Удаляем пользователя из списка
    localStorage.setItem("users", JSON.stringify(updatedUsers)); // Сохраняем обновленный список пользователей
    populateTable(); // Обновляем таблицу
  };

  const editUser = (userId) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")); // Получаем текущего пользователя
    const storedUsers = getStoredUsers(); // Получаем всех пользователей
    const userToEdit = storedUsers.find((user) => user.id === userId); // Находим пользователя, которого хотим редактировать

    // Проверяем, является ли текущий пользователь главным администратором и пытается ли он редактировать главного администратора
    if (
      currentUser.role !== "Главный администратор" &&
      userToEdit.role === "Главный администратор"
    ) {
      alert("Вы не имеете права редактировать главного администратора.");
      return; // Прекращаем выполнение функции
    }

    editMode = true; // Устанавливаем режим редактирования
    currentUserId = userId; // Сохраняем ID текущего пользователя для редактирования
    document.querySelector("#firstName").value = userToEdit.firstName; // Заполняем форму данными пользователя
    document.querySelector("#lastName").value = userToEdit.lastName;
    document.querySelector("#phone").value = userToEdit.phone;
    document.querySelector("#role").value = userToEdit.role;
    document.querySelector("#login").value = userToEdit.login;

    overflowContainer.style.display = "block"; // Показываем форму редактирования
    document.querySelector(".position-text").textContent =
      "Редактировать пользователя";
    document.querySelector(".add-button-ac").textContent =
      "Сохранить изменения";
  };

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

  document.querySelector("#phone").addEventListener("input", maskPhoneInput);

  populateTable();

  const showError = (elementId, message) => {
    const errorElement = document.querySelector(`#${elementId}`);
    errorElement.textContent = message;
  };

  const clearErrors = () => {
    document.querySelector("#firstNameError").textContent = "";
    document.querySelector("#lastNameError").textContent = "";
    document.querySelector("#phoneError").textContent = "";
    document.querySelector("#loginError").textContent = "";
    document.querySelector("#passwordError").textContent = "";
  };
  const removeSpaces = (event) => {
    event.target.value = event.target.value.replace(/\s+/g, ""); // Используем event.target для доступа к элементу
  };

  document.querySelector("#firstName").addEventListener("input", removeSpaces);
  document.querySelector("#lastName").addEventListener("input", removeSpaces);
  document.querySelector("#login").addEventListener("input", removeSpaces);
  document.querySelector("#password").addEventListener("input", removeSpaces);

  const forma = document.querySelector(".add-user-form");

  // Функция для преобразования первой буквы в заглавную
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Обработчик события для имени
  const allowOnlyRussianLettersInFirstName = (event) => {
    let value = event.target.value.replace(/[^а-яА-ЯёЁ]/g, ""); // Разрешаем только русские буквы
    event.target.value = capitalizeFirstLetter(value); // Преобразуем первую букву в заглавную
  };

  // Обработчик события для фамилии
  const allowOnlyRussianLettersInLastName = (event) => {
    let value = event.target.value.replace(/[^а-яА-ЯёЁ]/g, ""); // Разрешаем только русские буквы
    event.target.value = capitalizeFirstLetter(value); // Преобразуем первую букву в заглавную
  };

  if (forma) {
    document
      .querySelector("#firstName")
      .addEventListener("input", allowOnlyRussianLettersInFirstName);
    document
      .querySelector("#lastName")
      .addEventListener("input", allowOnlyRussianLettersInLastName);
  }

  const validateLoginAndPassword = (login, password) => {
    if (/^[а-яА-ЯёЁ]*$/.test(login)) {
      return {
        isValid: false,
        errorElementId: "loginError",
        errorMessage: "Логин не должен содержать русские буквы.",
      };
    }
    if (/^[а-яА-ЯёЁ]*$/.test(password)) {
      return {
        isValid: false,
        errorElementId: "passwordError",
        errorMessage: "Пароль не должен содержать русские буквы.",
      };
    }
    return { isValid: true };
  };

  searchButton.addEventListener("click", () => {
    const queryString = searchInput.value.toLowerCase();
    const rows = tableBody.getElementsByTagName("tr");

    Array.from(rows).forEach((row) => {
      const firstNameCellText = row.cells[1]
        ? row.cells[1].textContent.toLowerCase()
        : "";
      const lastNameCellText = row.cells[2]
        ? row.cells[2].textContent.toLowerCase()
        : "";

      if (
        firstNameCellText.includes(queryString) ||
        lastNameCellText.includes(queryString)
      ) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  document
    .querySelector("#firstName")
    .addEventListener("input", allowOnlyRussianLettersInFirstName);
  document
    .querySelector("#lastName")
    .addEventListener("input", allowOnlyRussianLettersInLastName);

  const displayNotification = (message) => {
    notificationText.textContent = message;
    notificationContainer.style.display = "block";

    setTimeout(() => {
      notificationContainer.style.display = "none";
    }, 3000);

    exitCompletedButton.onclick = () => {
      notificationContainer.style.display = "none";
    };
  };
});

document.addEventListener("DOMContentLoaded", () => {
  const logOutButton = document.querySelector(".log-out-button");

  const createExitMenu = () => {
    const exitMenu = document.createElement("div");
    exitMenu.className = "owerflow-exit font-regular";

    exitMenu.innerHTML = `
          <div class="exit-container">
              <span class="cross-exit"><img src="../icons/krest.svg" alt="cross"></span>
              <span class="exit-text">Вы действительно хотите выйти?</span>
              <div class="button-exit-container font-regular-white">
                  <button class="exit-cancellation font-regular-white">Отмена</button>
                  <button class="exit-completed font-regular-white">Выйти</button>
              </div>
          </div>
      `;

    const closeButton = exitMenu.querySelector(".cross-exit");
    const cancelButton = exitMenu.querySelector(".exit-cancellation");
    const completeButton = exitMenu.querySelector(".exit-completed");

    closeButton.addEventListener("click", () => {
      exitMenu.remove();
    });

    cancelButton.addEventListener("click", () => {
      exitMenu.remove();
    });

    completeButton.addEventListener("click", () => {
      window.location.href = "../index.html";
    });

    return exitMenu;
  };

  logOutButton.addEventListener("click", () => {
    const header = document.querySelector(".dute__header");
    const exitMenu = createExitMenu();
    header.appendChild(exitMenu);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const logOutButton = document.querySelector(".log-out-button");
  const userNameSpan = logOutButton.querySelector(".user-name"); // Элемент для отображения имени пользователя

  // Проверка на наличие текущего пользователя
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser && userNameSpan) {
    // Обновляем текст кнопки с именем и первой буквой фамилии пользователя
    userNameSpan.textContent = `${
      currentUser.firstName
    } ${currentUser.lastName.charAt(0)}.`; // Отображаем только первую букву фамилии
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#form-sign-in");
  const errorMessageElement = document.querySelector(".error-message-log"); // Элемент для вывода ошибок

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (errorMessageElement) {
        errorMessageElement.textContent = "";
      }

      const loginInput = document.querySelector("#login").value.trim();
      const passwordInput = document.querySelector("#password").value.trim();

      const storedUsers = JSON.parse(localStorage.getItem("users")) || [];

      const user = storedUsers.find(
        (user) => user.login === loginInput && user.password === passwordInput
      );

      if (user) {
        // Сохраняем текущего пользователя в локальном хранилище
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Перенаправление на соответствующую страницу
        switch (user.role) {
          case "Администратор":
            window.location.href = "pages/administrator.html";
            break;
          case "Главный администратор":
            window.location.href = "pages/managerPage.html";
            break;
          case "Сотрудник":
            window.location.href = "pages/duty.html";
            break;
          default:
        }
      } else {
        if (storedUsers.length === 0) {
          window.location.href = "pages/managerPage.html";
        } else {
          if (errorMessageElement) {
            errorMessageElement.textContent =
              "Неправильное имя пользователя или пароль";
          }
        }
      }
    });
  }
});

// Радиальный график
// Шаг 2: Создание диаграммы
const ctx = document.querySelector(".myPieChart").getContext("2d");
let data = [13, 1, 2]; // Начальные данные

// Создаем радиальный градиент
const createGradient = (color) => {
  const gradient = ctx.createRadialGradient(100, 100, 0, 110, 120, 90); // Радиальный градиент
  gradient.addColorStop(0, "rgba(128, 128, 128, 0.5)"); // Центр (серый)
  gradient.addColorStop(1, color); // Конечный цвет
  return gradient;
};

const myPieChart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: [
      "Число выполненых дежурств",
      "Число пропущенных дежурств",
      "Число замененных дежурств",
    ],
    datasets: [
      {
        label: "Мои данные",
        data: data,
        backgroundColor: [
          createGradient("#77C375"), // Градиент для первого сектора
          createGradient("#BB4141"), // Градиент для второго сектора
          createGradient("#D05AFF"), // Градиент для третьего сектора
        ],
        borderWidth: 0, // Убираем границы
      },
    ],
  },
  options: {
    responsive: true,
    cutout: "50%", // Устанавливаем пустой центр
    plugins: {
      legend: {
        display: false,
        position: "top",
      },
    },
  },
});

// Шаг 3: Функция для обновления данных
function updateData() {
  // Генерация новых данных
  data = data.map((value) => Math.floor(Math.random() * 100)); // Случайные значения от 0 до 99
  myPieChart.data.datasets[0].data = data; // Обновление данных в диаграмме
  myPieChart.update(); // Обновление отображения диаграммы
}
