// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

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
});
