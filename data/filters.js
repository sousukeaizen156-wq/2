/* ============================================================
   BMW CATALOG 2.0
   ФИЛЬТРЫ
   ============================================================ */

window.BMW_FILTERS = {

    years: {

        min: 1928,

        max: new Date()
            .getFullYear()

    },


    bodyTypes: [

        {
            value: "all",
            label: "Любой кузов"
        },

        {
            value: "седан",
            label: "Седан"
        },

        {
            value: "купе",
            label: "Купе"
        },

        {
            value: "кабриолет",
            label: "Кабриолет"
        },

        {
            value: "универсал",
            label: "Универсал"
        },

        {
            value: "родстер",
            label: "Родстер"
        },

        {
            value: "хэтчбек",
            label: "Хэтчбек"
        },

        {
            value: "кроссовер",
            label: "Кроссовер"
        },

        {
            value: "sav",
            label: "SAV"
        },

        {
            value: "gran coupe",
            label: "Gran Coupe"
        }

    ],


    drives: [

        {
            value: "all",
            label: "Любой привод"
        },

        {
            value: "задний",
            label: "Задний"
        },

        {
            value: "передний",
            label: "Передний"
        },

        {
            value: "полный",
            label: "Полный"
        },

        {
            value: "xdrive",
            label: "xDrive"
        }

    ],


    power: {

        min: 0,

        max: 1500,

        step: 10

    },


    sorting: [

        {
            value: "default",
            label: "По умолчанию"
        },

        {
            value: "name",
            label: "По названию"
        },

        {
            value: "year_new",
            label: "Сначала новые"
        },

        {
            value: "year_old",
            label: "Сначала старые"
        },

        {
            value: "power",
            label: "По мощности"
        }

    ]

};