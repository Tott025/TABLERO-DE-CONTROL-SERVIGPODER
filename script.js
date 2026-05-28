const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRxwCo5Z1qQNx_W4-PLSLjy5GHGFARpRSTgPfQnm3EKKHy-yPzdYJWqdO2hty666bfo6nuDvJEYJdIb/pub?output=csv";

let datosGlobales = [];
let areasChart;
let horasChart;

async function loadData() {
  try {
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();
    datosGlobales = parseCSV(csvText);
    procesarDatos(datosGlobales);
    document.getElementById("ultimaActualizacion").innerText =
      "Última actualización: " + new Date().toLocaleString();
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
}

function parseCSV(csvText) {
  const rows = csvText.split("\n").map(r => r.split(","));
  const headers = rows[0].map(h => h.trim());
  const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]?.trim());
    return obj;
  });
  return data.filter(r => r["FECHA"] && r["AREA A VISITAR"]);
}

function procesarDatos(data){
  if(data.length === 0){
    document.getElementById("totalRegistros").innerText = "0";
    document.getElementById("personasSitio").innerText = "0";
    document.getElementById("estanciaPromedio").innerText = "0 h";
    document.getElementById("efectividad").innerText = "0%";
    document.getElementById("tablaDatos").querySelector("tbody").innerHTML =
      "<tr><td colspan='8'>No hay registros disponibles</td></tr>";
    return;
  }

  document.getElementById("totalRegistros").innerText = data.length;
  document.getElementById("personasSitio").innerText = data.filter(r => !r["SALIDA"]).length;
  document.getElementById("estanciaPromedio").innerText = calcularEstanciaPromedio(data);
  document.getElementById("efectividad").innerText = calcularEfectividad(data);
  cargarTabla(data);
  cargarGraficaAreas(data);
  cargarGraficaHoras(data);
}

function calcularEstanciaPromedio(data){
  const tiempos = data.map(r => {
    const estancia = r["ESTANCIA"];
    if(!estancia) return 0;
    const partes = estancia.split(":");
    return parseInt(partes[0]) + parseInt(partes[1])/60;
  }).filter(t => !isNaN(t));
  const promedio = tiempos.reduce((a,b)=>a+b,0) / tiempos.length;
  return promedio ? promedio.toFixed(2) + " h" : "0 h";
}

function calcularEfectividad(data){
  const total = data.length;
  const atendidos = data.filter(r => r["ESTADO"] === "ATENDIDO").length;
  const porcentaje = (atendidos / total) * 100;
  return porcentaje.toFixed(0) + "%";
}

function cargarTabla(data){
  const tabla = document.getElementById("tablaDatos").querySelector("tbody");
  tabla.innerHTML = "";
  data.slice(0,12).forEach(row=>{
    tabla.innerHTML += `
      <tr>
        <td>${row["FECHA"] || "-"}</td>
        <td>${row["INGRESO"] || "-"}</td>
        <td>${row["SALIDA"] || "-"}</td>
        <td>${row["VISITANTE"] || "-"}</td>
        <td>${row["AREA A VISITAR"] || "-"}</td>
        <td>${row["ESTADO"] || "-"}</td>
        <td>${row["CEDULA"] || "-"}</td>
        <td>${row["ESTANCIA"] || "-"}</td>
      </tr>
    `;
  });
}

function cargarGraficaAreas(data){
  const conteo = {};
  data.forEach(r=>{
    const area = r["AREA A VISITAR"]?.trim() || "Sin área";
    conteo[area] = (conteo[area] || 0) + 1;
  });

  const labels = Object.keys(conteo);
  const valores = Object.values(conteo);

  const coloresPorArea = {
    "ALMACEN": "#38bdf8",
    "GESTION HUMANA": "#34d399",
    "DESCARGOS": "#f87171",
    "GERENCIA": "#fbbf24",
    "Sin área": "#a78bfa"
  };
  const coloresFinales = labels.map(a => coloresPorArea[a] || "#c084fc");

  if(areasChart){ areasChart.destroy(); }

  areasChart = new Chart(document.getElementById("areasChart"), {
    type:"bar",
    data:{
      labels:labels,
      datasets:[{
        label:"Accesos por área",
        data:valores,
        backgroundColor:coloresFinales,
        borderColor:"#1b263b",
        borderWidth:1
      }]
    },
    options:{
      plugins:{ legend:{ labels:{ color:"white" } } },
      scales:{ x:{ ticks:{ color:"white" } }, y:{ ticks:{ color:"white" } } }
    }
  });
}

function cargarGraficaHoras(data){
  const horas = {};
  data.forEach(r=>{
    const hora = r["INGRESO"]?.split(":")[0] || "Sin hora";
    horas[hora] = (horas[hora] || 0) + 1;
  });
  const labels = Object.keys(horas);
  const valores = Object.values(horas);

  if(horasChart){ horasChart.destroy(); }

  horasChart = new Chart(document.getElementById("horasChart"), {
    type:"line",
    data:{
      labels:labels,
      datasets:[{
        label:"Ingresos por hora",
        data:valores,
        borderColor:"#38bdf8",
        backgroundColor:"#38bdf8",
        fill:false
      }]
    },
    options:{
      plugins:{ legend:{ labels:{ color:"white" } } },
      scales:{ x:{ ticks:{ color:"white" } }, y:{ ticks:{ color:"white" } } }
    }
  });
}

function filtrarFechas(){
  const inicio = document.getElementById("fechaInicio").value;
  const fin = document.getElementById("fechaFin").value;
  const filtrados = datosGlobales.filter(r=>{
    const fecha = convertirFecha(r["FECHA"]);
    return fecha >= new Date(inicio) && fecha <= new Date(fin);
  });
  procesarDatos(filtrados);
}

function convertirFecha(fechaTexto){
  const partes = fechaTexto.split("/");
  return new Date(partes[2], partes[1]-1, partes[0]);
}

loadData();
setInterval(loadData,30000);
