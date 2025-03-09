const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ✅ Obter os dados do dashboard
router.get("/", async (req, res) => {
  try {
    const totalPacientes = await prisma.patient.count();
    const totalConsultas = await prisma.appointment.count();
    const consultasConcluidas = await prisma.appointment.count({
      where: { status: "completed" },
    });

    const faturamentoTotal = await prisma.payment.aggregate({
      _sum: { amount: true },
    });

    const consultasPorPsicologo = await prisma.appointment.groupBy({
      by: ["psychologistId"],
      _count: { id: true },
    });

    const ultimosAgendamentos = await prisma.appointment.findMany({
      include: { patient: true, psychologist: true },
      orderBy: { date: "desc" },
      take: 5,
    });

    const pagamentosPendentes = await prisma.payment.findMany({
      where: { status: "pending" },
      include: { patient: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    });

    res.json({
      totalPacientes,
      totalConsultas,
      consultasConcluidas,
      faturamentoTotal: faturamentoTotal._sum.amount || 0,
      consultasPorPsicologo,
      ultimosAgendamentos,
      pagamentosPendentes,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error.message);
    res.status(500).json({ error: "Erro ao carregar dados do dashboard." });
  }
});

module.exports = router;
