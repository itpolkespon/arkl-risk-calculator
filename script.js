console.log("script.js loaded");

// Nilai RfD & SF untuk beberapa logam
const logamBerat = {
  Pb: { RfD: 0.003, SF: 0 },
  Cd: { RfD: 0.001, SF: 0 },
  As: { RfD: 0.0003, SF: 1.5 },
  Hg: { RfD: 0.0003, SF: 0 },
  Cr6: { RfD: 0.003, SF: 0.5 }
};

function toggleInputs() {
  const jenis = document.getElementById("jenisRisiko").value;
  document.getElementById("rfdBox").style.display = (jenis === "non") ? "block" : "none";
  document.getElementById("sfBox").style.display = (jenis === "kar") ? "block" : "none";

  const logam = document.getElementById("logam").value;
  document.getElementById("RfD").value = logamBerat[logam].RfD || "";
  document.getElementById("SF").value = logamBerat[logam].SF || "";
}

document.getElementById("logam").addEventListener("change", toggleInputs);
document.addEventListener("DOMContentLoaded", toggleInputs);

function hitungRisiko() {
  // Ambil input jalur
  const C_air = parseFloat(document.getElementById("C_air").value) || 0;
  const R_air = parseFloat(document.getElementById("R_air").value) || 0;

  const C_food = parseFloat(document.getElementById("C_food").value) || 0;
  const R_food = parseFloat(document.getElementById("R_food").value) || 0;

  const C_drink = parseFloat(document.getElementById("C_drink").value) || 0;
  const R_drink = parseFloat(document.getElementById("R_drink").value) || 0;

  const C_airu = parseFloat(document.getElementById("C_airu").value) || 0;
  const R_airu = parseFloat(document.getElementById("R_airu").value) || 0;

  const C_dermal = parseFloat(document.getElementById("C_dermal").value) || 0;
  const SA = parseFloat(document.getElementById("SA").value) || 0;
  const AF = parseFloat(document.getElementById("AF").value) || 0;

  const Dt = parseFloat(document.getElementById("Dt").value);
  const Wb = parseFloat(document.getElementById("Wb").value);
  const tE = parseFloat(document.getElementById("R_airu").value) || 0;
  const fE = 365;

  if (isNaN(Dt) || isNaN(Wb) || Wb <= 0) {
    alert("Berat badan dan durasi harus diisi!");
    return;
  }

  // Intake ingestion (air + food + drink)
  const intake_ingest = (
    (C_air*R_air) +
    (C_food*R_food) +
    (C_drink*R_drink)
  );

  // Intake inhalation (mg/kg/day)
  const intake_inhal = (C_airu * R_airu * tE * fE);

  // Intake dermal
  const intake_dermal = (C_dermal * SA * AF * fE * Dt) / (Wb * Dt * 365);

  const intake_total = (intake_ingest + intake_inhal + intake_dermal) / Wb;

  // Risiko
  const jenis = document.getElementById("jenisRisiko").value;
  const logam = document.getElementById("logam").value;
  const hasilDiv = document.getElementById("hasil");
  hasilDiv.className = "result";

  let output = `<b>Intake Total:</b> ${intake_total.toExponential(3)} mg/kg/hari<br>`;

  if (jenis === "non") {
    const RfD = parseFloat(document.getElementById("RfD").value) || logamBerat[logam].RfD;
    const HQ = intake_total / RfD;
    hasilDiv.classList.add(HQ <= 1 ? "safe" : "risk");
    output += `<b>Hazard Quotient (HQ):</b> ${HQ.toFixed(2)}<br>
               <b>Status:</b> ${(HQ <= 1) ? "AMAN" : "TIDAK AMAN"}`;
  } else {
    const SF = parseFloat(document.getElementById("SF").value) || logamBerat[logam].SF;
    const ECR = intake_total * SF;
    hasilDiv.classList.add(ECR <= 1e-6 ? "safe" : "risk");
    output += `<b>Excess Cancer Risk (ECR):</b> ${ECR.toExponential(3)}<br>
               <b>Status:</b> ${(ECR <= 1e-6) ? "Risiko Rendah" : (ECR <= 1e-4) ? "Sedang" : "Tinggi"}`;
  }

  hasilDiv.innerHTML = output;
}
