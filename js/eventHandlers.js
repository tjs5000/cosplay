// eventHandlers.js

// Function to reattach event listeners
export function reattachEventListeners() {
    const carousels = document.querySelectorAll('.carousel, .custom-content');
    carousels.forEach(carousel => {
        let isDown = false;
        let startX;
        let scrollLeft;

        carousel.addEventListener('wheel', (e) => {
            e.preventDefault();
            carousel.scrollLeft += e.deltaY;
        });

        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            carousel.classList.add('active');
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.classList.remove('active');
        });

        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.classList.remove('active');
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2; // Scroll-fast
            carousel.scrollLeft = scrollLeft - walk;
        });
    });
}