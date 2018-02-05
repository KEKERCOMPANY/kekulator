const button = document.getElementById("calc");

button.addEventListener("click", () => {
    // Массив стандартных полей JSON-файла, полученного с Nanopool
    const keys = ["account", "unconfirmed_balance", "balance", "hashrate", "avgHashrate", "workers"].toString();
    let previous, current;

    try {
        previous = JSON.parse(document.getElementById("previous").value);
        current = JSON.parse(document.getElementById("current").value);
    }
    catch (error) {
        alertValidationError();
    }

    // Если хотя бы в одной из переменных (previous / current) ничего не сохранено,
    // то прерываем выполнение метода
    if (previous === undefined || current === undefined) {
        return;
    }

    
    // Если аккаунты различается, выводим сообщение об ошибке
    if (previous.account !== current.account) {
        alertValidationError();
    }

    // Если список полей не соответствуют шаблону, выводим сообщение об ошибке
    if (Object.keys(previous).toString() !== keys || Object.keys(current).toString() !== keys) {
        alertValidationError();
    }

    // Если список worker'ов различается, выводим сообщение об ошибке
    if (getIds(previous.workers) !== getIds(current.workers)) {
        alertValidationError();
    }


    const sharePrice = calcSharePrice(previous, current);
    alert("Размер выплаты за нахождение одного share'а: " + sharePrice + " XMR");
});

/**
 * Выводит сообщение об ошибке валидации
 */
function alertValidationError() {
    alert("Входные данные не соответствуют шаблону или неверны");
}

/**
 * Возвращает список идентификаторов worker'ов
 * @param workersList Массив worker'ов
 * @returns {string} Список идентификаторов, преобразованный в строку
 */
function getIds(workersList) {
    const ids = [];

    for (let i = 0; i < workersList.length; i++) {
        const worker = workersList[i];

        ids.push(worker.id);
    }

    return ids.toString();
}

/**
 * Вычисляет размер выплаты за нахождение одного share'а
 * @param previous Предыдущие данные, полученные с Nanopool
 * @param current Текущие данные, полученные с Nanopool
 * @returns {number} Вычисленный размер выплаты
 */
function calcSharePrice(previous, current) {
    // Вычисляем текущий и предудущий балансы
    const currentBalance = Number.parseFloat(current.balance) + Number.parseFloat(current.unconfirmed_balance);
    const previousBalance = Number.parseFloat(previous.balance) + Number.parseFloat(previous.unconfirmed_balance);

    const deltaBalance = currentBalance - previousBalance; // Разность балансов
    let deltaShares = 0; // Сумма рейтингов всех майнеров (за период времени между двумя входными данными)

    for (let i = 0; i < previous.workers.length; i++) {
        const previousWorker = previous.workers[i];
        const currentWorker = current.workers[i];

        deltaShares += (currentWorker.rating - previousWorker.rating);
    }

    return deltaBalance / deltaShares;
}