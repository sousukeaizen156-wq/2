/* ============================================================
   BMW CATALOG 2.0
   ОСНОВНАЯ ЛОГИКА ПРИЛОЖЕНИЯ

   Поддерживает:
   - серии и модели
   - поколения
   - двигатели
   - поиск
   - расширенные фильтры
   - сортировку
   - избранное ❤️
   - сравнение ⚖️
   - localStorage
   - мобильную навигацию
   ============================================================ */

(() => {
    "use strict";

    /* ============================================================
       1. ГЛОБАЛЬНАЯ БАЗА
       ============================================================ */

    window.BMW_DATA = window.BMW_DATA || {};

    /*
     * В будущем каждый файл:
     * data/classic.js
     * data/series1.js
     * data/series2.js
     * ...
     *
     * будет добавлять данные в window.BMW_DATA.
     */


    /* ============================================================
       2. КЛЮЧИ LOCAL STORAGE
       ============================================================ */

    const STORAGE_KEYS = {
        favorites: "bmw_catalog_favorites_v2",
        compare: "bmw_catalog_compare_v2"
    };


    /* ============================================================
       3. СОСТОЯНИЕ ПРИЛОЖЕНИЯ
       ============================================================ */

    const state = {

        screen: "home",

        series: null,

        model: null,

        generation: null,

        engineIndex: 0,

        search: "",

        basicFilter: "all",

        advancedFilters: {
            yearFrom: "",
            yearTo: "",
            body: "all",
            drive: "all",
            powerFrom: "",
            powerTo: "",
            fuel: "all",
            sort: "default"
        },

        favorites: loadStorage(
            STORAGE_KEYS.favorites,
            []
        ),

        compare: loadStorage(
            STORAGE_KEYS.compare,
            []
        )

    };


    /* ============================================================
       4. DOM
       ============================================================ */

    const elements = {

        homeScreen:
            document.getElementById("homeScreen"),

        modelsScreen:
            document.getElementById("modelsScreen"),

        generationsScreen:
            document.getElementById("generationsScreen"),

        carScreen:
            document.getElementById("carScreen"),

        detailsScreen:
            document.getElementById("detailsScreen"),

        seriesGrid:
            document.getElementById("seriesGrid"),

        modelsGrid:
            document.getElementById("modelsGrid"),

        generationsGrid:
            document.getElementById("generationsGrid"),

        searchInput:
            document.getElementById("searchInput"),

        clearSearch:
            document.getElementById("clearSearch"),

        searchResults:
            document.getElementById("searchResults"),

        searchResultsGrid:
            document.getElementById("searchResultsGrid"),

        searchCount:
            document.getElementById("searchCount"),

        backButton:
            document.getElementById("backButton"),

        homeButton:
            document.getElementById("homeButton"),

        modelsLabel:
            document.getElementById("modelsLabel"),

        modelsTitle:
            document.getElementById("modelsTitle"),

        modelsSubtitle:
            document.getElementById("modelsSubtitle"),

        generationsLabel:
            document.getElementById("generationsLabel"),

        generationsTitle:
            document.getElementById("generationsTitle"),

        carImage:
            document.getElementById("carImage"),

        carYear:
            document.getElementById("carYear"),

        carGeneration:
            document.getElementById("carGeneration"),

        carTitle:
            document.getElementById("carTitle"),

        carBody:
            document.getElementById("carBody"),

        engineSection:
            document.getElementById("engineSection"),

        engineTabs:
            document.getElementById("engineTabs"),

        specHp:
            document.getElementById("specHp"),

        specTorque:
            document.getElementById("specTorque"),

        specAccel:
            document.getElementById("specAccel"),

        specSpeed:
            document.getElementById("specSpeed"),

        specEngine:
            document.getElementById("specEngine"),

        specTransmission:
            document.getElementById("specTransmission"),

        specDrive:
            document.getElementById("specDrive"),

        specWeight:
            document.getElementById("specWeight"),

        detailsButton:
            document.getElementById("detailsButton"),

        detailsGeneration:
            document.getElementById("detailsGeneration"),

        detailsTitle:
            document.getElementById("detailsTitle"),

        detailsDescription:
            document.getElementById("detailsDescription"),

        detailsYears:
            document.getElementById("detailsYears"),

        detailsTech:
            document.getElementById("detailsTech"),

        detailsVersion:
            document.getElementById("detailsVersion"),

        detailsFacts:
            document.getElementById("detailsFacts")

    };


    /* ============================================================
       5. SERIES ORDER
       ============================================================ */

    const SERIES_ORDER = [
        "classic",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "x",
        "z",
        "m",
        "i"
    ];


    const SERIES_LABELS = {

        classic: "Классика",

        one: "1 Серия",
        two: "2 Серия",
        three: "3 Серия",
        four: "4 Серия",
        five: "5 Серия",
        six: "6 Серия",
        seven: "7 Серия",
        eight: "8 Серия",

        x: "X Серия",
        z: "Z Серия",

        m: "M Серия",
        i: "I Серия"

    };


    const SPECIAL_SERIES = [
        "x",
        "z",
        "m",
        "i"
    ];


    /* ============================================================
       6. СОХРАНЕНИЕ / ЗАГРУЗКА
       ============================================================ */

    function loadStorage(key, fallback) {

        try {

            const raw =
                localStorage.getItem(key);

            if (!raw) {
                return fallback;
            }

            const parsed =
                JSON.parse(raw);

            return parsed;

        } catch (error) {

            console.warn(
                "BMW Catalog: storage error",
                error
            );

            return fallback;
        }
    }


    function saveStorage(key, value) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

        } catch (error) {

            console.warn(
                "BMW Catalog: cannot save storage",
                error
            );

        }
    }


    /* ============================================================
       7. НОРМАЛИЗАЦИЯ
       ============================================================ */

    function normalize(value) {

        return String(value ?? "")
            .toLowerCase()
            .replace(/ё/g, "е")
            .trim();

    }


    function parseNumber(value) {

        if (
            value === undefined ||
            value === null
        ) {
            return 0;
        }

        const cleaned =
            String(value)
                .replace(",", ".")
                .replace(/[^\d.]/g, "");

        const number =
            parseFloat(cleaned);

        return Number.isFinite(number)
            ? number
            : 0;
    }


    function parseYearRange(value) {

        const text =
            String(value ?? "");

        const years =
            text.match(/\d{4}/g);

        if (!years || !years.length) {

            return {
                from: 0,
                to: 0
            };

        }

        const numbers =
            years.map(Number);

        return {

            from:
                Math.min(...numbers),

            to:
                Math.max(...numbers)

        };
    }


    /* ============================================================
       8. ПОЛУЧЕНИЕ ВСЕХ АВТОМОБИЛЕЙ
       ============================================================ */

    function getAllCars() {

        const cars = [];

        for (
            const [seriesKey, seriesData]
            of Object.entries(window.BMW_DATA)
        ) {

            if (
                !seriesData ||
                !seriesData.models
            ) {
                continue;
            }


            for (
                const [modelKey, modelData]
                of Object.entries(seriesData.models)
            ) {

                if (
                    !modelData ||
                    !modelData.generations
                ) {
                    continue;
                }


                for (
                    const [generationKey, generation]
                    of Object.entries(modelData.generations)
                ) {

                    const engines =
                        Array.isArray(
                            generation.engines
                        )
                            ? generation.engines
                            : [];


                    const years =
                        parseYearRange(
                            generation.year
                        );


                    const firstEngine =
                        engines[0] || {};


                    const id =
                        [
                            seriesKey,
                            modelKey,
                            generationKey
                        ].join("::");


                    cars.push({

                        id,

                        seriesKey,

                        seriesTitle:
                            seriesData.title ||
                            SERIES_LABELS[seriesKey] ||
                            seriesKey,

                        seriesSubtitle:
                            seriesData.subtitle || "",

                        modelKey,

                        modelName:
                            modelData.name || "",

                        modelDescription:
                            modelData.desc || "",

                        generationKey,

                        generationName:
                            generation.name || "",

                        tag:
                            generation.tag || "",

                        year:
                            generation.year || "",

                        yearFrom:
                            years.from,

                        yearTo:
                            years.to,

                        body:
                            generation.body || "",

                        image:
                            generation.image ||
                            "./images/placeholder.jpg",

                        engines,

                        firstEngine,

                        detailed:
                            generation.detailed ||
                            {}

                    });

                }

            }

        }


        return cars;
    }


    /* ============================================================
       9. ПОЛУЧЕНИЕ АВТО ПО ID
       ============================================================ */

    function getCarById(id) {

        return getAllCars()
            .find(
                car => car.id === id
            );

    }


    /* ============================================================
       10. FILTER — ОСНОВНЫЕ КАТЕГОРИИ
       ============================================================ */

    function matchesBasicFilter(car) {

        switch (state.basicFilter) {

            case "classic":

                return (
                    car.seriesKey === "classic"
                );


            case "series":

                return (
                    [
                        "one",
                        "two",
                        "three",
                        "four",
                        "five",
                        "six",
                        "seven",
                        "eight"
                    ].includes(
                        car.seriesKey
                    )
                );


            case "special":

                return (
                    SPECIAL_SERIES.includes(
                        car.seriesKey
                    )
                );


            case "all":

            default:

                return true;
        }
    }


    /* ============================================================
       11. ADVANCED FILTERS
       ============================================================ */

    function matchesAdvancedFilters(car) {

        const filters =
            state.advancedFilters;


        /* ---------- ГОД ---------- */

        if (filters.yearFrom) {

            const yearFrom =
                Number(filters.yearFrom);

            if (
                car.yearTo &&
                car.yearTo < yearFrom
            ) {
                return false;
            }

        }


        if (filters.yearTo) {

            const yearTo =
                Number(filters.yearTo);

            if (
                car.yearFrom &&
                car.yearFrom > yearTo
            ) {
                return false;
            }

        }


        /* ---------- КУЗОВ ---------- */

        if (
            filters.body !== "all"
        ) {

            if (
                normalize(car.body)
                    .indexOf(
                        normalize(filters.body)
                    ) === -1
            ) {
                return false;
            }

        }


        /* ---------- ПРИВОД ---------- */

        if (
            filters.drive !== "all"
        ) {

            const drives =
                car.engines.map(
                    engine =>
                        normalize(
                            engine.drive
                        )
                );


            const wanted =
                normalize(
                    filters.drive
                );


            const matches =
                drives.some(
                    drive =>
                        drive.includes(wanted)
                );


            if (!matches) {
                return false;
            }

        }


        /* ---------- ТИП СИЛОВОЙ УСТАНОВКИ ---------- */

        if (
            filters.fuel !== "all"
        ) {

            const engineTypes =
                car.engines.map(
                    engine =>
                        normalize(
                            engine.engineType
                        )
                );


            const wanted =
                normalize(
                    filters.fuel
                );


            const matches =
                engineTypes.some(
                    type =>
                        type.includes(wanted)
                );


            if (!matches) {
                return false;
            }

        }


        /* ---------- МОЩНОСТЬ ---------- */

        const maxPower =
            car.engines.reduce(

                (
                    max,
                    engine
                ) => {

                    return Math.max(
                        max,
                        parseNumber(
                            engine.hp
                        )
                    );

                },

                0
            );


        if (filters.powerFrom) {

            if (
                maxPower <
                Number(filters.powerFrom)
            ) {
                return false;
            }

        }


        if (filters.powerTo) {

            if (
                maxPower >
                Number(filters.powerTo)
            ) {
                return false;
            }

        }


        return true;
    }


    /* ============================================================
       12. SEARCH
       ============================================================ */

    function matchesSearch(car) {

        const query =
            normalize(
                state.search
            );


        if (!query) {
            return true;
        }


        const searchableText = [

            car.seriesTitle,

            car.modelName,

            car.modelDescription,

            car.generationName,

            car.tag,

            car.year,

            car.body,

            ...car.engines.map(
                engine => engine.name
            ),

            ...car.engines.map(
                engine => engine.engineType
            )

        ]
            .join(" ")
            .toLowerCase();


        return searchableText.includes(
            query
        );
    }


    /* ============================================================
       13. СОРТИРОВКА
       ============================================================ */

    function sortCars(cars) {

        const sort =
            state.advancedFilters.sort;


        if (sort === "name") {

            return cars.sort(
                (a, b) =>
                    a.modelName.localeCompare(
                        b.modelName,
                        "ru"
                    )
            );
        }


        if (sort === "year_new") {

            return cars.sort(
                (a, b) =>
                    b.yearTo - a.yearTo
            );
        }


        if (sort === "year_old") {

            return cars.sort(
                (a, b) =>
                    a.yearFrom - b.yearFrom
            );
        }


        if (sort === "power") {

            return cars.sort(
                (a, b) => {

                    const powerA =
                        Math.max(
                            ...a.engines.map(
                                engine =>
                                    parseNumber(
                                        engine.hp
                                    )
                            ),
                            0
                        );

                    const powerB =
                        Math.max(
                            ...b.engines.map(
                                engine =>
                                    parseNumber(
                                        engine.hp
                                    )
                            ),
                            0
                        );

                    return powerB - powerA;
                }
            );
        }


        return cars;
    }


    /* ============================================================
       14. ПОЛУЧЕНИЕ РЕЗУЛЬТАТОВ
       ============================================================ */

    function getFilteredCars() {

        let cars =
            getAllCars()
                .filter(
                    matchesBasicFilter
                )
                .filter(
                    matchesAdvancedFilters
                )
                .filter(
                    matchesSearch
                );


        cars =
            sortCars(cars);


        return cars;
    }


    /* ============================================================
       15. РЕНДЕР ГЛАВНОЙ
       ============================================================ */

    function renderHome() {

        renderFilterControls();

        renderSeriesGrid();

        renderSearchResults();

        updateFavoriteAndCompareUI();
    }


    /* ============================================================
       16. КАРТОЧКИ СЕРИЙ
       ============================================================ */

    function renderSeriesGrid() {

        if (!elements.seriesGrid) {
            return;
        }


        const existingSeries =
            Object.keys(
                window.BMW_DATA
            );


        const seriesKeys =
            SERIES_ORDER.filter(
                key =>
                    existingSeries.includes(key)
            );


        elements.seriesGrid.innerHTML = "";


        for (
            const seriesKey
            of seriesKeys
        ) {

            const seriesData =
                window.BMW_DATA[
                    seriesKey
                ];


            if (
                !seriesData ||
                !seriesData.models
            ) {
                continue;
            }


            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "series-card";


            const image =
                getSeriesImage(
                    seriesKey,
                    seriesData
                );


            card.innerHTML = `

                <div
                    class="card-bg"
                    style="
                        background-image:
                        url('${escapeAttribute(image)}');
                    "
                ></div>

                <div class="card-gradient"></div>

                <div class="card-content">

                    <span class="card-tag">
                        ${escapeHtml(
                            getSeriesTag(
                                seriesKey
                            )
                        )}
                    </span>

                    <h2>
                        ${escapeHtml(
                            seriesData.title ||
                            SERIES_LABELS[seriesKey]
                        )}
                    </h2>

                    <p>
                        ${escapeHtml(
                            seriesData.subtitle ||
                            ""
                        )}
                    </p>

                    <span class="card-action">
                        Исследовать →
                    </span>

                </div>

            `;


            card.addEventListener(
                "click",
                () =>
                    openSeries(
                        seriesKey
                    )
            );


            elements.seriesGrid.appendChild(
                card
            );

        }

    }


    function getSeriesImage(
        seriesKey,
        seriesData
    ) {

        if (
            seriesData.image
        ) {
            return seriesData.image;
        }


        const firstCar =
            getAllCars()
                .find(
                    car =>
                        car.seriesKey ===
                        seriesKey
                );


        if (firstCar) {
            return firstCar.image;
        }


        return "./images/placeholder.jpg";
    }


    function getSeriesTag(
        seriesKey
    ) {

        const tags = {

            classic: "BMW HERITAGE",

            one: "COMPACT",
            two: "COUPE / GRAN",
            three: "ICON",
            four: "COUPE / GRAN",
            five: "BUSINESS",
            six: "GRAN TURISMO",
            seven: "LUXURY",
            eight: "LUXURY SPORT",

            x: "SAV / AWD",
            z: "ROADSTER",

            m: "BMW M",
            i: "ELECTRIC / BMW i"

        };


        return tags[
            seriesKey
        ] || "BMW";
    }


    /* ============================================================
       17. РАСШИРЕННЫЙ ФИЛЬТР
       ============================================================ */

    function renderFilterControls() {

        let container =
            document.getElementById(
                "advancedFilterPanel"
            );


        if (!container) {

            container =
                document.createElement(
                    "div"
                );

            container.id =
                "advancedFilterPanel";

            container.className =
                "advanced-filter-panel";


            const filters =
                document.querySelector(
                    ".filters"
                );


            if (
                filters &&
                filters.parentNode
            ) {

                filters.parentNode.insertBefore(
                    container,
                    filters.nextSibling
                );

            }

        }


        if (
            container.dataset.ready ===
            "true"
        ) {
            return;
        }


        container.dataset.ready =
            "true";


        container.innerHTML = `

            <button
                class="advanced-filter-toggle"
                id="advancedFilterToggle"
                type="button"
            >
                <span>
                    ⚙ Расширенные фильтры
                </span>

                <span
                    id="advancedFilterArrow"
                >
                    +
                </span>
            </button>


            <div
                class="advanced-filter-content"
                id="advancedFilterContent"
            >

                <div class="filter-row">

                    <label>
                        Год от

                        <input
                            id="filterYearFrom"
                            type="number"
                            inputmode="numeric"
                            placeholder="1900"
                        >

                    </label>


                    <label>
                        Год до

                        <input
                            id="filterYearTo"
                            type="number"
                            inputmode="numeric"
                            placeholder="2026"
                        >

                    </label>

                </div>


                <div class="filter-row">

                    <label>
                        Кузов

                        <select id="filterBody">

                            <option value="all">
                                Любой
                            </option>

                            <option value="седан">
                                Седан
                            </option>

                            <option value="купе">
                                Купе
                            </option>

                            <option value="кабриолет">
                                Кабриолет
                            </option>

                            <option value="универсал">
                                Универсал
                            </option>

                            <option value="родстер">
                                Родстер
                            </option>

                            <option value="хэтчбек">
                                Хэтчбек
                            </option>

                            <option value="кроссовер">
                                Кроссовер
                            </option>

                            <option value="sav">
                                SAV
                            </option>

                            <option value="gran coupe">
                                Gran Coupe
                            </option>

                        </select>

                    </label>


                    <label>
                        Привод

                        <select id="filterDrive">

                            <option value="all">
                                Любой
                            </option>

                            <option value="задний">
                                Задний
                            </option>

                            <option value="передний">
                                Передний
                            </option>

                            <option value="полный">
                                Полный
                            </option>

                            <option value="xdrive">
                                xDrive
                            </option>

                        </select>

                    </label>

                </div>


                <div class="filter-row">

                    <label>
                        Силовая установка

                        <select id="filterFuel">

                            <option value="all">
                                Любая
                            </option>

                            <option value="бензин">
                                Бензин
                            </option>

                            <option value="дизель">
                                Дизель
                            </option>

                            <option value="электромотор">
                                Электро
                            </option>

                            <option value="гибрид">
                                Гибрид
                            </option>

                            <option value="phev">
                                PHEV
                            </option>

                        </select>

                    </label>


                    <label>
                        Сортировка

                        <select id="filterSort">

                            <option value="default">
                                По умолчанию
                            </option>

                            <option value="name">
                                По названию
                            </option>

                            <option value="year_new">
                                Сначала новые
                            </option>

                            <option value="year_old">
                                Сначала старые
                            </option>

                            <option value="power">
                                По мощности
                            </option>

                        </select>

                    </label>

                </div>


                <div class="filter-row">

                    <label>
                        Мощность от

                        <input
                            id="filterPowerFrom"
                            type="number"
                            inputmode="numeric"
                            placeholder="0"
                        >

                    </label>


                    <label>
                        Мощность до

                        <input
                            id="filterPowerTo"
                            type="number"
                            inputmode="numeric"
                            placeholder="1000"
                        >

                    </label>

                </div>


                <button
                    id="resetFilters"
                    class="reset-filters"
                    type="button"
                >
                    Сбросить фильтры
                </button>

            </div>
        `;


        bindAdvancedFilters();

    }


    function bindAdvancedFilters() {

        const toggle =
            document.getElementById(
                "advancedFilterToggle"
            );

        const content =
            document.getElementById(
                "advancedFilterContent"
            );

        const arrow =
            document.getElementById(
                "advancedFilterArrow"
            );


        if (toggle) {

            toggle.addEventListener(
                "click",
                () => {

                    const isOpen =
                        content.classList.toggle(
                            "open"
                        );


                    arrow.textContent =
                        isOpen
                            ? "−"
                            : "+";
                }
            );

        }


        const ids = [

            "filterYearFrom",
            "filterYearTo",
            "filterBody",
            "filterDrive",
            "filterFuel",
            "filterSort",
            "filterPowerFrom",
            "filterPowerTo"

        ];


        ids.forEach(id => {

            const input =
                document.getElementById(id);


            if (!input) {
                return;
            }


            input.addEventListener(
                "input",
                applyFilters
            );

            input.addEventListener(
                "change",
                applyFilters
            );

        });


        const reset =
            document.getElementById(
                "resetFilters"
            );


        if (reset) {

            reset.addEventListener(
                "click",
                resetFilters
            );

        }

    }


    function applyFilters() {

        state.advancedFilters = {

            yearFrom:
                getInputValue(
                    "filterYearFrom"
                ),

            yearTo:
                getInputValue(
                    "filterYearTo"
                ),

            body:
                getSelectValue(
                    "filterBody",
                    "all"
                ),

            drive:
                getSelectValue(
                    "filterDrive",
                    "all"
                ),

            fuel:
                getSelectValue(
                    "filterFuel",
                    "all"
                ),

            sort:
                getSelectValue(
                    "filterSort",
                    "default"
                ),

            powerFrom:
                getInputValue(
                    "filterPowerFrom"
                ),

            powerTo:
                getInputValue(
                    "filterPowerTo"
                )
        };


        renderSearchResults();
    }


    function resetFilters() {

        const ids = [

            "filterYearFrom",
            "filterYearTo",
            "filterBody",
            "filterDrive",
            "filterFuel",
            "filterSort",
            "filterPowerFrom",
            "filterPowerTo"

        ];


        ids.forEach(id => {

            const element =
                document.getElementById(id);


            if (!element) {
                return;
            }


            if (
                element.tagName ===
                "SELECT"
            ) {

                element.value =
                    id === "filterSort"
                        ? "default"
                        : "all";

            } else {

                element.value = "";

            }

        });


        state.advancedFilters = {

            yearFrom: "",
            yearTo: "",
            body: "all",
            drive: "all",
            powerFrom: "",
            powerTo: "",
            fuel: "all",
            sort: "default"

        };


        renderSearchResults();
    }


    function getInputValue(id) {

        const element =
            document.getElementById(
                id
            );

        return element
            ? element.value.trim()
            : "";
    }


    function getSelectValue(
        id,
        fallback
    ) {

        const element =
            document.getElementById(
                id
            );

        return element
            ? element.value
            : fallback;
    }


    /* ============================================================
       18. SEARCH EVENTS
       ============================================================ */

    function setupSearch() {

        if (
            !elements.searchInput
        ) {
            return;
        }


        elements.searchInput.addEventListener(
            "input",
            () => {

                state.search =
                    elements.searchInput
                        .value
                        .trim();


                if (
                    elements.clearSearch
                ) {

                    elements.clearSearch
                        .classList.toggle(
                            "hidden",
                            !state.search
                        );

                }


                renderSearchResults();

            }
        );


        if (
            elements.clearSearch
        ) {

            elements.clearSearch.addEventListener(
                "click",
                () => {

                    elements.searchInput.value =
                        "";

                    state.search =
                        "";

                    elements.clearSearch
                        .classList.add(
                            "hidden"
                        );

                    renderSearchResults();

                    elements.searchInput.focus();

                }
            );

        }

    }


    /* ============================================================
       19. SEARCH RESULTS
       ============================================================ */

    function renderSearchResults() {

        if (
            !elements.searchResults ||
            !elements.searchResultsGrid
        ) {
            return;
        }


        const queryExists =
            Boolean(
                state.search
            );


        const advancedFilterExists =
            hasActiveAdvancedFilters();


        /*
         * Если нет поиска и нет фильтров —
         * скрываем результаты.
         */

        if (
            !queryExists &&
            !advancedFilterExists
        ) {

            elements.searchResults
                .classList
                .add("hidden");

            return;
        }


        const cars =
            getFilteredCars();


        elements.searchResults
            .classList
            .remove("hidden");


        elements.searchCount.textContent =
            `${cars.length} найдено`;


        elements.searchResultsGrid.innerHTML =
            "";


        if (!cars.length) {

            elements.searchResultsGrid.innerHTML = `

                <div class="empty-state">

                    Автомобили не найдены.

                    <br><br>

                    Попробуй изменить
                    параметры поиска.

                </div>
            `;

            return;
        }


        cars
            .slice(0, 50)
            .forEach(
                renderSearchResultCard
            );

    }


    function hasActiveAdvancedFilters() {

        const f =
            state.advancedFilters;


        return Boolean(

            f.yearFrom ||
            f.yearTo ||
            f.powerFrom ||
            f.powerTo ||
            f.body !== "all" ||
            f.drive !== "all" ||
            f.fuel !== "all" ||
            f.sort !== "default"

        );
    }


    function renderSearchResultCard(
        car
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "search-result-card";


        const favoriteActive =
            state.favorites.includes(
                car.id
            );


        const compareActive =
            state.compare.includes(
                car.id
            );


        card.innerHTML = `

            <img
                src="${escapeAttribute(
                    car.image
                )}"
                alt="${escapeAttribute(
                    car.modelName
                )}"
                loading="lazy"
                onerror="
                    this.src='./images/placeholder.jpg'
                "
            >


            <div
                class="search-result-info"
            >

                <h3>
                    ${escapeHtml(
                        car.modelName
                    )}
                </h3>

                <p>
                    ${escapeHtml(
                        car.generationName
                    )}
                    ·
                    ${escapeHtml(
                        car.year
                    )}
                </p>

                <p>
                    ${escapeHtml(
                        car.seriesTitle
                    )}
                </p>

            </div>


            <div
                class="result-actions"
            >

                <button
                    class="
                        result-icon-button
                        ${favoriteActive ? "active" : ""}
                    "
                    type="button"
                    data-favorite="${escapeAttribute(
                        car.id
                    )}"
                >
                    ${favoriteActive ? "♥" : "♡"}
                </button>


                <button
                    class="
                        result-icon-button
                        ${compareActive ? "active" : ""}
                    "
                    type="button"
                    data-compare="${escapeAttribute(
                        car.id
                    )}"
                >
                    ⚖
                </button>

            </div>

        `;


        card.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        "[data-favorite]"
                    ) ||
                    event.target.closest(
                        "[data-compare]"
                    )
                ) {
                    return;
                }


                openCar(

                    car.seriesKey,

                    car.modelKey,

                    car.generationKey

                );

            }
        );


        const favoriteButton =
            card.querySelector(
                "[data-favorite]"
            );


        if (favoriteButton) {

            favoriteButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    toggleFavorite(
                        car.id
                    );

                    renderSearchResults();

                }
            );

        }


        const compareButton =
            card.querySelector(
                "[data-compare]"
            );


        if (compareButton) {

            compareButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    toggleCompare(
                        car.id
                    );

                    renderSearchResults();

                }
            );

        }


        elements.searchResultsGrid
            .appendChild(card);

    }


    /* ============================================================
       20. SERIES FILTER BUTTONS
       ============================================================ */

    function setupBasicFilters() {

        document
            .querySelectorAll(
                ".filter-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".filter-button"
                            )
                            .forEach(
                                item =>
                                    item.classList
                                        .remove(
                                            "active"
                                        )
                            );


                        button.classList
                            .add("active");


                        state.basicFilter =
                            button.dataset.filter ||
                            "all";


                        renderSearchResults();

                    }
                );

            });

    }


    /* ============================================================
       21. ОТКРЫТИЕ СЕРИИ
       ============================================================ */

    function openSeries(
        seriesKey
    ) {

        const seriesData =
            window.BMW_DATA[
                seriesKey
            ];


        if (
            !seriesData ||
            !seriesData.models
        ) {
            return;
        }


        state.screen =
            "models";


        state.series =
            seriesKey;


        state.model =
            null;


        state.generation =
            null;


        elements.modelsLabel.textContent =
            SERIES_LABELS[
                seriesKey
            ] ||
            seriesData.title ||
            "BMW";


        elements.modelsTitle.textContent =
            seriesData.title ||
            SERIES_LABELS[
                seriesKey
            ];


        elements.modelsSubtitle.textContent =
            seriesData.subtitle ||
            "Выберите модель";


        elements.modelsGrid.innerHTML =
            "";


        for (
            const [modelKey, modelData]
            of Object.entries(
                seriesData.models
            )
        ) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "model-card";


            card.innerHTML = `

                <div>

                    <h3>
                        ${escapeHtml(
                            modelData.name ||
                            modelKey
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            modelData.desc ||
                            ""
                        )}
                    </p>

                </div>

                <span class="model-arrow">
                    →
                </span>

            `;


            card.addEventListener(
                "click",
                () =>
                    openModel(
                        seriesKey,
                        modelKey
                    )
            );


            elements.modelsGrid.appendChild(
                card
            );

        }


        showScreen(
            "modelsScreen"
        );

    }


    /* ============================================================
       22. ОТКРЫТИЕ МОДЕЛИ
       ============================================================ */

    function openModel(
        seriesKey,
        modelKey
    ) {

        const seriesData =
            window.BMW_DATA[
                seriesKey
            ];


        const modelData =
            seriesData?.models?.[
                modelKey
            ];


        if (
            !modelData ||
            !modelData.generations
        ) {
            return;
        }


        state.screen =
            "generations";


        state.series =
            seriesKey;


        state.model =
            modelKey;


        state.generation =
            null;


        elements.generationsLabel.textContent =
            seriesData.title ||
            SERIES_LABELS[
                seriesKey
            ];


        elements.generationsTitle.textContent =
            modelData.name;


        elements.generationsGrid.innerHTML =
            "";


        for (
            const [
                generationKey,
                generation
            ]
            of Object.entries(
                modelData.generations
            )
        ) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "generation-card";


            card.innerHTML = `

                <img
                    src="${escapeAttribute(
                        generation.image ||
                        "./images/placeholder.jpg"
                    )}"
                    alt="${escapeAttribute(
                        generation.name ||
                        generation.tag
                    )}"
                    loading="lazy"
                    onerror="
                        this.src='./images/placeholder.jpg'
                    "
                >

                <div class="generation-overlay"></div>

                <div class="generation-content">

                    <h3>
                        ${escapeHtml(
                            generation.tag ||
                            generation.name
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            generation.year ||
                            ""
                        )}
                    </p>

                </div>

            `;


            card.addEventListener(
                "click",
                () =>
                    openCar(
                        seriesKey,
                        modelKey,
                        generationKey
                    )
            );


            elements.generationsGrid
                .appendChild(card);

        }


        showScreen(
            "generationsScreen"
        );

    }


    /* ============================================================
       23. ОТКРЫТИЕ АВТОМОБИЛЯ
       ============================================================ */

    function openCar(
        seriesKey,
        modelKey,
        generationKey,
        engineIndex = 0
    ) {

        const seriesData =
            window.BMW_DATA[
                seriesKey
            ];


        const modelData =
            seriesData?.models?.[
                modelKey
            ];


        const generation =
            modelData?.generations?.[
                generationKey
            ];


        if (!generation) {
            return;
        }


        state.screen =
            "car";


        state.series =
            seriesKey;


        state.model =
            modelKey;


        state.generation =
            generationKey;


        state.engineIndex =
            engineIndex;


        elements.carImage.src =
            generation.image ||
            "./images/placeholder.jpg";


        elements.carImage.onerror =
            function () {

                this.onerror = null;

                this.src =
                    "./images/placeholder.jpg";

            };


        elements.carYear.textContent =
            generation.year ||
            "—";


        elements.carGeneration.textContent =
            generation.tag ||
            generation.name ||
            "—";


        elements.carTitle.textContent =
            generation.name ||
            modelData.name ||
            "BMW";


        elements.carBody.textContent =
            generation.body ||
            "—";


        renderEngineTabs(
            generation.engines || []
        );


        const engines =
            generation.engines || [];


        if (engines.length) {

            const safeIndex =
                Math.min(
                    engineIndex,
                    engines.length - 1
                );


            state.engineIndex =
                safeIndex;


            updateSpecs(
                engines[safeIndex]
            );

        } else {

            updateSpecs({});

        }


        renderCarActions();


        showScreen(
            "carScreen"
        );

    }


    /* ============================================================
       24. ENGINE TABS
       ============================================================ */

    function renderEngineTabs(
        engines
    ) {

        if (
            !elements.engineTabs ||
            !elements.engineSection
        ) {
            return;
        }


        elements.engineTabs.innerHTML =
            "";


        if (
            !engines ||
            engines.length <= 1
        ) {

            elements.engineSection
                .classList
                .add("hidden");

            return;

        }


        elements.engineSection
            .classList
            .remove("hidden");


        engines.forEach(
            (
                engine,
                index
            ) => {

                const tab =
                    document.createElement(
                        "button"
                    );


                tab.type =
                    "button";


                tab.className =
                    "engine-tab";


                if (
                    index ===
                    state.engineIndex
                ) {

                    tab.classList.add(
                        "active"
                    );

                }


                tab.textContent =
                    engine.name ||
                    `Мотор ${index + 1}`;


                tab.addEventListener(
                    "click",
                    () => {

                        state.engineIndex =
                            index;


                        document
                            .querySelectorAll(
                                ".engine-tab"
                            )
                            .forEach(
                                button =>
                                    button.classList
                                        .remove(
                                            "active"
                                        )
                            );


                        tab.classList.add(
                            "active"
                        );


                        updateSpecs(
                            engine
                        );

                    }
                );


                elements.engineTabs
                    .appendChild(tab);

            }
        );

    }


    /* ============================================================
       25. ХАРАКТЕРИСТИКИ
       ============================================================ */

    function updateSpecs(
        engine
    ) {

        engine =
            engine || {};


        elements.specHp.textContent =
            engine.hp || "—";


        elements.specTorque.textContent =
            engine.torque || "—";


        elements.specAccel.textContent =
            engine.accel || "—";


        elements.specSpeed.textContent =
            engine.speed || "—";


        const engineText =
            [

                engine.engineType,

                engine.volume

            ]
                .filter(Boolean)
                .join(" / ");


        elements.specEngine.textContent =
            engineText ||
            "—";


        elements.specTransmission.textContent =
            engine.trans ||
            "—";


        elements.specDrive.textContent =
            engine.drive ||
            "—";


        elements.specWeight.textContent =
            engine.weight ||
            "—";

    }


    /* ============================================================
       26. ПОДРОБНАЯ ИНФОРМАЦИЯ
       ============================================================ */

    function openDetails() {

        const car =
            getCurrentCar();


        if (!car) {
            return;
        }


        const details =
            car.detailed || {};


        elements.detailsGeneration.textContent =
            car.tag || "";


        elements.detailsTitle.textContent =
            car.generationName ||
            car.modelName;


        elements.detailsDescription.textContent =
            details.desc ||
            "Описание пока отсутствует.";


        elements.detailsYears.textContent =
            details.years ||
            car.year ||
            "—";


        elements.detailsTech.textContent =
            details.techFeatures ||
            "Информация пока отсутствует.";


        elements.detailsVersion.textContent =
            details.versionFeatures ||
            "Информация пока отсутствует.";


        elements.detailsFacts.textContent =
            details.facts ||
            "Информация пока отсутствует.";


        state.screen =
            "details";


        showScreen(
            "detailsScreen"
        );

    }


    function getCurrentCar() {

        if (
            !state.series ||
            !state.model ||
            !state.generation
        ) {
            return null;
        }


        return getCarById(

            [
                state.series,
                state.model,
                state.generation
            ].join("::")

        );

    }


    /* ============================================================
       27. ИЗБРАННОЕ ❤️
       ============================================================ */

    function isFavorite(
        id
    ) {

        return state.favorites
            .includes(id);

    }


    function toggleFavorite(
        id
    ) {

        const index =
            state.favorites
                .indexOf(id);


        if (index >= 0) {

            state.favorites.splice(
                index,
                1
            );

        } else {

            state.favorites.push(
                id
            );

        }


        saveStorage(
            STORAGE_KEYS.favorites,
            state.favorites
        );


        updateFavoriteAndCompareUI();

    }


    function removeFavorite(
        id
    ) {

        state.favorites =
            state.favorites.filter(
                item =>
                    item !== id
            );


        saveStorage(
            STORAGE_KEYS.favorites,
            state.favorites
        );


        updateFavoriteAndCompareUI();

    }


    /* ============================================================
       28. СРАВНЕНИЕ ⚖️
       ============================================================ */

    const MAX_COMPARE =
        3;


    function isInCompare(
        id
    ) {

        return state.compare
            .includes(id);

    }


    function toggleCompare(
        id
    ) {

        if (
            isInCompare(id)
        ) {

            state.compare =
                state.compare.filter(
                    item =>
                        item !== id
                );


            saveStorage(
                STORAGE_KEYS.compare,
                state.compare
            );


            updateFavoriteAndCompareUI();

            return;
        }


        if (
            state.compare.length >=
            MAX_COMPARE
        ) {

            alert(
                "Можно сравнить максимум 3 автомобиля."
            );

            return;
        }


        state.compare.push(
            id
        );


        saveStorage(
            STORAGE_KEYS.compare,
            state.compare
        );


        updateFavoriteAndCompareUI();

    }


    /* ============================================================
       29. ПАНЕЛЬ ИЗБРАННОГО / СРАВНЕНИЯ
       ============================================================ */

    function createUtilityBar() {

        if (
            document.getElementById(
                "utilityBar"
            )
        ) {
            return;
        }


        const bar =
            document.createElement(
                "div"
            );


        bar.id =
            "utilityBar";


        bar.className =
            "utility-bar";


        bar.innerHTML = `

            <button
                id="favoritesButton"
                type="button"
                class="utility-button"
            >

                <span>
                    ♥
                </span>

                <span>
                    Избранное
                </span>

                <b id="favoritesCount">
                    0
                </b>

            </button>


            <button
                id="compareButton"
                type="button"
                class="utility-button"
            >

                <span>
                    ⚖
                </span>

                <span>
                    Сравнение
                </span>

                <b id="compareCount">
                    0
                </b>

            </button>

        `;


        const home =
            document.getElementById(
                "homeScreen"
            );


        const hero =
            home?.querySelector(
                ".hero"
            );


        if (
            hero &&
            hero.parentNode
        ) {

            hero.parentNode.insertBefore(
                bar,
                hero.nextSibling
            );

        }


        document
            .getElementById(
                "favoritesButton"
            )
            ?.addEventListener(
                "click",
                openFavorites
            );


        document
            .getElementById(
                "compareButton"
            )
            ?.addEventListener(
                "click",
                openCompare
            );

    }


    function updateFavoriteAndCompareUI() {

        const favoritesCount =
            document.getElementById(
                "favoritesCount"
            );


        const compareCount =
            document.getElementById(
                "compareCount"
            );


        if (favoritesCount) {

            favoritesCount.textContent =
                state.favorites.length;

        }


        if (compareCount) {

            compareCount.textContent =
                state.compare.length;

        }

    }


    /* ============================================================
       30. ИЗБРАННОЕ
       ============================================================ */

    function openFavorites() {

        const cars =
            state.favorites
                .map(
                    getCarById
                )
                .filter(Boolean);


        showUtilityScreen(

            "Избранное",

            "Твои сохранённые автомобили",

            cars,

            "favorites"

        );

    }


    /* ============================================================
       31. СРАВНЕНИЕ
       ============================================================ */

    function openCompare() {

        const cars =
            state.compare
                .map(
                    getCarById
                )
                .filter(Boolean);


        if (!cars.length) {

            showUtilityScreen(

                "Сравнение",

                "Добавь автомобили для сравнения",

                [],

                "compare"

            );

            return;
        }


        showCompareTable(
            cars
        );

    }


    function showUtilityScreen(
        title,
        subtitle,
        cars,
        type
    ) {

        const modal =
            getUtilityModal();


        modal.innerHTML = `

            <div class="utility-modal-card">

                <button
                    class="utility-modal-close"
                    type="button"
                    id="closeUtilityModal"
                >
                    ×
                </button>


                <span class="section-label">
                    BMW CATALOG
                </span>

                <h2>
                    ${escapeHtml(title)}
                </h2>

                <p class="utility-subtitle">
                    ${escapeHtml(subtitle)}
                </p>


                <div
                    class="utility-list"
                >

                    ${
                        cars.length

                        ?

                        cars.map(
                            car =>
                                createUtilityCarHTML(
                                    car,
                                    type
                                )
                        ).join("")

                        :

                        `
                            <div class="empty-state">
                                Пока здесь ничего нет.
                            </div>
                        `
                    }

                </div>

            </div>

        `;


        modal
            .classList
            .remove("hidden");


        document
            .getElementById(
                "closeUtilityModal"
            )
            ?.addEventListener(
                "click",
                closeUtilityModal
            );


        modal
            .querySelectorAll(
                "[data-open-car]"
            )
            .forEach(
                element => {

                    element.addEventListener(
                        "click",
                        () => {

                            const car =
                                getCarById(
                                    element.dataset.openCar
                                );


                            if (!car) {
                                return;
                            }


                            closeUtilityModal();


                            openCar(

                                car.seriesKey,
                                car.modelKey,
                                car.generationKey

                            );

                        }
                    );

                }
            );


        modal
            .querySelectorAll(
                "[data-remove-favorite]"
            )
            .forEach(
                element => {

                    element.addEventListener(
                        "click",
                        () => {

                            removeFavorite(
                                element.dataset
                                    .removeFavorite
                            );

                            openFavorites();

                        }
                    );

                }
            );


        modal
            .querySelectorAll(
                "[data-remove-compare]"
            )
            .forEach(
                element => {

                    element.addEventListener(
                        "click",
                        () => {

                            toggleCompare(
                                element.dataset
                                    .removeCompare
                            );

                            openCompare();

                        }
                    );

                }
            );

    }


    function createUtilityCarHTML(
        car,
        type
    ) {

        const removeAttribute =
            type === "favorites"

                ?

                `
                    data-remove-favorite="${escapeAttribute(
                        car.id
                    )}"
                `

                :

                `
                    data-remove-compare="${escapeAttribute(
                        car.id
                    )}"
                `;


        const buttonText =
            type === "favorites"
                ? "♥"
                : "×";


        return `

            <article
                class="utility-car-card"
                data-open-car="${escapeAttribute(
                    car.id
                )}"
            >

                <img
                    src="${escapeAttribute(
                        car.image
                    )}"
                    alt="${escapeAttribute(
                        car.modelName
                    )}"
                    onerror="
                        this.src='./images/placeholder.jpg'
                    "
                >


                <div>

                    <strong>
                        ${escapeHtml(
                            car.modelName
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            car.tag
                        )}
                        ·
                        ${escapeHtml(
                            car.year
                        )}
                    </span>

                </div>


                <button
                    type="button"
                    class="utility-remove"
                    ${removeAttribute}
                >
                    ${buttonText}
                </button>

            </article>

        `;
    }


    /* ============================================================
       32. ТАБЛИЦА СРАВНЕНИЯ
       ============================================================ */

    function showCompareTable(
        cars
    ) {

        const modal =
            getUtilityModal();


        const selected =
            cars.slice(
                0,
                MAX_COMPARE
            );


        const rows = [

            {
                label: "Автомобиль",

                key: "name"
            },

            {
                label: "Поколение",

                key: "generation"
            },

            {
                label: "Годы",

                key: "year"
            },

            {
                label: "Мощность",

                key: "hp"
            },

            {
                label: "Крутящий момент",

                key: "torque"
            },

            {
                label: "0–100",

                key: "accel"
            },

            {
                label: "Максимальная скорость",

                key: "speed"
            },

            {
                label: "Двигатель",

                key: "engine"
            },

            {
                label: "Трансмиссия",

                key: "trans"
            },

            {
                label: "Привод",

                key: "drive"
            },

            {
                label: "Масса",

                key: "weight"
            }

        ];


        modal.innerHTML = `

            <div class="utility-modal-card compare-modal">

                <button
                    class="utility-modal-close"
                    type="button"
                    id="closeUtilityModal"
                >
                    ×
                </button>


                <span class="section-label">
                    BMW CATALOG
                </span>

                <h2>
                    Сравнение
                </h2>

                <p class="utility-subtitle">
                    До 3 автомобилей одновременно
                </p>


                <div class="compare-table-wrapper">

                    <table class="compare-table">

                        <thead>

                            <tr>

                                <th>
                                    Параметр
                                </th>

                                ${
                                    selected.map(
                                        car =>
                                            `
                                                <th>
                                                    ${escapeHtml(
                                                        car.modelName
                                                    )}
                                                </th>
                                            `
                                    ).join("")
                                }

                            </tr>

                        </thead>


                        <tbody>

                            ${
                                rows.map(
                                    row =>
                                        `
                                            <tr>

                                                <td>
                                                    ${escapeHtml(
                                                        row.label
                                                    )}
                                                </td>

                                                ${
                                                    selected.map(
                                                        car =>
                                                            `
                                                                <td>
                                                                    ${escapeHtml(
                                                                        getCompareValue(
                                                                            car,
                                                                            row.key
                                                                        )
                                                                    )}
                                                                </td>
                                                            `
                                                    ).join("")
                                                }

                                            </tr>
                                        `
                                ).join("")
                            }

                        </tbody>

                    </table>

                </div>


                <div class="compare-remove-row">

                    ${
                        selected.map(
                            car =>
                                `
                                    <button
                                        type="button"
                                        class="compare-remove-button"
                                        data-remove-compare="${escapeAttribute(
                                            car.id
                                        )}"
                                    >
                                        Убрать
                                        ${escapeHtml(
                                            car.modelName
                                        )}
                                    </button>
                                `
                        ).join("")
                    }

                </div>

            </div>

        `;


        modal
            .classList
            .remove("hidden");


        document
            .getElementById(
                "closeUtilityModal"
            )
            ?.addEventListener(
                "click",
                closeUtilityModal
            );


        modal
            .querySelectorAll(
                "[data-remove-compare]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            toggleCompare(
                                button.dataset
                                    .removeCompare
                            );

                            openCompare();

                        }
                    );

                }
            );

    }


    function getCompareValue(
        car,
        key
    ) {

        const engine =
            car.firstEngine || {};


        switch (key) {

            case "name":

                return car.modelName;


            case "generation":

                return car.tag;


            case "year":

                return car.year;


            case "hp":

                return engine.hp ||
                    "—";


            case "torque":

                return engine.torque ||
                    "—";


            case "accel":

                return engine.accel ||
                    "—";


            case "speed":

                return engine.speed ||
                    "—";


            case "engine":

                return [

                    engine.engineType,

                    engine.volume

                ]
                    .filter(Boolean)
                    .join(" / ") ||
                    "—";


            case "trans":

                return engine.trans ||
                    "—";


            case "drive":

                return engine.drive ||
                    "—";


            case "weight":

                return engine.weight ||
                    "—";


            default:

                return "—";

        }

    }


    /* ============================================================
       33. UTILITY MODAL
       ============================================================ */

    function getUtilityModal() {

        let modal =
            document.getElementById(
                "utilityModal"
            );


        if (!modal) {

            modal =
                document.createElement(
                    "div"
                );


            modal.id =
                "utilityModal";


            modal.className =
                "utility-modal hidden";


            document.body.appendChild(
                modal
            );


            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeUtilityModal();

                    }

                }
            );

        }


        return modal;

    }


    function closeUtilityModal() {

        const modal =
            document.getElementById(
                "utilityModal"
            );


        if (modal) {

            modal.classList.add(
                "hidden"
            );

        }

    }


    /* ============================================================
       34. ACTIONS НА СТРАНИЦЕ АВТОМОБИЛЯ
       ============================================================ */

    function renderCarActions() {

        const current =
            getCurrentCar();


        if (!current) {
            return;
        }


        let container =
            document.getElementById(
                "carActions"
            );


        if (!container) {

            container =
                document.createElement(
                    "div"
                );


            container.id =
                "carActions";


            container.className =
                "car-actions";


            const detailsButton =
                elements.detailsButton;


            if (
                detailsButton &&
                detailsButton.parentNode
            ) {

                detailsButton.parentNode.insertBefore(
                    container,
                    detailsButton
                );

            }

        }


        const favorite =
            isFavorite(
                current.id
            );


        const compare =
            isInCompare(
                current.id
            );


        container.innerHTML = `

            <button
                type="button"
                class="
                    car-action-button
                    ${favorite ? "active" : ""}
                "
                id="carFavoriteButton"
            >
                ${favorite ? "♥" : "♡"}
                <span>
                    ${favorite
                        ? "В избранном"
                        : "В избранное"}
                </span>
            </button>


            <button
                type="button"
                class="
                    car-action-button
                    ${compare ? "active" : ""}
                "
                id="carCompareButton"
            >
                ⚖
                <span>
                    ${compare
                        ? "В сравнении"
                        : "Сравнить"}
                </span>
            </button>

        `;


        document
            .getElementById(
                "carFavoriteButton"
            )
            ?.addEventListener(
                "click",
                () => {

                    toggleFavorite(
                        current.id
                    );

                    renderCarActions();

                }
            );


        document
            .getElementById(
                "carCompareButton"
            )
            ?.addEventListener(
                "click",
                () => {

                    toggleCompare(
                        current.id
                    );

                    renderCarActions();

                }
            );

    }


    /* ============================================================
       35. NAVIGATION
       ============================================================ */

    function showScreen(
        screenId
    ) {

        document
            .querySelectorAll(
                ".screen"
            )
            .forEach(
                screen =>
                    screen.classList.remove(
                        "active"
                    )
            );


        const screen =
            document.getElementById(
                screenId
            );


        if (!screen) {
            return;
        }


        screen.classList.add(
            "active"
        );


        state.screen =
            screenId;


        window.scrollTo(
            0,
            0
        );


        updateBackButton();

    }


    function updateBackButton() {

        if (
            !elements.backButton
        ) {
            return;
        }


        if (
            state.screen ===
            "homeScreen"
        ) {

            elements.backButton
                .classList
                .add("hidden");

        } else {

            elements.backButton
                .classList
                .remove("hidden");

        }

    }


    function goHome() {

        state.screen =
            "home";


        state.series =
            null;

        state.model =
            null;

        state.generation =
            null;


        showScreen(
            "homeScreen"
        );


        renderHome();

    }


    function goBack() {

        switch (
            state.screen
        ) {

            case "modelsScreen":

                goHome();

                break;


            case "generationsScreen":

                if (
                    state.series
                ) {

                    openSeries(
                        state.series
                    );

                } else {

                    goHome();

                }

                break;


            case "carScreen":

                if (
                    state.series &&
                    state.model
                ) {

                    openModel(
                        state.series,
                        state.model
                    );

                } else {

                    goHome();

                }

                break;


            case "detailsScreen":

                if (
                    state.series &&
                    state.model &&
                    state.generation
                ) {

                    openCar(

                        state.series,
                        state.model,
                        state.generation,
                        state.engineIndex

                    );

                } else {

                    goHome();

                }

                break;


            default:

                goHome();

        }

    }


    /* ============================================================
       36. EVENTS
       ============================================================ */

    function setupEvents() {

        if (
            elements.homeButton
        ) {

            elements.homeButton.addEventListener(
                "click",
                goHome
            );

        }


        if (
            elements.backButton
        ) {

            elements.backButton.addEventListener(
                "click",
                goBack
            );

        }


        if (
            elements.detailsButton
        ) {

            elements.detailsButton.addEventListener(
                "click",
                openDetails
            );

        }

    }


    /* ============================================================
       37. ESCAPE HTML
       ============================================================ */

    function escapeHtml(
        value
    ) {

        return String(value ?? "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    function escapeAttribute(
        value
    ) {

        return escapeHtml(
            value
        );

    }


    /* ============================================================
       38. ДОБАВЛЯЕМ СТИЛИ ДЛЯ НОВЫХ ЭЛЕМЕНТОВ
       ============================================================ */

    function injectExtraStyles() {

        if (
            document.getElementById(
                "bmwDynamicStyles"
            )
        ) {
            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "bmwDynamicStyles";


        style.textContent = `

            /* =========================
               UTILITY BAR
               ========================= */

            .utility-bar {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 18px;
            }

            .utility-button {
                min-height: 46px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 7px;
                border: 1px solid rgba(255,255,255,0.09);
                border-radius: 12px;
                background: rgba(255,255,255,0.035);
                color: #fff;
                font-size: 11px;
                font-weight: 700;
            }

            .utility-button b {
                min-width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: #0066b1;
                font-size: 9px;
            }


            /* =========================
               ADVANCED FILTER
               ========================= */

            .advanced-filter-panel {
                margin-bottom: 18px;
            }

            .advanced-filter-toggle {
                width: 100%;
                min-height: 44px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 14px;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 12px;
                background: rgba(255,255,255,0.03);
                color: #b6b6bc;
                font-size: 11px;
                font-weight: 700;
            }

            .advanced-filter-content {
                display: none;
                margin-top: 8px;
                padding: 12px;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 12px;
                background: rgba(255,255,255,0.03);
            }

            .advanced-filter-content.open {
                display: block;
                animation: filterIn 0.2s ease;
            }

            @keyframes filterIn {
                from {
                    opacity: 0;
                    transform: translateY(-4px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .filter-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 8px;
            }

            .filter-row:last-child {
                margin-bottom: 0;
            }

            .filter-row label {
                display: flex;
                flex-direction: column;
                gap: 6px;
                color: #78787f;
                font-size: 9px;
                font-weight: 700;
            }

            .filter-row input,
            .filter-row select {
                width: 100%;
                min-height: 40px;
                padding: 0 10px;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 9px;
                outline: none;
                background: #101012;
                color: #fff;
                font-size: 11px;
            }

            .filter-row input:focus,
            .filter-row select:focus {
                border-color: rgba(22,142,229,0.65);
            }

            .reset-filters {
                width: 100%;
                min-height: 38px;
                margin-top: 2px;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 9px;
                background: transparent;
                color: #8c8c92;
                font-size: 10px;
                font-weight: 700;
            }


            /* =========================
               RESULT ACTIONS
               ========================= */

            .search-result-card {
                position: relative;
                padding-right: 88px;
            }

            .result-actions {
                position: absolute;
                top: 50%;
                right: 10px;
                display: flex;
                gap: 5px;
                transform: translateY(-50%);
            }

            .result-icon-button {
                width: 32px;
                height: 32px;
                border-radius: 9px;
                border: 1px solid rgba(255,255,255,0.08);
                background: rgba(255,255,255,0.04);
                color: #999;
                font-size: 15px;
            }

            .result-icon-button.active {
                border-color: #0066b1;
                background: rgba(0,102,177,0.2);
                color: #fff;
            }


            /* =========================
               CAR ACTIONS
               ========================= */

            .car-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 10px;
            }

            .car-action-button {
                min-height: 48px;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 11px;
                background: rgba(255,255,255,0.035);
                color: #aaa;
                font-size: 10px;
                font-weight: 800;
            }

            .car-action-button.active {
                border-color: #0066b1;
                background: rgba(0,102,177,0.16);
                color: #fff;
            }


            /* =========================
               MODAL
               ========================= */

            .utility-modal {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: flex-end;
                justify-content: center;
                padding: 10px;
                background: rgba(0,0,0,0.65);
                backdrop-filter: blur(12px);
            }

            .utility-modal.hidden {
                display: none;
            }

            .utility-modal-card {
                position: relative;
                width: 100%;
                max-width: 760px;
                max-height: 88vh;
                overflow-y: auto;
                padding: 22px 16px 20px;
                border: 1px solid rgba(255,255,255,0.09);
                border-radius: 20px 20px 12px 12px;
                background: #0d0d10;
                box-shadow: 0 -15px 50px rgba(0,0,0,0.45);
                animation: modalUp 0.25s ease;
            }

            @keyframes modalUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .utility-modal-close {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 34px;
                height: 34px;
                border-radius: 50%;
                background: rgba(255,255,255,0.06);
                color: #aaa;
                font-size: 22px;
            }

            .utility-modal-card h2 {
                margin-top: 3px;
                font-size: 28px;
                letter-spacing: -0.8px;
            }

            .utility-subtitle {
                margin-top: 7px;
                margin-bottom: 18px;
                color: #77777e;
                font-size: 12px;
            }

            .utility-list {
                display: grid;
                gap: 8px;
            }

            .utility-car-card {
                display: grid;
                grid-template-columns: 72px 1fr 36px;
                align-items: center;
                gap: 10px;
                min-height: 72px;
                padding: 8px;
                border: 1px solid rgba(255,255,255,0.07);
                border-radius: 11px;
                background: rgba(255,255,255,0.035);
                cursor: pointer;
            }

            .utility-car-card img {
                width: 72px;
                height: 55px;
                object-fit: cover;
                border-radius: 8px;
                background: #111;
            }

            .utility-car-card strong {
                display: block;
                font-size: 13px;
            }

            .utility-car-card span {
                display: block;
                margin-top: 4px;
                color: #74747b;
                font-size: 9px;
            }

            .utility-remove {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: rgba(255,255,255,0.05);
                color: #999;
                font-size: 15px;
            }


            /* =========================
               COMPARE TABLE
               ========================= */

            .compare-table-wrapper {
                width: 100%;
                overflow-x: auto;
                border: 1px solid rgba(255,255,255,0.07);
                border-radius: 10px;
            }

            .compare-table {
                width: 100%;
                min-width: 560px;
                border-collapse: collapse;
            }

            .compare-table th,
            .compare-table td {
                padding: 10px;
                border-bottom: 1px solid rgba(255,255,255,0.06);
                border-right: 1px solid rgba(255,255,255,0.06);
                text-align: left;
                font-size: 10px;
            }

            .compare-table th {
                color: #fff;
                background: rgba(255,255,255,0.035);
                font-weight: 800;
            }

            .compare-table td {
                color: #aaa;
            }

            .compare-table td:first-child {
                color: #fff;
                font-weight: 700;
            }

            .compare-remove-row {
                display: grid;
                gap: 8px;
                margin-top: 12px;
            }

            .compare-remove-button {
                min-height: 38px;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 9px;
                background: transparent;
                color: #999;
                font-size: 10px;
                font-weight: 700;
            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* ============================================================
       39. INITIALIZATION
       ============================================================ */

    function init() {

        injectExtraStyles();

        createUtilityBar();

        setupEvents();

        setupSearch();

        setupBasicFilters();

        renderHome();

        showScreen(
            "homeScreen"
        );

    }


    /* ============================================================
       40. ЗАПУСК
       ============================================================ */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }

})();