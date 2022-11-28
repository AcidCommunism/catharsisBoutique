window.onload = () => {
    document.querySelectorAll('.toast').forEach(element => {
        const toast = new bootstrap.Toast(element, {
            animation: true,
            delay: 10000,
        });
        toast.show();
    });
};
