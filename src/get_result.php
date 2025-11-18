<?php
    /*
     * Validar que los datos son GET y que el body es correcto
     */
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        die("Solo se aceptan peticiones GET");
    } 
    
    /*
     * Validar que el csv existe y que tiene los headers correctos
     */
    $filePath = "./resultados.csv";
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
     * Devolver datos
     */
    $file = fopen($filePath, "r");

    $rawCsv = fread($file, filesize($filePath)); 
    $lineContent = array_map(function($line) {
        return str_getcsv($line, ",", '"', "\\");
    }, explode("\n", $rawCsv));    $headers = $lineContent[0];

    $jsonArray = array();
    $rowCount = count($lineContent);
    for ($i=1;$i<$rowCount;$i++) {
        foreach ($lineContent[$i] as $key => $column) {
            if ($column !== null) {
                $jsonArray[$i][$headers[$key]] = $column;
            }
        }
    }

    fclose($file);

    // Evitar caché
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Expires: 0");
    header("Pragma: no-cache");

    // enviar la respuestca como un json
    header('Content-type: application/json; charset=UTF-8');  
    echo json_encode($jsonArray, JSON_PRETTY_PRINT);
?>
