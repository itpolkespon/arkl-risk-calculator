console.log("script.js loaded");

let logamData = {};

// Load data logam.json
fetch('data/logam.json')
  .then(res => res.json())
  .then(data => {
    logamData = data;
    const sel = document.getElementById("logam");
    Object.keys(data).forEach(key => {
      if(key!=="version") sel.innerHTML += `<option value="${key}">${key}</option>`;
    });
  });

function toggleInputs() {
  const jenis = document.getElementById("jenisRisiko").value;
  document.getElementById("rfdBox").style.display = (jenis === "non") ? "block" : "none";
  document.getElementById("sfBox").style.display = (jenis === "kar") ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", toggleInputs);

function updateLogamData() {
  const selected = document.getElementById("logam").value;
  if(logamData[selected]){
    const data = logamData[selected];
    document.getElementById("RfD").value = data.RfD || "";
    document.getElementById("SF").value = data.SF || "";
    document.getElementById("BAF").value = data.BAF || 1;
  }
}

function hitungRisiko() {
  const Wb  = parseFloat(document.getElementById("Wb").value);
  const UF  = parseFloat(document.getElementById("UF").value)||1;
  const BAF = parseFloat(document.getElementById("BAF").value)||1;
  const jenis = document.getElementById("jenisRisiko").value;

  if(isNaN(Wb) || Wb<=0){ alert("Masukkan berat badan yang valid"); return; }

  let totalIntake=0;
  const hasil = document.getElementById("hasil");
  hasil.className="result";

  const ingestion = [
    {name:"Air Minum", C:parseFloat(document.getElementById("C_air").value)||0, R:parseFloat(document.getElementById("R_air").value)||0},
    {name:"Makanan", C:parseFloat(document.getElementById("C_food").value)||0, R:parseFloat(document.getElementById("R_food").value)||0},
    {name:"Minuman Lain", C:parseFloat(document.getElementById("C_drink").value)||0, R:parseFloat(document.getElementById("R_drink").value)||0}
  ];
  ingestion.forEach(item => { totalIntake += (item.C*item.R)/Wb; });

  const C_airu = parseFloat(document.getElementById("C_airu").value)||0;
  const R_airu = parseFloat(document.getElementById("R_airu").value)||0;
  totalIntake += (C_airu*R_airu)/Wb;

  const C_dermal = parseFloat(document.getElementById("C_dermal").value)||0;
  const SA = parseFloat(document.getElementById("SA").value)||0;
  const AF = parseFloat(document.getElementById("AF").value)||0;
  totalIntake += (C_dermal*SA*AF)/Wb;

  totalIntake *= BAF;

  let output = `<b>Total Intake ADKL:</b> ${totalIntake.toExponential(3)} mg/kg/hari<br>`;

  if(jenis==="non"){
    const RfD = parseFloat(document.getElementById("RfD").value);
    if(isNaN(RfD)||RfD<=0){ alert("Masukkan RfD valid"); return; }
    const HQ = totalIntake / (RfD*UF);
    hasil.classList.add(HQ<=1?"safe":"risk");
    output += `<b>Hazard Quotient (HQ):</b> ${HQ.toFixed(2)}<br>
               <b>Status Risiko:</b> ${HQ<=1?"AMAN":"TIDAK AMAN"}`;
  } else {
    const SF = parseFloat(document.getElementById("SF").value);
    if(isNaN(SF)||SF<=0){ alert("Masukkan SF valid"); return; }
    const ECR = totalIntake*SF;
    let status="";
    if(ECR<=1e-6) status="Risiko Rendah";
    else if(ECR<=1e-4) status="Risiko Sedang";
    else status="Risiko Tinggi";
    hasil.classList.add(ECR<=1e-6?"safe":"risk");
    output += `<b>Excess Cancer Risk (ECR):</b> ${ECR.toExponential(3)}<br>
               <b>Status Risiko:</b> ${status}`;
  }

  hasil.innerHTML = output;
}

function downloadCSV() {
  const Wb  = parseFloat(document.getElementById("Wb").value);
  const UF  = parseFloat(document.getElementById("UF").value)||1;
  const BAF = parseFloat(document.getElementById("BAF").value)||1;
  const jenis = document.getElementById("jenisRisiko").value;
  const logam = document.getElementById("logam").value;

  const version = logamData.version||"-";

  if(!logam || !logamData[logam]){ alert("Pilih logam berat valid"); return; }

  const dataRows=[];

  // Ingestion
  const ingestion = [
    {name:"Air Minum", C:parseFloat(document.getElementById("C_air").value)||0, R:parseFloat(document.getElementById("R_air").value)||0, unit:"mg/L, L/hari"},
    {name:"Makanan", C:parseFloat(document.getElementById("C_food").value)||0, R:parseFloat(document.getElementById("R_food").value)||0, unit:"mg/kg, kg/hari"},
    {name:"Minuman Lain", C:parseFloat(document.getElementById("C_drink").value)||0, R:parseFloat(document.getElementById("R_drink").value)||0, unit:"mg/L, L/hari"}
  ];
  ingestion.forEach(item=>{
    const intake=(item.C*item.R)/Wb*BAF;
    dataRows.push([logam,item.name,item.C,intake.toExponential(3),item.unit,BAF,UF,"Jalur Ingestion"]);
  });

  // Inhalation
  const C_airu=parseFloat(document.getElementById("C_airu").value)||0;
  const R_airu=parseFloat(document.getElementById("R_airu").value)||0;
  const intakeInhal=(C_airu*R_airu)/Wb*BAF;
  dataRows.push([logam,"Inhalasi Udara",C_airu,intakeInhal.toExponential(3),"mg/m³, m³/hari",BAF,UF,"Jalur Inhalation"]);

  // Dermal
  const C_dermal=parseFloat(document.getElementById("C_dermal").value)||0;
  const SA=parseFloat(document.getElementById("SA").value)||0;
  const AF=parseFloat(document.getElementById("AF").value)||0;
  const intakeDermal=(C_dermal*SA*AF)/Wb*BAF;
  dataRows.push([logam,"Dermal Contact",C_dermal,intakeDermal.toExponential(3),"mg/L, cm²/day",BAF,UF,"Jalur Dermal"]);

  // Total
  const totalIntake=ingestion.reduce((acc,item)=>acc+(item.C*item.R)/Wb,0) + (C_airu*R_airu)/Wb + (C_dermal*SA*AF)/Wb;
  dataRows.push([logam,"Total Intake","-", (totalIntake*BAF).toExponential(3), "-", BAF, UF,"Semua Jalur"]);

  // HQ/ECR
  if(jenis==="non"){
    const RfD=parseFloat(document.getElementById("RfD").value);
    const HQ=(totalIntake*BAF)/(RfD*UF);
    dataRows.push([logam,"HQ","-",HQ.toFixed(2),"-",BAF,UF,HQ<=1?"AMAN":"TIDAK AMAN"]);
  } else{
    const SF=parseFloat(document.getElementById("SF").value);
    const ECR=(totalIntake*BAF)*SF;
    let status="";
    if(ECR<=1e-6) status="Risiko Rendah";
    else if(ECR<=1e-4) status="Risiko Sedang";
    else status="Risiko Tinggi";
    dataRows.push([logam,"ECR","-",ECR.toExponential(3),"-",BAF,UF,status]);
  }

  let csvContent=`Tanggal Versi Data: ${version}\r\nLogam,Jalur Paparan,Konsentrasi,Intake (mg/kg/hari),Unit,BAF,UF,Keterangan\r\n`;
  dataRows.forEach(row=>{ csvContent+=row.join(",")+"\r\n"; });

  const blob=new Blob([csvContent],{type:"text/csv;charset=utf-8;"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download="hasil_risiko_lengkap.csv";
  link.click();
}
