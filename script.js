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
        // response_id: self.crypto.randomUUID(), // Crea un ID único automático. Cambio de código para que sirva en HTTP
        response_id: 'res-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        submitted_at: new Date().toISOString(), // Guarda la fecha y hora exacta
        
        // Convertimos a número lo que Athena necesita como número
        quality_score: Number(datos.quality_score),
        nps_score: Number(datos.nps_score)
        // Agrega aquí cualquier otro campo que deba ser un número
    };

    // 4. Enviar el paquete a la nube
    try {
        const respuesta = await fetch('enviar.php', {
            method: 'POST',
            body: JSON.stringify(paquete), // Convertimos el objeto en texto para el envío
            headers: { 'Content-Type': 'application/json' }
        });

        if (respuesta.ok) {
            alert('¡Gracias por tu opinión!.');
            formulario.reset(); // Limpia el formulario
        }
    } catch (error) {
        alert('Hubo un error al subir tus datos.');
        console.log(error);
    }
});