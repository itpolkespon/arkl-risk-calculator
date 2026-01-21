console.log("script.js loaded");

const logamBerat = {
  Pb:{RfD:0.003, SF:0, BAF:1.2, info:"Pb: Gangguan saraf, darah"},
  Cd:{RfD:0.001, SF:0, BAF:1.5, info:"Cd: Ginjal"},
  As:{RfD:0.0003, SF:1.5, BAF:0.8, info:"As: Kanker, kulit"},
  Hg:{RfD:0.0003, SF:0, BAF:2.0, info:"Hg: Neurologis"},
  Cr6:{RfD:0.003, SF:0.5, BAF:0.5, info:"Cr(VI): Karsinogenik"}
};

function toggleInputs(){
  const jenis = document.getElementById("jenisRisiko").value;
  document.getElementById("rfdBox").style.display = (jenis==="non")?"block":"none";
  document.getElementById("sfBox").style.display = (jenis==="kar")?"block":"none";

  const logam = document.getElementById("logam").value;
  document.getElementById("RfD").value = logamBerat[logam].RfD;
  document.getElementById("SF").value = logamBerat[logam].SF;
  document.getElementById("BAF").value = logamBerat[logam].BAF;
}

document.getElementById("logam").addEventListener("change", toggleInputs);
document.addEventListener("DOMContentLoaded", toggleInputs);

function hitungRisiko(){
  const Wb=parseFloat(document.getElementById("Wb").value)||1;
  const UF=parseFloat(document.getElementById("UF").value)||1;
  const BAF=parseFloat(document.getElementById("BAF").value)||1;
  const jenis=document.getElementById("jenisRisiko").value;
  const logam=document.getElementById("logam").value;
  const hasilDiv=document.getElementById("hasil");
  hasilDiv.className="result";

  // Intake jalur Ingestion
  const C_air=parseFloat(document.getElementById("C_air").value)||0;
  const R_air=parseFloat(document.getElementById("R_air").value)||0;
  const C_food=parseFloat(document.getElementById("C_food").value)||0;
  const R_food=parseFloat(document.getElementById("R_food").value)||0;
  const C_drink=parseFloat(document.getElementById("C_drink").value)||0;
  const R_drink=parseFloat(document.getElementById("R_drink").value)||0;
  const intake_ingest=C_air*R_air + C_food*R_food + C_drink*R_drink;

  // Intake jalur Inhalation
  const C_airu=parseFloat(document.getElementById("C_airu").value)||0;
  const R_airu=parseFloat(document.getElementById("R_airu").value)||0;
  const intake_inhal=C_airu*R_airu*365;

  // Intake jalur Dermal
  const C_dermal=parseFloat(document.getElementById("C_dermal").value)||0;
  const SA=parseFloat(document.getElementById("SA").value)||0;
  const AF=parseFloat(document.getElementById("AF").value)||0;
  const intake_dermal=C_dermal*SA*AF*365;

  // Intake total per kg bw + BAF
  let intake_total=(intake_ingest+intake_inhal+intake_dermal)/Wb*BAF;

  let output=`<b>Intake Total (dengan BAF):</b> ${intake_total.toExponential(3)} mg/kg/hari<br>
              <b>Logam:</b> ${logam} (${logamBerat[logam].info})<br>`;

  if(jenis==="non"){
    const RfD=parseFloat(document.getElementById("RfD").value);
    let HQ=intake_total/RfD/UF;
    hasilDiv.classList.add(HQ<=1?"safe":"risk");
    output+=`<b>HQ (Hazard Quotient):</b> ${HQ.toFixed(2)}<br>
             <b>Status:</b> ${HQ<=1?"AMAN":"TIDAK AMAN"}`;
  } else {
    const SF=parseFloat(document.getElementById("SF").value);
    let ECR=intake_total*SF/UF;
    hasilDiv.classList.add(ECR<=1e-6?"safe":"risk");
    output+=`<b>ECR (Excess Cancer Risk):</b> ${ECR.toExponential(3)}<br>
             <b>Status:</b> ${(ECR<=1e-6)?"Rendah":(ECR<=1e-4)?"Sedang":"Tinggi"}`;
  }

  hasilDiv.innerHTML=output;
  hasilDiv.scrollIntoView({behavior:"smooth"});
}
