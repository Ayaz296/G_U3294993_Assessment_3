
// Home page - Like scrolling and section transitions
window.addEventListener("load", function () {

    // Scroll to the image after clicking Like
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

    // Healthcare section visibility
    const sections = document.querySelectorAll(".healthcare-feature");

    function checkVisibility() {
        sections.forEach(function (section) {
            const box = section.getBoundingClientRect();

            const fullyVisible =
                box.top >= 0 && box.bottom <= window.innerHeight;

            const partiallyVisible =
                box.top < window.innerHeight && box.bottom > 0;

            const visible =
                window.innerWidth <= 766 ||
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


// HELIOS - Interactive hospital dashboard
document.addEventListener("DOMContentLoaded", function () {

    const departmentList = document.getElementById("helios-department-list");

    // Only run on HELIOS page
    if (!departmentList) return;

    const roomGrid = document.getElementById("helios-room-grid");
    const roomDetails = document.getElementById("helios-room-details");

    // Fictional hospital data
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

    // Create an HTML element with optional text and class
    function createElement(tag, text, className) {
        const element = document.createElement(tag);

        if (text !== null) element.textContent = text;
        if (className) element.className = className;

        return element;
    }

    // Count occupied rooms
    function occupiedCount(department) {
        return department.rooms.filter(function (room) {
            return room.patient !== null;
        }).length;
    }

    // Calculate hospital statistics
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

    // Display selected room
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

    // Display selected department
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

        // Highlight selected department
        departmentList.querySelectorAll("button").forEach(function (button) {
            const selected = button.dataset.id === id;
            button.classList.toggle("active", selected);
            button.setAttribute("aria-pressed", String(selected));
        });

        roomGrid.innerHTML = "";

        // Generate room buttons
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

        // Select first room
        if (department.rooms.length > 0) {
            showRoom(department.rooms[0], roomGrid.querySelector("button"));
        }

        // Operational insight
        const message = percentage >= 80
            ? department.name + " is at " + percentage +
            "% occupancy with " + available +
            " room(s) available. Capacity planning may be beneficial."
            : department.name + " currently has " + occupied +
            " occupied rooms and " + available +
            " available rooms. Review room allocations as department needs change.";

        document.getElementById("helios-insight-text").textContent = message;
    }

    // Generate department buttons
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

    // Scroll reveal animations
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
