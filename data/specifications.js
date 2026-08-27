/* ============================================================
   BMW CATALOG 2.0
   НОРМАЛИЗАЦИЯ ХАРАКТЕРИСТИК
   ============================================================ */

window.BMW_SPECS = {

    version: "1.0",

    normalizeEngine(engine) {

        if (!engine) {

            return {

                name: "—",

                hp: "—",

                torque: "—",

                accel: "—",

                speed: "—",

                engineType: "—",

                volume: "—",

                trans: "—",

                drive: "—",

                weight: "—"

            };

        }


        return {

            name:
                engine.name || "—",

            hp:
                engine.hp || "—",

            torque:
                engine.torque || "—",

            accel:
                engine.accel || "—",

            speed:
                engine.speed || "—",

            engineType:
                engine.engineType || "—",

            volume:
                engine.volume || "—",

            trans:
                engine.trans || "—",

            drive:
                engine.drive || "—",

            weight:
                engine.weight || "—"

        };

    },


    getMaxPower(engines) {

        if (
            !Array.isArray(engines) ||
            !engines.length
        ) {
            return 0;
        }


        return Math.max(

            ...engines.map(
                engine => {

                    const value =
                        String(
                            engine.hp || ""
                        )
                        .replace(
                            ",",
                            "."
                        )
                        .replace(
                            /[^\d.]/g,
                            ""
                        );


                    const number =
                        parseFloat(value);


                    return Number.isFinite(
                        number
                    )
                        ? number
                        : 0;

                }
            )

        );

    }

};