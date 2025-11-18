#!/bin/sh

# URL where your PHP script is served
BASE_URL="http://localhost:8080/save_result.php"

run_test() {
    name="$1"
    expected="$2"
    shift 2

    echo "==============================="
    echo "Test: $name"
    echo "-------------------------------"

    # Call curl with the remaining arguments
    response=$(curl -s "$@")
    status=$?

    echo "Response:"
    echo "$response"
    echo

    if [ $status -ne 0 ]; then
        echo "[FAIL] curl error (exit code $status)"
        echo
        return
    fi

    echo "$response" | grep -q "$expected"
    if [ $? -eq 0 ]; then
        echo "[OK] Found expected text: \"$expected\""
    else
        echo "[FAIL] Expected to find: \"$expected\""
    fi
    echo
}

#####################################
# TESTS
#####################################

# 1. GET request (should be rejected)
run_test \
  "GET request not allowed" \
  "Solo se aceptan peticiones POST" \
  "$BASE_URL"

# 2. POST without any JSON body
run_test \
  "POST without data" \
  "Faltan datos." \
  -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{}'

# 3. POST with only usuario
run_test \
  "POST with only usuario" \
  "Faltan datos." \
  -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"usuario":"pepe"}'

# 4. POST with usuario but invalid numero_aciertos
run_test \
  "POST without numero_aciertos/tiempo_utilizado" \
  "Numero de aciertos tiene que ser un numero." \
  -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"usuario":"pepe","numero_aciertos":"asdf","tiempo_utilizado":12}'

# 5. POST with non-numeric tiempo_utilizado
run_test \
  "POST with non-numeric tiempo_utilizado" \
  "Tiempo usado tiene que ser un numero" \
  -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"usuario":"pepe","numero_aciertos":5,"tiempo_utilizado":"no_es_numero"}'

# 6. POST with non-numeric numero_aciertos
run_test \
  "POST with non-numeric numero_aciertos" \
  "Numero de aciertos tiene que ser un numero." \
  -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"usuario":"pepe","numero_aciertos":"no_es_numero","tiempo_utilizado":12.5}'

# 7. POST with valid data
run_test \
  "POST with valid data" \
  "" \
  -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"usuario":"pepe","numero_aciertos":10,"tiempo_utilizado":30.5}'

# 8. Another valid POST
run_test \
  "POST with valid data (arturo)" \
  "" \
  -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"usuario":"arturo","numero_aciertos":3,"tiempo_utilizado":28}'

