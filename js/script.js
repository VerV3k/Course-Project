let titleTag = document.querySelector("head title");
console.log(titleTag.textContent);

if (
  titleTag.textContent === "Страница руководителя" ||
  titleTag.textContent === "Страница администратора" ||
  titleTag.textContent === "security system"
) {
  document.addEventListener("DOMContentLoaded", () => {
    const addButton = document.querySelector(".add-button");
    const overflowContainer = document.querySelector(".owerflow");
    const closeButton = document.querySelector(".cross");
    const form = document.querySelector(".add-user-form");
    const tableBody = document.querySelector(".table-position");
    const searchInput = document.querySelector(".search input[type='text']");
    const searchButton = document.querySelector(".btn-search");
    const notificationContainer = document.querySelector(
      ".owerflow-complitede"
    );

    const getStoredUsers = () =>
      JSON.parse(localStorage.getItem("users")) || [];

    const saveUserData = (userData) => {
      const storedUsers = getStoredUsers();

      // Проверяем, существует ли пользователь с таким же логином
      const userExists = storedUsers.some(
        (user) => user.login === userData.login
      );

      if (!userExists) {
        storedUsers.push(userData);
        localStorage.setItem("users", JSON.stringify(storedUsers));
        console.log("Пользователь добавлен:", userData);
      } else {
        console.log("Пользователь уже существует:", userData);
      }
    };

    const defaultEmployeeUser = {
      id: 1,
      firstName: "Виталий",
      lastName: "Галенко",
      phone: "+7 (977) 549-79-73",
      role: "Главный администратор",
      login: "verve",
      password: "mainadmin",
    };

    saveUserData(defaultEmployeeUser);

    const notificationText = notificationContainer.querySelector(
      ".completed-chek span"
    );

    const exitCompletedButton =
      notificationContainer.querySelector(".exit-completed");

    let message;
    let editMode = false;
    let currentUserId;

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

        // Проверка уникальности логина
        if (
          storedUsers.some(
            (user) => user.login === login && user.id !== currentUserId
          )
        ) {
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
      const newRow = `<tr class="table-section__tr font-regular" data-id="${
        userData.id
      }">
              <td>${userData.id}</td>
              <td>${userData.firstName}</td>
              <td>${userData.lastName}</td>
              <td>${userData.role}</td>
              <td>${userData.login}</td>
              <td>********</td>
              <td>${userData.phone}</td>
              ${
                userData.role !== "Главный администратор"
                  ? `<td><img src="../icons/edit.svg" alt="изменение" class="edit-button"></td>
                  <td><img src="../icons/delete.svg" alt="удаление" class="delete-button"></td>`
                  : `<td></td><td></td>`
              }
          </tr>`;

      tableBody.insertAdjacentHTML("beforeend", newRow);

      if (userData.role !== "Главный администратор") {
        tableBody
          .querySelector(`tr[data-id="${userData.id}"] .delete-button`)
          .addEventListener("click", () => {
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
      deleteUser(id);
      populateTable();
    };
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const roleSelect = document.querySelector("#role");

    if (currentUser && currentUser.role === "Администратор") {
      const adminOption = Array.from(roleSelect.options).find(
        (option) => option.value === "Главный администратор"
      );
      if (adminOption) {
        roleSelect.removeChild(adminOption);
      }
    }
    const deleteUser = (id) => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const storedUsers = getStoredUsers();
      const userToDelete = storedUsers.find((user) => user.id === id);

      if (
        currentUser.role !== "Главный администратор" &&
        userToDelete.role === "Главный администратор"
      ) {
        alert("Вы не имеете права удалять главного администратора.");
        return;
      }

      let updatedUsers = storedUsers.filter((user) => user.id !== id);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      populateTable();
    };

    const editUser = (userId) => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const storedUsers = getStoredUsers();
      const userToEdit = storedUsers.find((user) => user.id === userId);

      if (
        currentUser.role !== "Главный администратор" &&
        userToEdit.role === "Главный администратор"
      ) {
        alert("Вы не имеете права редактировать главного администратора.");
        return;
      }

      editMode = true;
      currentUserId = userId;
      document.querySelector("#firstName").value = userToEdit.firstName;
      document.querySelector("#lastName").value = userToEdit.lastName;
      document.querySelector("#phone").value = userToEdit.phone;
      document.querySelector("#role").value = userToEdit.role;
      document.querySelector("#login").value = userToEdit.login;

      overflowContainer.style.display = "block";
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
      event.target.value = event.target.value.replace(/\s+/g, "");
    };

    document
      .querySelector("#firstName")
      .addEventListener("input", removeSpaces);
    document.querySelector("#lastName").addEventListener("input", removeSpaces);
    document.querySelector("#login").addEventListener("input", removeSpaces);
    document.querySelector("#password").addEventListener("input", removeSpaces);

    const forma = document.querySelector(".add-user-form");

    const capitalizeFirstLetter = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    const allowOnlyRussianLettersInFirstName = (event) => {
      let value = event.target.value.replace(/[^а-яА-ЯёЁ]/g, "");
      event.target.value = capitalizeFirstLetter(value);
    };

    const allowOnlyRussianLettersInLastName = (event) => {
      let value = event.target.value.replace(/[^а-яА-ЯёЁ]/g, "");
      event.target.value = capitalizeFirstLetter(value);
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
      if (/.*[а-яА-ЯёЁ].*/.test(login)) {
        return {
          isValid: false,
          errorElementId: "loginError",
          errorMessage: "Логин не должен содержать русские символы.",
        };
      }
      if (/.*[а-яА-ЯёЁ].*/.test(password)) {
        return {
          isValid: false,
          errorElementId: "passwordError",
          errorMessage: "Пароль не должен содержать русские символы.",
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
}
if (titleTag.textContent != "security system") {
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
    const userNameSpan = logOutButton.querySelector(".user-name");

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && userNameSpan) {
      userNameSpan.textContent = `${
        currentUser.firstName
      } ${currentUser.lastName.charAt(0)}.`;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#form-sign-in");
  const errorMessageElement = document.querySelector(".error-message-log");

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
        localStorage.setItem("currentUser", JSON.stringify(user));

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

if (
  titleTag.textContent === "Отчет прошедших дежурств" ||
  titleTag.textContent === ""
) {
  const ctx = document.querySelector(".myPieChart").getContext("2d");
  let data = [13, 2];

  const createGradient = (color) => {
    const gradient = ctx.createRadialGradient(100, 100, 0, 110, 120, 90);
    gradient.addColorStop(0, "rgba(128, 128, 128, 0.5)");
    gradient.addColorStop(1, color);
    return gradient;
  };

  const myPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Число выполненных дежурств", "Число замененных дежурств"],
      datasets: [
        {
          label: "Мои данные",
          data: data,
          backgroundColor: [
            createGradient("#77C375"),
            createGradient("#D05AFF"),
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "50%",
      plugins: {
        legend: {
          display: false,
          position: "top",
        },
      },
    },
  });
}

if (titleTag.textContent === "График") {
  document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 2; // Месяцы в JavaScript начинаются с 0
    const monthName = today.toLocaleString("ru-RU", { month: "long" });
    const monthElement = document.querySelector(".month");
    monthElement.textContent = monthName;

    // Переменная для хранения статуса системы
    let systemStatus = "Запрос не возможен";
    let firstDate = null; // Переменная для хранения выбранной даты
    let secondDate = null;

    const firstDayOfMonth = new Date(year, month - 1, 1);
    const startDayIndex = firstDayOfMonth.getDay();
    const dayOffset = startDayIndex === 0 ? 6 : startDayIndex - 1;

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPreviousMonth = new Date(year, month - 1, 0).getDate();

    const dateElements = document.querySelectorAll(".calendar .date");
    let dateCounter = 1;

    for (let i = 0; i < dateElements.length; i++) {
      if (i >= dayOffset && dateCounter <= daysInMonth) {
        dateElements[i].textContent = dateCounter;
        dateElements[i].classList.remove("empty");
        dateCounter++;
      } else if (i < dayOffset) {
        dateElements[i].textContent = daysInPreviousMonth - dayOffset + i + 1;
        dateElements[i].classList.add("empty");
      } else {
        const nextMonthDayCounter = dateCounter - daysInMonth;
        dateElements[i].textContent = nextMonthDayCounter;
        dateElements[i].classList.add("empty");
        dateCounter++;
      }
    }

    const getStoredUsers = () =>
      JSON.parse(localStorage.getItem("users")) || [];

    const assignUsersToWork = () => {
      const storedUsers = getStoredUsers();
      const schedules = JSON.parse(localStorage.getItem("schedules")) || {};

      if (!schedules[year]) {
        schedules[year] = {};
      }
      if (!schedules[year][month]) {
        schedules[year][month] = {};
      }

      const halfSize = Math.ceil(storedUsers.length / 2);
      const group1 = storedUsers.slice(0, halfSize);
      const group2 = storedUsers.slice(halfSize);

      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${String(year).padStart(4, "0")}-${String(
          month
        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        if (!schedules[year][month][dateKey]) {
          schedules[year][month][dateKey] = { user: {} };
        }

        const scheduleDate = new Date(year, month - 1, day);

        let assignedGroup;

        if ((day - 1) % 4 < 2) {
          assignedGroup = group1;
        } else {
          assignedGroup = group2;
        }

        assignedGroup.forEach((user) => {
          let userStatus;
          const currentHourMSK = today.getUTCHours() + 3; // Учитываем московское время (UTC+3)

          if (scheduleDate.toDateString() === today.toDateString()) {
            if (currentHourMSK >= 8 && currentHourMSK < 20) {
              // С 8:00 до 20:00
              userStatus = {
                note: ["дежурство проходит без инцидентов"],
                status: "текущее",
              };
            } else if (currentHourMSK === 20 && today.getMinutes() >= 1) {
              // После 20:01
              userStatus = {
                note: ["дежурство прошло без инцидентов"],
                status: "выполненное",
              };
            } else {
              userStatus = { note: [], status: "будущее" };
            }
          } else if (scheduleDate < today) {
            userStatus = {
              note: ["дежурство прошло без инцидентов"],
              status: "выполненное",
            };
          } else {
            userStatus = { note: [], status: "будущее" };
          }

          schedules[year][month][dateKey].user[user.id] = userStatus;
        });
      }

      localStorage.setItem("schedules", JSON.stringify(schedules));
    };

    assignUsersToWork();

    const highlightUserStatusInCalendar = () => {
      const currentUserStr = localStorage.getItem("currentUser");
      if (!currentUserStr) return;

      const currentUser = JSON.parse(currentUserStr);
      const currentUserId = currentUser.id;

      if (!currentUserId) return;

      const schedules = JSON.parse(localStorage.getItem("schedules")) || {};

      if (!schedules[year] || !schedules[year][month]) return;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${String(year).padStart(4, "0")}-${String(
          month
        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        if (schedules[year][month][dateKey]) {
          const userSchedule =
            schedules[year][month][dateKey].user[currentUserId];

          if (userSchedule) {
            const dateElementIndex = day + dayOffset - 1;

            if (dateElements[dateElementIndex]) {
              switch (userSchedule.status) {
                case "текущее":
                  dateElements[dateElementIndex].classList.add("current");
                  console.log(`Добавлен класс 'current' для ${dateKey}`);
                  break;
                case "выполненное":
                  dateElements[dateElementIndex].classList.add("completed");
                  console.log(`Добавлен класс 'completed' для ${dateKey}`);
                  break;
                case "будущее":
                  dateElements[dateElementIndex].classList.add("future");
                  console.log(`Добавлен класс 'future' для ${dateKey}`);
                  break;
                case "wait_start_date": // Добавлено для нового статуса
                  dateElements[dateElementIndex].classList.add(
                    "wait_start_date"
                  );
                  console.log(
                    `Добавлен класс 'wait_start_date' для ${dateKey}`
                  );
                  break;
              }
            }
          }
        }
      }
    };

    highlightUserStatusInCalendar();

    // Функция для обновления статусов пользователей на wait_start_date
    const updateUserStatusToWaitStartDate = () => {
      const currentUserStr = localStorage.getItem("currentUser");
      if (!currentUserStr) return;

      const currentUser = JSON.parse(currentUserStr);
      const currentUserId = currentUser.id;

      if (!currentUserId) return;

      const schedules = JSON.parse(localStorage.getItem("schedules")) || {};

      if (!schedules[year] || !schedules[year][month]) return;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${String(year).padStart(4, "0")}-${String(
          month
        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        if (schedules[year][month][dateKey]) {
          const userSchedule =
            schedules[year][month][dateKey].user[currentUserId];

          if (userSchedule && userSchedule.status === "будущее") {
            userSchedule.status = "wait_start_date"; // Изменяем статус
            // Обновляем localStorage
            schedules[year][month][dateKey].user[currentUserId] = userSchedule;
          }
        }
      }

      localStorage.setItem("schedules", JSON.stringify(schedules));
    };

    // Функция для сброса классов wait_start_date на future
    const resetWaitStartDateToFutureClassesOnlyIfSystemStatusIsNotPossible =
      () => {
        if (systemStatus === "Запрос не возможен") {
          // Проверка статуса системы
          dateElements.forEach((dateElement) => {
            const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(
              dateElement.textContent
            ).padStart(2, "0")}`;

            firstDate = null;
            secondDate = null;
            // Проверяем, если firstDate не null и совпадает с текущей датой
            if (
              dateElement.classList.contains("wait_start_date") &&
              firstDate !== dateKey
            ) {
              dateElement.classList.remove("wait_start_date"); // Убираем класс wait_start_date
              dateElement.classList.add("future"); // Добавляем класс future
              console.log(
                `Класс 'wait_start_date' заменен на 'future' для даты ${dateElement.textContent}`
              );
            }

            // Сбрасываем класс wait_end_date
            if (dateElement.classList.contains("wait_end_date")) {
              dateElement.classList.remove("wait_end_date"); // Убираем класс wait_end_date
              console.log(
                `Класс 'wait_end_date' заменен на 'future' для даты ${dateElement.textContent}`
              );
            }
          });
        }
      };

    // Переключение видимости блоков с кнопками при нажатии на кнопки.

    const editButtonBlockDefault = document.querySelector(
      ".button-block__with-quest-defolt"
    );
    const newButtonBlock = document.querySelector(".new-button-block");

    document.querySelector(".edit-btn").addEventListener("click", () => {
      // Меняем статус системы на "Запрос возможен"
      systemStatus = "Запрос возможен";
      console.log(systemStatus);

      // Обновляем статусы пользователей
      updateUserStatusToWaitStartDate();

      // Обновляем отображение в календаре
      highlightUserStatusInCalendar(); // Снова вызываем для отражения изменений

      editButtonBlockDefault.style.display = "none";
      newButtonBlock.style.display = "flex";

      // Показываем уведомление с анимацией
      const notificationBlock = document.querySelector(".notif-edit");

      notificationBlock.classList.add("show");
      notificationBlock.style.display = "flex";

      setTimeout(() => {
        notificationBlock.classList.remove("show");
        setTimeout(() => {
          notificationBlock.style.display = "flex";
        }, 500);
      }, 3000);
    });

    document.querySelector(".cancel-btn").addEventListener("click", () => {
      editButtonBlockDefault.style.display = "flex";
      newButtonBlock.style.display = "none";

      highlightUserStatusInCalendar();

      const notificationBlock = document.querySelector(".notif-edit");

      notificationBlock.classList.remove("show");

      setTimeout(() => {
        notificationBlock.style.display = "flex";
      }, 500);

      // Меняем статус системы обратно на "Запрос не возможен"
      systemStatus = "Запрос не возможен";

      resetWaitStartDateToFutureClassesOnlyIfSystemStatusIsNotPossible();
      // Сбрасываем клики
      firstDate = null;
      secondDate = null;
      console.log(firstDate);
      console.log(systemStatus);
    });

    // Добавляем обработчик событий для дат с классом wait_start_date
    dateElements.forEach((dateElement) => {
      dateElement.addEventListener("click", () => {
        if (dateElement.classList.contains("wait_start_date")) {
          firstDate = `${year}-${String(month).padStart(
            2,
            "0"
          )}-${dateElement.textContent.padStart(2, "0")}`;
          console.log(`Выбрана дата: ${firstDate}`);
          // Здесь можно добавить дополнительную логику обработки выбранной даты

          // Сбрасываем классы wait_start_date на future, кроме firstDate
          resetWaitStartDateToFutureClasses();
        }
      });
    });

    // Функция для сброса классов wait_start_date на future
    // Добавляем обработчик событий для дат с классом wait_start_date

    dateElements.forEach((dateElement) => {
      dateElement.addEventListener("click", () => {
        if (dateElement.classList.contains("wait_start_date")) {
          // Сохраняем первую дату
          firstDate = `${year}-${String(month).padStart(
            2,
            "0"
          )}-${dateElement.textContent.padStart(2, "0")}`;
          console.log(`Выбрана первая дата: ${firstDate}`);

          // Сбрасываем классы wait_start_date на future, кроме firstDate
          resetWaitStartDateToFutureClasses();
        } else if (dateElement.classList.contains("wait_end_date")) {
          // Сохраняем вторую дату
          secondDate = `${year}-${String(month).padStart(
            2,
            "0"
          )}-${dateElement.textContent.padStart(2, "0")}`;
          console.log(`Выбрана вторая дата: ${secondDate}`);

          // Убираем классы wait_end_date и future для выбранной даты
          dateElement.classList.add("wait_end_date");
          dateElement.classList.remove("future");

          // Сбрасываем все остальные wait_end_date на future, кроме secondDate
          resetWaitEndDates();
        }
      });
    });

    const resetWaitEndDates = () => {
      dateElements.forEach((dateElement) => {
        const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(
          dateElement.textContent
        ).padStart(2, "0")}`;

        // Проверяем, если secondDate не null и совпадает с текущей датой
        if (
          dateElement.classList.contains("wait_end_date") &&
          secondDate !== dateKey
        ) {
          dateElement.classList.remove("wait_end_date"); // Убираем класс wait_end_date
          dateElement.classList.remove("future"); // Добавляем класс future
        }
      });
    };

    // Функция для сброса классов wait_start_date на future
    const resetWaitStartDateToFutureClasses = () => {
      dateElements.forEach((dateElement) => {
        const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(
          dateElement.textContent
        ).padStart(2, "0")}`;

        // Проверяем, если firstDate не null и совпадает с текущей датой
        if (
          dateElement.classList.contains("wait_start_date") &&
          firstDate !== dateKey
        ) {
          dateElement.classList.remove("wait_start_date"); // Убираем класс wait_start_date
          dateElement.classList.remove("future"); // Убираем класс future
          console.log(
            `Класс 'wait_start_date' заменен на 'future' для даты ${dateElement.textContent}`
          );

          // Проверка на наличие даты в графике дежурств текущего пользователя
          const schedules = JSON.parse(localStorage.getItem("schedules")) || {};
          const currentUserStr = localStorage.getItem("currentUser");

          if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            const currentUserId = currentUser.id;

            console.log("Текущий пользователь:", currentUser);
            console.log("ID текущего пользователя:", currentUserId);

            // Проверяем наличие расписания для текущего года и месяца
            if (!schedules[year]) {
              console.log(`Нет расписания для года ${year}`);
              return;
            }
            if (!schedules[year][month]) {
              console.log(`Нет расписания для месяца ${month}`);
              return;
            }

            dateElements.forEach((dateElement) => {
              const dateKey = `${year}-${String(month).padStart(
                2,
                "0"
              )}-${String(dateElement.textContent).padStart(2, "0")}`;

              const userSchedule = schedules[year][month][dateKey];

              // Логируем информацию о расписании
              console.log(`Расписание на ${dateKey}:`, userSchedule);

              // Проверяем наличие пользователя в расписании и класс .empty
              if (
                !dateElement.classList.contains("empty") &&
                (!userSchedule ||
                  !userSchedule.user ||
                  !userSchedule.user[currentUserId])
              ) {
                // Если дата отсутствует в графике дежурств и не является пустой, добавляем класс wait_end_date
                dateElement.classList.add("wait_end_date");
                console.log(
                  `Класс 'wait_end_date' добавлен для даты ${dateElement.textContent}`
                );
              } else {
                console.log(
                  `Пользователь ${currentUserId} найден в расписании на ${dateKey} или дата пустая.`
                );
              }
            });
          } else {
            console.log("Текущий пользователь не найден в localStorage.");
          }
        }
      });
    };

    const submitButton = document.querySelector(".submit-btn");

    // Добавляем обработчик события на кнопку
    submitButton.addEventListener("click", () => {
      // Проверяем, равны ли firstDate и secondDate null
      if (firstDate === null || secondDate === null) {
        // Вызываем функцию для отображения уведомления
        const notificationBlock = document.querySelector(".notif-edit");

        notificationBlock.classList.add("show");
        notificationBlock.style.display = "flex";

        setTimeout(() => {
          notificationBlock.classList.remove("show");
          setTimeout(() => {
            notificationBlock.style.display = "flex";
          }, 500);
        }, 3000);

        return; // Прерываем выполнение функции, не меняя статус системы
      }

      // Проверяем, заполнены ли обе даты
      if (firstDate !== null && secondDate !== null) {
        // Получаем текущего пользователя из localStorage
        const currentUserStr = localStorage.getItem("currentUser");
        let currentUserId = null;

        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          currentUserId = currentUser.id;
        }

        // Создаем объект wait с уникальной датой запроса
        const now = new Date();
        const requestDateKey = `${
          now.getMonth() + 1
        }-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
        // Получаем существующий объект wait из localStorage или создаем новый
        const waitData = JSON.parse(localStorage.getItem("wait")) || {};

        // Добавляем новую запись с текущей датой запроса
        waitData[requestDateKey] = {
          user: {
            userId: currentUserId,
            firstDate: firstDate,
            secondDate: secondDate,
          },
          replacedUserId: null,
          statusWait: "ожидание",
        };

        // Сохраняем обновленный объект wait в localStorage
        localStorage.setItem("wait", JSON.stringify(waitData));

        // Меняем статус системы на "Запрос отправлен"
        systemStatus = "Запрос отправлен";
        console.log(`Статус системы изменен на: ${systemStatus}`);
        showCompletionWindow();
      }
    });
    const showCompletionWindow = () => {
      const completionWindow = document.createElement("div");
      completionWindow.className = "owerflow-complitede";
      completionWindow.style.display = "flex";
      completionWindow.innerHTML = `
          <div class="completed-wrapper font-regular-menu">
              <span class="exit-completed"><img src="../icons/krest.svg" alt="cross"></span>
              <div class="completed-chek" style="gap: 30px">
                  <span>Запрос отправлен</span>
                  <span><img src="../icons/checkbox.svg" alt=""></span>
              </div>
          </div>
      `;

      // Находим элемент, куда будем добавлять окно
      const calendarBlock = document.querySelector(".calendar-block");

      // Добавляем окно в указанный элемент
      calendarBlock.appendChild(completionWindow);

      // Добавляем обработчик события для закрытия окна по клику на крестик
      const exitButton = completionWindow.querySelector(".exit-completed");
      exitButton.addEventListener("click", () => {
        calendarBlock.removeChild(completionWindow);
        systemStatus = "Запрос не возможен"; // Возвращаем статус системы
        newButtonBlock.style.display = "none";
        editButtonBlockDefault.style.display = "flex";
        location.reload();
      });

      // Удаляем окно через 3 секунды, если не закрыто вручную
      setTimeout(() => {
        if (document.body.contains(completionWindow)) {
          calendarBlock.removeChild(completionWindow);
          systemStatus = "Запрос не возможен"; // Возвращаем статус системы
          console.log(`Статус системы изменен на: ${systemStatus}`);
          newButtonBlock.style.display = "none";
          editButtonBlockDefault.style.display = "flex";
          location.reload();
        }
      }, 3000);
    };


    // Функция для отображения дат из объекта wait для текущего пользователя
    const displayUserDatesFromLocalStorage = () => {
      // Получаем текущего пользователя из localStorage
      const currentUserStr = localStorage.getItem("currentUser");
      let currentUserId = null;

      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        currentUserId = currentUser.id; // Предполагаем, что id пользователя хранится в поле id
      }

      // Извлекаем объект wait из localStorage
      const waitData = JSON.parse(localStorage.getItem("wait"));

      // Проверяем, существует ли waitData
      if (waitData && currentUserId !== null) {
        // Проходим по всем записям в waitData
        for (const dateKey in waitData) {
          if (waitData.hasOwnProperty(dateKey)) {
            const userData = waitData[dateKey].user;

            // Проверяем, соответствует ли userId текущему пользователю
            if (userData.userId === currentUserId) {
              const firstDate = userData.firstDate; // "2024-12-26"
              const secondDate = userData.secondDate; // "2024-12-27"

              // Преобразуем даты в формат DD для поиска элементов
              const firstDateDay = new Date(firstDate).getDate(); // Получаем день месяца
              const secondDateDay = new Date(secondDate).getDate(); // Получаем день месяца

              // Находим все элементы с классом .date
              const dateElements = document.querySelectorAll(".calendar .date");

              dateElements.forEach((dateElement) => {
                const dayNumber = parseInt(dateElement.textContent, 10); // Получаем текстовое содержание элемента

                // Пропускаем элементы с классом .empty
                if (dateElement.classList.contains("empty")) {
                  return; // Прерываем текущую итерацию цикла
                }

                // Добавляем классы для отображения статусов
                if (dayNumber === firstDateDay) {
                  dateElement.classList.add("wait_start_date-local"); // Добавляем класс для первой даты
                } else if (dayNumber === secondDateDay) {
                  dateElement.classList.add("wait_end_date-local"); // Добавляем класс для второй даты
                }
              });
            }
          }
        }
      } else {
        console.warn("Нет данных о пользователе или объект wait не найден.");
      }
    };

    // Вызов функции для отображения дат при загрузке страницы или в нужный момент
    displayUserDatesFromLocalStorage();
  });
}
