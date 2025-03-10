const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

// ✅ Obter os dados do dashboard
router.get("/", async (req, res) => {
  try {
    let { dia, mes, ano } = req.query;

    dia = dia === "todos" ? null : Number(dia);
    mes = mes === "todos" ? null : Number(mes);
    ano = ano === "todos" ? null : Number(ano) || new Date().getFullYear();

    // ✅ Total de pacientes cadastrados
    const totalPacientes = await prisma.patient.count();

    // ✅ Faturamento diário, mensal e anual
    const faturamentoDiario = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        dueDate: {
          gte: new Date(`${ano}-${mes || "01"}-${dia || "01"}T00:00:00.000Z`),
          lt: new Date(`${ano}-${mes || "12"}-${dia || "31"}T23:59:59.999Z`),
        },
      },
    });

    const faturamentoMensal = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        dueDate: {
          gte: new Date(`${ano}-01-01T00:00:00.000Z`),
          lt: new Date(`${ano}-12-31T23:59:59.999Z`),
        },
      },
    });

    const faturamentoAnual = await prisma.payment.aggregate({
      _sum: { amount: true },
    });

    // ✅ Pagamentos pendentes (vencidos e a vencer)
    const pagamentosPendentes = await prisma.payment.findMany({
      where: { status: "pending" },
      include: { patient: true },
      orderBy: { dueDate: "asc" },
    });

    res.json({
      totalPacientes,
      faturamentoDiario: faturamentoDiario._sum.amount || 0,
      faturamentoMensal: faturamentoMensal._sum.amount || 0,
      faturamentoAnual: faturamentoAnual._sum.amount || 0,
      pagamentosPendentes: pagamentosPendentes.map((p) => ({
        id: p.id,
        patientName: p.patient?.name || "Desconhecido",
        amount: p.amount,
        dueDate: new Date(p.dueDate).toLocaleDateString("pt-BR"),
        status: p.status,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    res.status(500).json({ error: "Erro ao carregar dados do dashboard." });
  }
});

module.exports = router;
