const express = require("express");
const prisma = require("../prismaClient");
const router = express.Router();

// Criar um novo agendamento de consulta
router.post("/", async (req, res) => {
  try {
    const { patientId, date, status } = req.body;

    // Verifica se os campos obrigatórios foram fornecidos
    if (!patientId || !date) {
      return res
        .status(400)
        .json({ error: "Os campos patientId e date são obrigatórios." });
    }

    // Verifica se o paciente existe
    const patientExists = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patientExists) {
      return res.status(404).json({ error: "Paciente não encontrado." });
    }

    // Converte a data para o formato correto
    const formattedDate = new Date(date);
    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({ error: "Formato de data inválido." });
    }

    // Criar a consulta
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        date: formattedDate,
        status: status || "scheduled",
      },
    });

    res
      .status(201)
      .json({ message: "Consulta agendada com sucesso", appointment });
  } catch (error) {
    console.error("Erro ao agendar consulta:", error);
    res.status(500).json({ error: "Erro interno ao agendar consulta." });
  }
});

// Obter todas as consultas
router.get("/", async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { patient: true },
      orderBy: { date: "asc" },
    });
    res.json(appointments);
  } catch (error) {
    console.error("Erro ao buscar consultas:", error);
    res.status(500).json({ error: "Erro ao buscar consultas." });
  }
});

module.exports = router;
