const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRxwCo5Z1qQNx_W4-PLSLjy5GHGFARpRSTgPfQnm3EKKHy-yPzdYJWqdO2hty666bfo6nuDvJEYJdIb/pub?output=csv";

let datosGlobales = [];
let areasChart;
let horasChart;

async function loadData() {
  Papa.parse(SHEET_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      datosGlobales = results.data.filter(r => r.FECHA && r.AREA);
      if (datosGlobales.length === 0) {
        console.warn("No se encontraron datos válidos en el CSV.");
        return;
      }
      procesarDatos(datosGlobales);
      document.getElementById("ultimaActualizacion").innerText =
        "Última actualización: " + new Date().toLocaleString();
    },
    error: function(err) {
      console.error("Error al cargar datos:", err);
    }
  });
}

function procesarDatos(data){
  document.getElementById("totalRegistros").innerText = data.length;
  document.getElementById("personasSitio").innerText = data.length;
  document.getElementById("estanciaPromedio").innerText = "1:16 h";
  document.getElementById("efectividad").innerText = "93%";
  cargarTabla(data);
  cargarGraficaAreas(data);
  cargarGraficaHoras(data);
}

function cargarTabla(data){
  const tabla = document.getElementById("tablaDatos").querySelector("tbody");
  tabla.innerHTML = "";
  data.slice(0,12).forEach(row=>{
    tabla.innerHTML += `
      <tr>
        <td>${row.FECHA || "-"}</td>
        <td>${row.INGRESO || "-"}</td>
        <td>${row.VISITANTE || "-"}</td>
        <td>${row.AREA || "-"}</td>
        <td>${row.SALIDA || "-"}</td>
      </tr>
    `;
  });
}

function cargarGraficaAreas(data){
  const conteo = {};
  data.forEach(r=>{
    const area = r.AREA?.trim() || "Sin área";
    conteo[area] = (conteo[area] || 0) + 1;
  });
  const labels = Object.keys(conteo);
  const valores = Object.values(conteo);
  if(areasChart){ areasChart.destroy(); }
  areasChart = new Chart(document.getElementById("areasChart"), {
    type:"bar",
    data:{
      labels:labels,
      datasets:[{ label:"Accesos", data:valores, backgroundColor:"#38bdf8" }]
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
    const hora = r.INGRESO?.split(":")[0] || "Sin hora";
    horas[hora] = (horas[hora] || 0) + 1;
  });
  const labels = Object.keys(horas);
  const valores = Object.values(horas);
  if(horasChart){ horasChart.destroy(); }
  horasChart = new Chart(document.getElementById("horasChart"), {
    type:"line",
    data:{
      labels:labels,
      datasets:[{ label:"Ingresos", data:valores, borderColor:"#38bdf8", fill:false }]
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
    const fecha = convertirFecha(r.FECHA);
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
