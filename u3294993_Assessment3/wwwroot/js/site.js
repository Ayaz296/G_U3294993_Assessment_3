
// Scrolling to the image after clicking Like and showing sections when they're in view
window.addEventListener("load", function () {

    // Getting the image ID from the URL after clicking Like
    const highlight = new URLSearchParams(window.location.search).get("highlight");

    if (highlight !== null) {
        const image = document.getElementById("image-" + highlight);

        if (image) {
            image.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    // Checking which healthcare sections are visible while scrolling
    const sections = document.querySelectorAll(".healthcare-feature");

    function checkVisibility() {
        sections.forEach(function (section) {
            const box = section.getBoundingClientRect();

            const fullyVisible =
                box.top >= 0 && box.bottom <= window.innerHeight;

            const partiallyVisible =
                box.top < window.innerHeight && box.bottom > 0;

            // Showing the section when it fits in the viewport or becomes slightly visible
            const visible =
                window.matchMedia("(max-width: 767.98px)").matches ||
                    section.offsetHeight <= window.innerHeight
                    ? fullyVisible
                    : partiallyVisible;

            section.classList.toggle("feature-visible", visible);
        });
    }

    if (sections.length > 0) {
        window.addEventListener("scroll", checkVisibility);
        window.addEventListener("resize", checkVisibility);
        checkVisibility();
    }
});


// Running the hospital dashboard only when the HELIOS page is opened
document.addEventListener("DOMContentLoaded", function () {

    const departmentList = document.getElementById("helios-department-list");

    if (!departmentList) return;

    const roomGrid = document.getElementById("helios-room-grid");
    const roomDetails = document.getElementById("helios-room-details");

    // Sample patient and room information for the hospital dashboard
    const departments = [
        {
            id: "emergency",
            name: "Emergency",
            description: "Emergency assessment and treatment rooms.",
            rooms: [
                { number: "ER-01", temperature: 21, patient: "Amelia Brooks", treatment: "Wound assessment and care", status: "Stable" },
                { number: "ER-02", temperature: 22, patient: "Liam Foster", treatment: "Cardiac monitoring", status: "Monitoring" },
                { number: "ER-03", temperature: 21, patient: null },
                { number: "ER-04", temperature: 20, patient: "Sophia Bennett", treatment: "IV fluid therapy", status: "Stable" },
                { number: "ER-05", temperature: 22, patient: "Ethan Wilson", treatment: "Respiratory assessment", status: "Monitoring" },
                { number: "ER-06", temperature: 21, patient: null }
            ]
        },
        {
            id: "icu",
            name: "Intensive Care",
            description: "Critical care and continuous patient monitoring.",
            rooms: [
                { number: "ICU-01", temperature: 20, patient: "Sarah Chen", treatment: "Ventilator support", status: "Critical care" },
                { number: "ICU-02", temperature: 21, patient: "James Patel", treatment: "Post-operative monitoring", status: "Monitoring" },
                { number: "ICU-03", temperature: 22, patient: "Olivia Martin", treatment: "Cardiac observation", status: "Stable" },
                { number: "ICU-04", temperature: 21, patient: null },
                { number: "ICU-05", temperature: 21, patient: "Noah Lee", treatment: "Oxygen therapy", status: "Monitoring" },
                { number: "ICU-06", temperature: 20, patient: "Emily Brown", treatment: "Neurological monitoring", status: "Stable" },
                { number: "ICU-07", temperature: 21, patient: null },
                { number: "ICU-08", temperature: 22, patient: "Daniel Smith", treatment: "Sepsis treatment", status: "Critical care" }
            ]
        },
        {
            id: "general",
            name: "General Ward",
            description: "Inpatient care, recovery and observation.",
            rooms: [
                { number: "GW-01", temperature: 22, patient: "Mia Robinson", treatment: "Post-surgical recovery", status: "Recovering" },
                { number: "GW-02", temperature: 21, patient: null },
                { number: "GW-03", temperature: 22, patient: "Benjamin Clarke", treatment: "Antibiotic therapy", status: "Stable" },
                { number: "GW-04", temperature: 23, patient: "Isabella Wright", treatment: "Mobility rehabilitation", status: "Recovering" },
                { number: "GW-05", temperature: 22, patient: null },
                { number: "GW-06", temperature: 21, patient: "Lucas Green", treatment: "Pain management", status: "Stable" }
            ]
        },
        {
            id: "radiology",
            name: "Radiology",
            description: "Imaging and diagnostic examination rooms.",
            rooms: [
                { number: "RAD-01", temperature: 20, patient: "Charlotte Adams", treatment: "MRI examination", status: "In progress" },
                { number: "RAD-02", temperature: 21, patient: null },
                { number: "RAD-03", temperature: 20, patient: "Henry Scott", treatment: "CT examination", status: "In progress" },
                { number: "RAD-04", temperature: 21, patient: null },
                { number: "RAD-05", temperature: 22, patient: "Grace Taylor", treatment: "Ultrasound examination", status: "In progress" }
            ]
        },
        {
            id: "pathology",
            name: "Pathology",
            description: "Sample collection and laboratory services.",
            rooms: [
                { number: "PATH-01", temperature: 21, patient: "Alexander Hill", treatment: "Blood sample collection", status: "In progress" },
                { number: "PATH-02", temperature: 21, patient: null },
                { number: "PATH-03", temperature: 22, patient: "Harper Young", treatment: "Specimen collection", status: "In progress" },
                { number: "PATH-04", temperature: 21, patient: null },
                { number: "PATH-05", temperature: 20, patient: null }
            ]
        }
    ];

    // Creating HTML elements to display room details and department buttons
    function createElement(tag, text, className) {
        const element = document.createElement(tag);

        if (text !== null) element.textContent = text;
        if (className) element.className = className;

        return element;
    }

    // Counting rooms that have a patient assigned to them
    function occupiedCount(department) {
        return department.rooms.filter(function (room) {
            return room.patient !== null;
        }).length;
    }

    // Calculating the total number of rooms and occupied rooms across the hospital
    let totalRooms = 0;
    let occupiedRooms = 0;

    departments.forEach(function (department) {
        totalRooms += department.rooms.length;
        occupiedRooms += occupiedCount(department);
    });

    document.getElementById("helios-total-rooms").textContent = totalRooms;
    document.getElementById("helios-occupied-rooms").textContent = occupiedRooms;
    document.getElementById("helios-available-rooms").textContent = totalRooms - occupiedRooms;
    document.getElementById("helios-department-count").textContent = departments.length;

    // Updating the room details when a different room is selected
    function showRoom(room, button) {
        roomGrid.querySelectorAll("button").forEach(function (item) {
            item.classList.remove("selected");
            item.setAttribute("aria-pressed", "false");
        });

        button.classList.add("selected");
        button.setAttribute("aria-pressed", "true");

        roomDetails.innerHTML = "";
        roomDetails.appendChild(createElement("h4", "Room " + room.number));

        const grid = createElement("div", null, "helios-detail-grid");

        const fields = [
            ["Room status", room.patient ? "Occupied" : "Available"],
            ["Room temperature", room.temperature + "°C"],
            ["Patient", room.patient || "No patient assigned"],
            ["Current treatment", room.treatment || "None"]
        ];

        if (room.patient) fields.push(["Patient status", room.status]);

        fields.forEach(function (field) {
            const item = createElement("div", null, "helios-detail");

            item.appendChild(createElement("span", field[0]));
            item.appendChild(createElement("strong", field[1]));
            grid.appendChild(item);
        });

        roomDetails.appendChild(grid);
    }

    // Changing the displayed rooms and occupancy information for the selected department
    function showDepartment(id) {
        const department = departments.find(function (item) {
            return item.id === id;
        });

        if (!department) return;

        const occupied = occupiedCount(department);
        const available = department.rooms.length - occupied;
        const percentage = Math.round(occupied / department.rooms.length * 100);

        document.getElementById("helios-selected-department").textContent =
            department.name;

        document.getElementById("helios-department-description").textContent =
            department.description;

        document.getElementById("helios-department-occupancy").textContent =
            percentage + "% Occupied";

        // Highlighting the selected department in the list
        departmentList.querySelectorAll("button").forEach(function (button) {
            const selected = button.dataset.id === id;
            button.classList.toggle("active", selected);
            button.setAttribute("aria-pressed", String(selected));
        });

        roomGrid.innerHTML = "";

        // Creating clickable buttons for every room in the department
        department.rooms.forEach(function (room) {
            const button = createElement("button", null, "helios-room");
            button.type = "button";

            if (!room.patient) button.classList.add("available");

            button.setAttribute(
                "aria-label",
                room.number + (room.patient ? ", occupied" : ", available")
            );

            button.appendChild(
                createElement("div", room.patient ? "▣" : "✓", "helios-room-icon")
            );

            button.appendChild(createElement("strong", room.number));
            button.appendChild(
                createElement("small", room.patient ? "Occupied" : "Available")
            );

            button.addEventListener("click", function () {
                showRoom(room, button);
            });

            roomGrid.appendChild(button);
        });

        // Showing the first room by default when changing departments
        if (department.rooms.length > 0) {
            showRoom(department.rooms[0], roomGrid.querySelector("button"));
        }

        // Displaying an occupancy warning when a department reaches 80% capacity
        const message = percentage >= 80
            ? department.name + " is at " + percentage +
            "% occupancy with " + available +
            " room(s) available. Capacity planning may be beneficial."
            : department.name + " currently has " + occupied +
            " occupied rooms and " + available +
            " available rooms. Review room allocations as department needs change.";

        document.getElementById("helios-insight-text").textContent = message;
    }

    // Creating the department buttons and opening the selected department when clicked
    departments.forEach(function (department) {
        const button = createElement("button", null, "helios-department-button");
        button.type = "button";
        button.dataset.id = department.id;

        button.appendChild(createElement("span", department.name));
        button.appendChild(
            createElement(
                "small",
                occupiedCount(department) + "/" + department.rooms.length
            )
        );

        button.addEventListener("click", function () {
            showDepartment(department.id);
        });

        departmentList.appendChild(button);
    });

    showDepartment("emergency");

    // Revealing dashboard sections as they enter the viewport
    const targets = document.querySelectorAll(".helios-reveal");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        targets.forEach(function (element) {
            observer.observe(element);
        });
    } else {
        targets.forEach(function (element) {
            element.classList.add("visible");
        });
    }
});


// Showing a preview when an image is selected on the Create page
document.addEventListener("DOMContentLoaded", function () {

    const imageFile = document.getElementById("imageFile");

    const preview = document.getElementById("imagePreview");
    const message = document.getElementById("previewMessage");

    // Skipping the preview code on pages that don't contain the image upload form
    if (!imageFile || !preview || !message) return;

    imageFile.addEventListener("change", function () {
        const file = this.files[0];

        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();

            // Displaying the chosen image without uploading it to the server
            reader.onload = function (event) {
                preview.src = event.target.result;
                preview.classList.remove("d-none");
                message.classList.add("d-none");
            };

            reader.readAsDataURL(file);
        } else {
            // Restoring the message when no valid image is selected
            preview.removeAttribute("src");
            preview.classList.add("d-none");
            message.classList.remove("d-none");
        }
    });
});
