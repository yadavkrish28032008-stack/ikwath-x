// ===============================
// MOBILE NAVIGATION
// ===============================

function toggleMenu() {

    const nav = document.getElementById("navMenu");

    nav.classList.toggle("active");

}


// Close mobile menu after clicking a link

const navLinks = document.querySelectorAll("#navMenu a");

navLinks.forEach(function(link) {

    link.addEventListener("click", function() {

        document
            .getElementById("navMenu")
            .classList.remove("active");

    });

});


// ===============================
// SCROLL REVEAL ANIMATION
// ===============================

const revealElements =
    document.querySelectorAll(".reveal");


const observer = new IntersectionObserver(

    function(entries) {

        entries.forEach(function(entry) {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                observer.unobserve(entry.target);

            }

        });

    },

    {
        threshold: 0.12
    }

);


revealElements.forEach(function(element) {

    observer.observe(element);

});


// ===============================
// NAVBAR BACKGROUND ON SCROLL
// ===============================

window.addEventListener("scroll", function() {

    const navbar =
        document.querySelector(".navbar");

    if (window.scrollY > 50) {

        navbar.style.boxShadow =
            "0 8px 30px rgba(0,0,0,0.06)";

    } else {

        navbar.style.boxShadow = "none";

    }

});


// ===============================
// IMAGE FALLBACK
// ===============================

const images =
    document.querySelectorAll("img");


images.forEach(function(image) {

    image.addEventListener("error", function() {

        console.log(
            "Image not found:",
            image.getAttribute("src")
        );

    });

});
