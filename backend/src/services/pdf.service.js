const PDFDocument = require("pdfkit");
const { Nomina, NominaDetalle } = require("../modules/nomina/nomina.model.js");
const { Empleado } = require("../modules/trabajadores/trabajador.model.js");

/**
 * Genera un PDF de la nómina.
 * @param {number} nominaId - ID de la nómina
 * @param {*} res - Respuesta HTTP
 */
async function generarNominaPDF(nominaId, res) {
  const nomina = await Nomina.findByPk(nominaId);
  if (!nomina) throw new Error("Nómina no encontrada");

  const detalles = await NominaDetalle.findAll({ where: { nomina_id: nominaId } });
  const empleados = await Empleado.findAll();

  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=nomina-${nomina.periodo}.pdf`);

  doc.pipe(res);

  doc
    .fontSize(20)
    .fillColor("#1d4ed8")
    .text("NÓMINA MENSUAL", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(12)
    .fillColor("#000")
    .text(`Periodo: ${nomina.periodo}`)
    .text(`Generado en: ${new Date(nomina.generado_en).toLocaleString()}`)
    .moveDown(1.5);

  const tableTop = doc.y;
  const itemSpacing = 20;

  const headers = ["Empleado", "Rol", "Tipo", "Días", "Horas", "Entregas", "Base", "Bonos", "Bruto", "ISR", "Vales", "Neto"];
  const colWidths = [100, 60, 60, 40, 40, 60, 60, 60, 60, 60, 60, 60];

  let x = doc.page.margins.left;
  headers.forEach((h, i) => {
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#1f2937").text(h, x, tableTop, {
      width: colWidths[i],
      align: "center",
    });
    x += colWidths[i];
  });

  doc.moveDown(1);

  let y = tableTop + 25;
  detalles.forEach((det) => {
    const emp = empleados.find((e) => e.id === det.empleado_id);
    const row = [
      emp?.nombre || `Empleado ${det.empleado_id}`,
      emp?.rol || "-",
      emp?.tipo || "-",
      det.dias_trabajados,
      det.horas_totales,
      det.entregas_totales,
      `$${Number(det.base).toFixed(2)}`,
      `$${Number(det.bono).toFixed(2)}`,
      `$${Number(det.bruto).toFixed(2)}`,
      `$${Number(det.isr).toFixed(2)}`,
      `$${Number(det.vales).toFixed(2)}`,
      `$${Number(det.neto).toFixed(2)}`,
    ];

    x = doc.page.margins.left;
    row.forEach((cell, i) => {
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#000")
        .text(cell.toString(), x, y, { width: colWidths[i], align: "center" });
      x += colWidths[i];
    });

    y += itemSpacing;

    if (y > doc.page.height - 80) {
      doc.addPage();
      y = doc.page.margins.top;
    }
  });

  const totalBruto = detalles.reduce((acc, d) => acc + Number(d.bruto), 0);
  const totalISR = detalles.reduce((acc, d) => acc + Number(d.isr), 0);
  const totalVales = detalles.reduce((acc, d) => acc + Number(d.vales), 0);
  const totalNeto = detalles.reduce((acc, d) => acc + Number(d.neto), 0);

  doc.moveDown(2);
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#1d4ed8").text("Resumen de Totales", { align: "left" });
  doc.moveDown(0.5);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#000")
    .text(`Total Bruto: $${totalBruto.toFixed(2)}`)
    .text(`Total ISR: $${totalISR.toFixed(2)}`)
    .text(`Total Vales: $${totalVales.toFixed(2)}`)
    .text(`Total Neto: $${totalNeto.toFixed(2)}`);

  doc.moveDown(4);
  doc.fontSize(9).fillColor("#6b7280").text("Documento generado automáticamente por el sistema de nómina", {
    align: "center",
  });

  doc.end();
}

module.exports = { generarNominaPDF };
