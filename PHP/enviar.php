<?php
// 1. Recibir los datos del script.js
$input = file_get_contents('php://input');
$datos = json_decode($input, true);

if ($datos) {
    // 2. Configurar destino
    $bucket = "survey-data-consumer-affinity-research-grupo1";  //COLOCAR NOMBRE DEL S3
    // Usamos la fecha y un ID único para el nombre del archivo
    $nombreArchivo = "registros/encuesta_" . date('Y-m-d_H-i-s') . "_" . uniqid() . ".json";
    
    // 3. Crear archivo temporal en la EC2
    $tempFile = "/tmp/dato.json";
    file_put_contents($tempFile, $input);
    
    // 4. Comando para subir a S3 usando el Rol de la instancia
    $comando = "aws s3 cp $tempFile s3://$bucket/$nombreArchivo 2>&1";
    exec($comando, $output, $return_var);
    
    // 5. Limpiar y responder al JS
    unlink($tempFile);
    
    header('Content-Type: application/json');
    if ($return_var === 0) {
        echo json_encode(["status" => "ok", "message" => "Guardado en S3"]);
    } else {
        echo json_encode(["status" => "error", "debug" => $output]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "No se recibieron datos"]);
}
?>