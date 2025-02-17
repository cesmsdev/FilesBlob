class Notification {
    constructor(type = "info", text = "Hello!", position = "center", duration = 3000, gravity = "bottom") {
        this.type = type;
        this.text = text;
        this.position = position;
        this.duration = duration;
        this.gravity = gravity;
    }

    errorMessage(gravity) {
        this.type = "error";
        this.text = "Ocurrio un error, intentalo de nuevo.";
        this.gravity = gravity;
        this.show();
    }

    successMessage(gravity, text) {
        this.type = "success";
        this.text = text;
        this.gravity = gravity;
        this.show();
    }

    personalizedMessage(gravity, text, type) {
        this.type = type;
        this.text = text;
        this.gravity = gravity;
        this.show();
    }

    // Método para mostrar la notificación (usando Toastify como ejemplo)
    show() {
        Toastify({
            text: this.text,
            duration: this.duration,
            close: true,
            gravity: this.gravity,
            position: this.position,
            backgroundColor: this.getColorByType(this.type),
            className: "rounded-5 font-14 fw-medium"

        }).showToast();
    }

    // Método para obtener el color según el tipo de notificación
    getColorByType(type) {
        const colors = {
            info: "#3498db",
            success: "#2ecc71",
            warning: "#f39c12",
            error: "#e74c3c"
        };
        return colors[type] || colors.info; // Por defecto, es info
    }
}