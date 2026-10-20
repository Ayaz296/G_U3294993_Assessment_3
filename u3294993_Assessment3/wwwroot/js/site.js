window.addEventListener("load", function () {

    // Scroll to the image after clicking Like
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




    // The Transition effec from week 6
    const featureSections =
        document.querySelectorAll(".healthcare-feature");

    function checkFeatureVisibility() {

        featureSections.forEach(function (section) {

            const position = section.getBoundingClientRect();

            // Check whether the section fits in the viewport
            const fitsInViewport =
                section.offsetHeight <= window.innerHeight;

            // Check whether the entire section is visible
            const fullyVisible =
                position.top >= 0 &&
                position.bottom <= window.innerHeight;

            // For tall sections, check whether they have entered
            const partlyVisible =
                position.top < window.innerHeight &&
                position.bottom > 0;

            if ((fitsInViewport && fullyVisible) ||
                (!fitsInViewport && partlyVisible)) {

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