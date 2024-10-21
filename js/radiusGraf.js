// Шаг 2: Создание диаграммы
const ctx = document.querySelector('.myPieChart').getContext('2d');
let data = [13, 1, 2]; // Начальные данные

// Создаем радиальный градиент
const createGradient = (color) => {
    const gradient = ctx.createRadialGradient(100, 100, 0, 110, 120, 90); // Радиальный градиент
    gradient.addColorStop(0, 'rgba(128, 128, 128, 0.5)'); // Центр (серый)
    gradient.addColorStop(1, color); // Конечный цвет
    return gradient;
};

const myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Число выполненых дежурств', 'Число пропущенных дежурств', 'Число замененных дежурств'],
        datasets: [{
            label: 'Мои данные',
            data: data,
            backgroundColor: [
                createGradient('#77C375'), // Градиент для первого сектора
                createGradient('#BB4141'), // Градиент для второго сектора
                createGradient('#D05AFF')   // Градиент для третьего сектора
            ],
            borderWidth: 0 // Убираем границы
        }]
    },
    options: {
        responsive: true,
        cutout: '50%', // Устанавливаем пустой центр
        plugins: {
            legend: {
                display: false,
                position: 'top',
            },
        }
    }
});

// Шаг 3: Функция для обновления данных
function updateData() {
    // Генерация новых данных
    data = data.map(value => Math.floor(Math.random() * 100)); // Случайные значения от 0 до 99
    myPieChart.data.datasets[0].data = data; // Обновление данных в диаграмме
    myPieChart.update(); // Обновление отображения диаграммы
}