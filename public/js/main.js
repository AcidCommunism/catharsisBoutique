window.onload = () => {
    document.querySelectorAll('.toast').forEach(element => {
        const toast = new bootstrap.Toast(element);
        toast.show();
    });
};
