# 📄 Backend para almacenamiento de resultados por usuario (doBinguero)

Este es un pequeño backend desarrollado para un **bingo interno entre empleados de [Omnitel](https://omnitel.es/)**, pensado para gestionar y almacenar de forma sencilla los resultados enviados por los participantes.

## 📘 Descripción del proyecto

El backend, implementado en **PHP** (archivos dentro de `./src`), permite:

- Almacenar y consultar resultados enviados desde un formulario.
- Registrar **un único resultado por usuario**.
- Guardar los datos en un archivo `resultados.csv`.
- Validar automáticamente el fichero: crear encabezados si no existen y evitar entradas duplicadas.

El objetivo del proyecto era ofrecer una solución rápida y funcional para un evento interno, priorizando la simplicidad, la integridad de datos y la facilidad de despliegue.

------------------------------------------------------------------------

## ⚙️ Funcionamiento de las rutas

------------------------------------------------------------------------

### ▶️ `save_result.php`

Esta ruta acepta peticiones **POST** con un cuerpo en formato **JSON**
que debe incluir:

``` json
{
  "usuario": "identificador_de_usuario",
  "numero_aciertos": 15,
  "tiempo_utilizado": 42
}
```

### ✅ Validaciones que realiza:

-   La petición debe ser **POST**.
-   El cuerpo debe contener un JSON válido.
-   Deben existir **los tres campos**:\
    `usuario`, `numero_aciertos`, `tiempo_utilizado`.
-   Se valida que el archivo `resultados.csv` exista y tenga los
    encabezados correctos.
-   **Cada usuario solo puede guardar un único resultado.**\
    Si un usuario ya tiene un registro, se rechaza la petición.

### 📁 Almacenamiento

Los datos se guardan en `resultados.csv` con este formato:

    usuario,numero_aciertos,tiempo_utilizado

------------------------------------------------------------------------

### ▶️ `get_result.php`

Esta ruta acepta únicamente peticiones **GET** y devuelve un JSON con
**todos los resultados almacenados**, respetando los encabezados del
CSV.

Ejemplo de respuesta:

``` json
{
  "1": {
    "usuario": "juan",
    "numero_aciertos": "18",
    "tiempo_utilizado": "37"
  },
  "2": {
    "usuario": "maria",
    "numero_aciertos": "20",
    "tiempo_utilizado": "33"
  }
}
```

------------------------------------------------------------------------

## 🧪 Ejemplo de uso en JavaScript (fetch)

------------------------------------------------------------------------

### 📌 Guardar un resultado

``` js
async function guardarResultado() {
  const data = {
    usuario: "usuario123",
    numero_aciertos: 12,
    tiempo_utilizado: 45
  };

  const res = await fetch("https://tu-dominio.com/ruta/save_result.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const respuesta = await res.text();
  console.log("Respuesta del servidor:", respuesta);
}

guardarResultado();
```

------------------------------------------------------------------------

### 📌 Obtener todos los resultados

``` js
async function obtenerResultados() {
  const res = await fetch("https://tu-dominio.com/ruta/get_result.php");
  const datos = await res.json();

  console.log("Resultados:", datos);
}

obtenerResultados();
```

------------------------------------------------------------------------

### Ejecutarlo en local

Si se quiere probar el servidor en local existe una version del juego de doBinguero en ./nginx_server.

Hay un docker que monta un servidor para realizar pruebas respecto a esta carpeta. Para ello simplemente.

1. Instalar Docker [guía oficial de instalación](https://docs.docker.com/engine/install/)

2. Ejecutarlo desde la terminal o desde Docker Desktop, con la terminal es:

```sh
  docker compose up --build
```

3. Ahora puedes acceder desde http://tu-ip:8080/login.html
