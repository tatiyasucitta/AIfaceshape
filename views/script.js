function openCarousel(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeCarousel(id) {
    document.getElementById(id).style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    // Example of handling post creation (this would need to be expanded)
    const postCreateInput = document.querySelector('.post-create input');
    postCreateInput.addEventListener('focus', () => {
        postCreateInput.placeholder = 'What do you want to talk about?';
    });
    postCreateInput.addEventListener('blur', () => {
        postCreateInput.placeholder = 'Start a post';
    });
});
