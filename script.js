let preguntas = [];
let indiceActual = 0;
let puntuacion = 0;

const archivos = [
    "/archivoTxtEsp1.txt",
    "/archivoTxtEsp2.txt",
    "/archivoTxtEsp3.txt",
    "/archivoTxtEsp4.txt",
    "/archivoTxtEsp5.txt"
  ];
  
const aleatorio = archivos[Math.floor(Math.random() * archivos.length)];

fetch(aleatorio)
  .then(r => r.text())
  .then(texto => {
    preguntas = mezclarArray(parsearPreguntas(texto));
    mostrarPregunta();
  });

function parsearPreguntas(texto) {
  const bloques = texto.split(/Identificador:/).filter(Boolean);
  return bloques.map(bloque => {
    const enunciado = bloque.match(/Enunciado:\s*(.*?)\n1\.-/s)?.[1].trim();
    const opciones = [];
    for (let i = 1; i <= 4; i++) {
      const match = bloque.match(new RegExp(`${i}\\.-\\s*(.*?)\\n`));
      opciones.push(match ? match[1].trim() : "");
    }
    const respuesta = bloque.match(/Respuesta:\s*(\d)/)?.[1];
    const norma = bloque.match(/Norma:\s*(.*)/)?.[1];
    return { enunciado, opciones, respuesta, norma };
  });
}

function mezclarArray(arr) {
  return arr.sort(() => Math.random() - 0.5).slice(0, 50);
}

function mostrarPregunta() {
  const contenedor = document.getElementById("pregunta-container");
  contenedor.innerHTML = "";

  if (indiceActual >= preguntas.length) {
    mostrarResultado();
    return;
  }

  const p = preguntas[indiceActual];
  const preguntaDiv = document.createElement("div");
  preguntaDiv.innerHTML = `<p><strong>Pregunta ${indiceActual + 1}:</strong> ${p.enunciado}</p>`;

  const opcionesContainer = document.createElement("div");

  p.opciones.forEach((opcion, index) => {
    const id = `op${indiceActual}-${index}`;
    const input = document.createElement("input");
    input.type = "radio";
    input.name = `pregunta${indiceActual}`;
    input.value = index + 1;
    input.id = id;

    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = opcion;

    input.addEventListener("change", () => {
      const esCorrecta = input.value == p.respuesta;
      const mensaje = document.createElement("p");
      mensaje.style.fontWeight = "bold";
      mensaje.style.color = esCorrecta ? "green" : "red";
      mensaje.textContent = esCorrecta
        ? "✅ ¡Correcto!"
        : `❌ Incorrecto. La respuesta correcta es: ${p.opciones[p.respuesta - 1]}`;
      
      const norma = document.createElement("p");
      norma.innerHTML = `<strong>Norma:</strong> ${p.norma}`;
      norma.style.fontStyle = "italic";

      opcionesContainer.querySelectorAll("input").forEach(i => i.disabled = true);

      opcionesContainer.appendChild(mensaje);
      opcionesContainer.appendChild(norma);

      if (esCorrecta) puntuacion++;

      document.getElementById("siguiente-btn").disabled = false;
    });

    opcionesContainer.appendChild(input);
    opcionesContainer.appendChild(label);
    opcionesContainer.appendChild(document.createElement("br"));
  });

  preguntaDiv.appendChild(opcionesContainer);
  contenedor.appendChild(preguntaDiv);

  const siguienteBtn = document.getElementById("siguiente-btn");
  siguienteBtn.disabled = true;
  siguienteBtn.style.display = "inline-block";
}

document.getElementById("siguiente-btn").addEventListener("click", () => {
  indiceActual++;
  mostrarPregunta();
});

function mostrarResultado() {
  const contenedor = document.getElementById("pregunta-container");
  contenedor.innerHTML = `<h2>Resultado final</h2>
  <p>Obtuviste ${puntuacion} de ${preguntas.length} puntos.</p>
  <p>${puntuacion >= 25 ? "🎉 ¡Aprobado!" : "❌ No aprobado"}</p>`;

  document.getElementById("siguiente-btn").style.display = "none";

  guardarResultado();
  mostrarEstadisticas();
}

function guardarResultado() {
  const resultado = {
    fecha: new Date().toLocaleString(),
    puntos: puntuacion
  };

  let historial = JSON.parse(localStorage.getItem("historialTest") || "[]");
  historial.push(resultado);
  localStorage.setItem("historialTest", JSON.stringify(historial));
}

function mostrarEstadisticas() {
    const statsDiv = document.createElement("div");
    statsDiv.style.marginTop = "20px";
    statsDiv.innerHTML = "<h3>📊 Estadísticas</h3>";
  
    const historial = JSON.parse(localStorage.getItem("historialTest") || "[]");
  
    if (historial.length === 0) {
      statsDiv.innerHTML += `<p>No hay estadísticas aún.</p>`;
      return;
    }
  
    const total = historial.length;
    const max = Math.max(...historial.map(r => r.puntos), 0);
    const promedio = (
      historial.reduce((sum, r) => sum + r.puntos, 0) / total
    ).toFixed(2);
    const ultima = historial[historial.length - 1];
  
    statsDiv.innerHTML += `
      <p>Total de tests realizados: <strong>${total}</strong></p>
      <p>Puntuación más alta: <strong>${max}</strong></p>
      <p>Puntuación promedio: <strong>${promedio}</strong></p>
      <p>Último intento: <strong>${ultima.puntos}</strong> puntos (${ultima.fecha})</p>
    `;
  
    // 🔘 Botón para borrar estadísticas
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "🗑️ Borrar estadísticas";
    resetBtn.style.marginTop = "15px";
    resetBtn.style.backgroundColor = "#dc3545";
    resetBtn.style.border = "none";
    resetBtn.style.color = "white";
    resetBtn.style.padding = "8px 12px";
    resetBtn.style.borderRadius = "5px";
    resetBtn.style.cursor = "pointer";
  
    resetBtn.onclick = () => {
      if (confirm("¿Seguro que quieres borrar todas las estadísticas?")) {
        localStorage.removeItem("historialTest");
        location.reload();
      }
    };
  
    statsDiv.appendChild(resetBtn);
  
    document.getElementById("pregunta-container").appendChild(statsDiv);
  }
  