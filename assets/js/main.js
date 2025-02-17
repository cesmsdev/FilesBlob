const camera = new CameraHandler(true, (response) => {
    const notification = new Notification();

    try {
        $("#formAgregarContacto_Nombre").val(response.nombrePersona);
        $("#formAgregarContacto_Apellido").val(response.apellidoPersona);
        $("#modalComentarioTelefono").val(response.telefonos[0]);
        $("#modalNombreEmpresa_input").val(response.nombreEmpresa);
        $("#modalCorreo_input").val(response.correos[0]);
        $("#modalCargo_input").val(response.cargo);
        $("#modalSitioWeb_input").val(response.sitiosWeb[0]);

        $(".collapse").removeClass("show"); // Remueve 'show' de todos
        $("#collapseExample").toggleClass("show"); // Alterna la clase en el elemento clickeado
        notification.personalizedMessage("bottom", "La información de la tarjeta ha sido obtenida, por favor, revisalo.", "info");
    } catch (e) {
        let result = JSON.parse(response)
        notification.personalizedMessage("bottom", "Ocurrio un error: " + result.Detail + result.BillingUrl, "error");
    }
});