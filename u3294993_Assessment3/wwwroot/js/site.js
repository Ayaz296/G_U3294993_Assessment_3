window.addEventListener("load", function () {

    const params = new URLSearchParams(window.location.search);
    const highlight = params.get("highlight");

    if (highlight !== null) {
        const image = document.getElementById("image-" + highlight);

        if (image !== null) {
            image.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    const hero = document.querySelector(".healthcare-hero");

    if (hero !== null) {
        const information = document.createElement("aside");

        information.className = "healthcare-note";
        information.textContent =
            "AI supports healthcare professionals but does not replace clinical judgement.";

        hero.appendChild(information);
    }

    const featureSections =
        document.querySelectorAll(".healthcare-feature");

    function checkFeatureVisibility() {

        featureSections.forEach(function (section) {

            const position = section.getBoundingClientRect();

            if (position.top >= 0 &&
                position.bottom <= window.innerHeight) {

                section.classList.add("feature-visible");

            }
            else {

                section.classList.remove("feature-visible");

            }
        });
    }

    window.addEventListener("scroll", checkFeatureVisibility);
    window.addEventListener("resize", checkFeatureVisibility);

    checkFeatureVisibility();
});