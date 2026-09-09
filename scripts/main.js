window.addEventListener('scroll', () => {
    const nav = document.getElementById('main-nav');
    if (window.scrollY > 10) {
        nav.classList.add('shadow-md');
        nav.classList.remove('shadow-sm');
    } else {
        nav.classList.remove('shadow-md');
        nav.classList.add('shadow-sm');
    }
});