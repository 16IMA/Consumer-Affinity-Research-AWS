// 1. Escuchar cuando el usuario hace clic en "ENVIAR"
document.getElementById('survey-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que la página se recargue

    // 2. Recoger los datos que el usuario escribió
    const formulario = event.target;
    const datosSucios = new FormData(formulario);
    const datos = Object.fromEntries(datosSucios.entries());

    // 3. Preparar el "paquete" para AWS (Payload)
    const paquete = {
        ...datos, // Copia todo lo del formulario (nombre, ciudad, etc.)
        response_id: self.crypto.randomUUID(), // Crea un ID único automático
        submitted_at: new Date().toISOString(), // Guarda la fecha y hora exacta
        
        // Convertimos a número lo que Athena necesita como número
        quality_score: Number(datos.quality_score),
        nps_score: Number(datos.nps_score)
        // Agrega aquí cualquier otro campo que deba ser un número
    };

    // 4. Enviar el paquete a la nube
    try {
        const respuesta = await fetch('TU_URL_DE_API_GATEWAY', {
            method: 'POST',
            body: JSON.stringify(paquete), // Convertimos el objeto en texto para el envío
            headers: { 'Content-Type': 'application/json' }
        });

        if (respuesta.ok) {
            alert('¡Gracias! Tus datos ya están en AWS.');
            formulario.reset(); // Limpia el formulario
        }
    } catch (error) {
        alert('Hubo un error. Revisa la consola (F12).');
        console.log(error);
    }
});