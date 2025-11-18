<?php
    /*
     * Validar que los datos son POST y que el body es correcto
     */
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        die("Solo se aceptan peticiones POST");
    } 
    
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true); 
    
    if ($data === null) {
        die("JSON inválido");
    }
    
    if (!isset($data['usuario'], $data['numero_aciertos'], $data['tiempo_utilizado'])) {
        die("Faltan datos.");
    }
    
    $usuario = $data['usuario'];
    $numero_aciertos = $data['numero_aciertos'];
    $tiempo_utilizado = $data['tiempo_utilizado'];

    /*
     * Validar que el csv existe y que tiene los headers correctos
     */
    $filePath = "resultados.csv";
    $headers = "usuario,numero_aciertos,tiempo_utilizado";
     
    function validateFile($filePath, $headers) {
       if (!file_exists($filePath)) {
            $file = fopen($filePath, "w") or die("Error creando el fichero");
            fwrite($file, $headers . PHP_EOL);
            fclose($file);
            return;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES) or die("Error abriendo el fichero");;

        if (!isset($lines[0]) || $lines[0] !== $headers) {
            $lines[0] = $headers;
            file_put_contents($filePath, implode(PHP_EOL, $lines) . PHP_EOL);
        }
    }

    validateFile($filePath, $headers);

    /*
     * Validar que el usuario no tiene ya un resultado 
     */
    $file = fopen($filePath, "r");

    $yaExiste = false;
    
    if (($file = fopen($filePath, "r")) !== false) {
        fgetcsv($file, 0, ",", '"', "\\");
    
        while (($data = fgetcsv($file, 0, ",", '"', "\\")) !== false) {
            if (isset($data[0]) && $data[0] === $usuario) {
                $yaExiste = true;
                break;
            }
        }
    }
    
    if ($yaExiste) {
        fclose($file);
        die("Ya existe un resultado para el usuario: " . htmlspecialchars($usuario));
    }
    
    /*
     * Añadir el nuevo registro 
     */
    if (($file = fopen($filePath, "a")) !== false) {
        fputcsv($file, [$usuario, $numero_aciertos, $tiempo_utilizado], ",", '"', "\\");
        fclose($file);
        echo "Resultado guardado correctamente.";
    } else {
        fclose($file);
        die("No se pudo abrir el fichero para escritura.");
    }
?>
