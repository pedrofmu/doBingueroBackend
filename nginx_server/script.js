// script.js
document.addEventListener("DOMContentLoaded", () => {
  // --- Códigos asociados a nombres ---
  const codigosUsuarios = {
    codigo1: "Ana",
    codigo2: "Guillermo",
    codigo3: "Guillo",
    codigo4: "Jenifer",
    codigo5: "Fernando",
    codigo6: "Daniela",
  };

  // --- Página login.html ---
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    const nombreInput = document.getElementById("nombre");

    // Crear mensaje de error
    const mensajeError = document.createElement("p");
    mensajeError.style.color = "red";
    mensajeError.style.fontSize = "14px";
    mensajeError.style.marginTop = "5px";
    nombreInput.insertAdjacentElement("afterend", mensajeError);

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const codigoIntroducido = nombreInput.value.trim().toUpperCase();
      mensajeError.textContent = "";

      if (!codigoIntroducido) {
        mensajeError.textContent =
          "Te falta algo muchachín... ¿dónde está tu código de usuarín?";
        return;
      }

      // Verificar si el código existe en la base
      const nombreUsuario = codigosUsuarios[codigoIntroducido];
      if (!nombreUsuario) {
        mensajeError.textContent =
          "¡Quieto parao! No seas piratilla, ese código no es correcto.";
        return;
      }

      const ranking = JSON.parse(localStorage.getItem("ranking")) || [];
      const nombreExiste = ranking.some(
        (jugador) =>
          jugador.nombre.toLowerCase() === nombreUsuario.toLowerCase(),
      );

      if (nombreExiste) {
        mensajeError.textContent =
          "¡Ah, pirata! El capitán ha detectado que ya has jugado, ¡al agua con los tiburones!";
        return;
      }

      // Guardar el nombre real, no el código
      localStorage.setItem("nombreUsuario", nombreUsuario);
      window.location.href = "bingo.html";
    });
  }

  // --- Página bingo.html ---
  const form = document.getElementById("bingoForm");
  if (form) {
    const nombreUsuario = localStorage.getItem("nombreUsuario");
    if (!nombreUsuario) {
      window.location.href = "login.html";
      return;
    }

    const saludoElemento = document.getElementById("saludo");
    if (saludoElemento) {
      saludoElemento.textContent = `Hola dobinguero ${nombreUsuario}.`;
    }

    let segundos = 0;
    const contadorElemento = document.getElementById("contador");

    const intervalo = setInterval(() => {
      segundos++;
      contadorElemento.textContent = segundos;
    }, 1000);

    // 🚫 Evitar retroceder en el navegador
    history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
      history.pushState(null, null, window.location.href);
    };

    // ✅ Enviar respuestas y pasar a resultados
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearInterval(intervalo);

      const campo1 = document.getElementById("campo1").value.trim();
      const campo2 = document.getElementById("campo2").value.trim();
      const campo3 = document.getElementById("campo3").value.trim();

      localStorage.setItem("campo1", campo1);
      localStorage.setItem("campo2", campo2);
      localStorage.setItem("campo3", campo3);
      localStorage.setItem("tiempo", segundos);

      // NUEVO: guardar datos en el servidor
      const respuestasCorrectas = ["Aniol", "Puño de hierro", "Tokio"];

      const resultados = [
        { valor: campo1, correcta: respuestasCorrectas[0] },
        { valor: campo2, correcta: respuestasCorrectas[1] },
        { valor: campo3, correcta: respuestasCorrectas[2] },
      ];

      let aciertos = 0;
      resultados.forEach((res, index) => {
        // Comparación sin distinguir mayúsculas/minúsculas
        const correcto =
          res.valor && res.valor.toLowerCase() === res.correcta.toLowerCase();
        if (correcto) aciertos++;
      });

      const data = {
        usuario: nombreUsuario,
        numero_aciertos: aciertos,
        tiempo_utilizado: segundos,
      };

      // Hacer la call al servidor
      const res = await fetch("save_result.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      window.location.href = "resultados.html";
    });
  }

  // --- Página resultados.html ---
  if (window.location.href.includes("resultados.html")) {
    const nombreUsuario = localStorage.getItem("nombreUsuario");
    if (!nombreUsuario) {
      window.location.href = "login.html";
      return;
    }

    const respuestasCorrectas = ["Aniol", "Puño de hierro", "Tokio"];
    const campo1 = localStorage.getItem("campo1");
    const campo2 = localStorage.getItem("campo2");
    const campo3 = localStorage.getItem("campo3");
    const tiempo = parseInt(localStorage.getItem("tiempo")) || 0;

    const resultados = [
      { valor: campo1, correcta: respuestasCorrectas[0] },
      { valor: campo2, correcta: respuestasCorrectas[1] },
      { valor: campo3, correcta: respuestasCorrectas[2] },
    ];

    let aciertos = 0;
    resultados.forEach((res, index) => {
      const resultadoDiv = document.getElementById(`resultado${index + 1}`);
      // Comparación sin distinguir mayúsculas/minúsculas
      const correcto =
        res.valor && res.valor.toLowerCase() === res.correcta.toLowerCase();
      if (resultadoDiv) {
        resultadoDiv.textContent = `${index + 1}º campo: ${
          correcto ? "✅ Correcto!" : "❌ Naaaain"
        }`;
      }
      if (correcto) aciertos++;
    });

    if (tiempo) {
      const tiempoDiv = document.createElement("div");
      tiempoDiv.style.marginTop = "20px";
      tiempoDiv.textContent = `Contador de tiempo: ${tiempo} segundos`;
      document.body.appendChild(tiempoDiv);
    }

    // NUEVO: llamar a la funcion del backend para obtener los datos
    fetch("get_result.php").then(async (res) => {
      let ranking = (await res.json()) || [];

      // NUEVO: darle el formato correcto a los datos
      ranking = Object.values(ranking).map((e) => ({
        nombre: e.usuario,
        tiempo: e.tiempo_utilizado,
        aciertos: e.numero_aciertos,
      }));
      const nombreExiste = ranking.some(
        (jugador) =>
          jugador.nombre.toLowerCase() === nombreUsuario.toLowerCase(),
      );

      if (!nombreExiste) {
        ranking.push({ nombre: nombreUsuario, aciertos, tiempo });
      }

      ranking.sort((a, b) => {
        if (b.aciertos === a.aciertos) return a.tiempo - b.tiempo;
        return b.aciertos - a.aciertos;
      });
      localStorage.setItem("ranking", JSON.stringify(ranking));

      const rankingDiv = document.getElementById("ranking");
      if (rankingDiv) {
        rankingDiv.innerHTML = ranking
          .map(
            (jugador, i) =>
              `${i + 1}. ${jugador.nombre} — ${jugador.aciertos} acierto${
                jugador.aciertos !== 1 ? "s" : ""
              } — ⏱️ ${jugador.tiempo || 0} seg`,
          )
          .join("<br>");
      }

      const saludoFinal = document.createElement("div");
      saludoFinal.style.marginTop = "20px";
      saludoFinal.textContent = `Gracias por jugar, ${nombreUsuario}! 🎉`;
      document.body.appendChild(saludoFinal);
    });
  }
});
