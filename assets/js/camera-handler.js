class CameraHandler {
    constructor(uploadOnCapture = false, onUploadComplete = null, scanQr = false) {
        this.videoElement = document.querySelector("[data-ac-camera='preview']");
        this.videoElement.setAttribute("playsinline", "true"); // <-- Asegurar reproducción en línea
        this.videoElement.setAttribute("autoplay", "true");
        this.videoElement.setAttribute("muted", "true"); // En algunos casos, es necesario
        this.fileInput = document.querySelector("[data-ac-camera='file']");
        this.canvas = document.querySelector("[data-ac-camera='canvas']");
        this.stream = null;
        this.scanQr = scanQr;
        this.isScanning = false;
        this.uploadOnCapture = uploadOnCapture;
        this.onUploadComplete = onUploadComplete; // Callback para la respuesta del servidor

        this.initButtons();
        this.initFileUpload();
    }

    initButtons() {
        document.querySelector("[data-ac-camera='start']")?.addEventListener("click", () => this.requestCameraAccess());
        document.querySelector("[data-ac-camera='stop']")?.addEventListener("click", () => this.stopCamera());
        document.querySelector("[data-ac-camera='capture']")?.addEventListener("click", () => this.capturePhoto());
    }

    initFileUpload() {
        this.fileInput?.addEventListener("change", () => {
            if (this.uploadOnCapture && this.fileInput.files.length > 0) {
                this.uploadFile(this.fileInput.files[0]);
            }
        });
    }

    async requestCameraAccess() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.showMessage("⚠ Tu navegador no soporta acceso a la cámara.", "errro");
                return;
            }

            // Intenta acceder a la cámara trasera
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" } }
            });

            this.videoElement.srcObject = this.stream;
            this.videoElement.play();

            if (this.scanQr) { this.startQrScanner(); }

            this.showMessage("📷 Cámara activada correctamente.", "info");
        } catch (error) {
            this.handleCameraError(error);
        }
    }

    async startQrScanner() {
        if (!this.canvas) return;
        this.isScanning = true;
        this.scanFrameForQr();
    }

    scanFrameForQr() {
        if (!this.isScanning) return;

        const context = this.canvas.getContext("2d", { willReadFrequently: true });
        this.canvas.width = this.videoElement.videoWidth;
        this.canvas.height = this.videoElement.videoHeight;
        context.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
        const imageData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        if (qrCode) {
            if (qrCode.data.length > 5) {
                this.uploadFile(null, dataQr);
                setTimeout(() => {
                    requestAnimationFrame(() => this.scanFrameForQr());
                }, 1000); // Ajusta el tiempo si es necesario
                return;
            }
        }
        requestAnimationFrame(() => this.scanFrameForQr());
    }

    handleCameraError(error) {
        if (error.name === "NotAllowedError") {
            this.showMessage("⚠ Permiso denegado. Habilita la cámara en la configuración.", "warning");
        } else if (error.name === "NotFoundError") {
            this.showMessage("⚠ No se encontró una cámara disponible.", "warning");
        } else {
            this.showMessage("⚠ Error desconocido al acceder a la cámara.", "error");
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.videoElement.srcObject = null;
            this.showMessage("📴 Cámara desactivada.", "info");
        }
    }

    capturePhoto() {
        if (!this.stream) {
            this.showMessage("⚠ La cámara no está activa.", "error");
            return;
        }

        const context = this.canvas.getContext("2d", { willReadFrequently: true });
        this.canvas.width = this.videoElement.videoWidth;
        this.canvas.height = this.videoElement.videoHeight;
        context.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

        this.canvas.toBlob(blob => {
            const file = new File([blob], "photo.png", { type: "image/png" });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            this.fileInput.files = dataTransfer.files;

            this.showMessage("📸 Foto capturada y añadida al archivo.", "success");
            this.uploadFile(dataTransfer.files[0], null);
        }, "image/png");
    }

    async uploadFile(file, dataQr) {

        // let busyLoad = new BusyLoader({ text: "Leyendo datos de la tarjeta...", textColor: "#000000", backgroundColor: "#ffffff", fullScreen: false, targetSelector: "#container-camera" });
        // busyLoad.start();

        let formData = new FormData();

        if (file != null) { formData.append("imageFile", file); }
        if (dataQr != null) { formData.append("dataQr", dataQr); }

        this.showMessage("Se van a enviar los datos" + formData, "success");

        // try {
        //     let response = await fetch("/Google/Vision/UploadImage", {
        //         method: "POST",
        //         body: formData
        //     });

        //     let result = await response.json();
        //     // Ejecuta el callback si está definido
        //     if (typeof this.onUploadComplete === "function") {
        //         this.onUploadComplete(result);
        //     }
        // } catch (error) {
        //     this.showMessage("Error al subir el archivo.", "error");
        // }

        busyLoad.stop();
    }

    showMessage(msg, type) {
        const notification = new Notification();
        notification.personalizedMessage("bottom", msg, type);
    }
}
