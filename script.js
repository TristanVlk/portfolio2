document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for contacting me! I will get back to you soon.');
        this.reset();
    });
});
