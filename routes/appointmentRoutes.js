const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PSYCHOLOGIST_EMAIL = "psicologo@email.com"; // 🔹 Email fixo para verificar

// ✅ Função para obter ou criar o psicólogo fixo
async function getOrCreatePsychologist() {
  let psychologist = await prisma.user.findUnique({
    where: { email: PSYCHOLOGIST_EMAIL },
  });

  if (!psychologist) {
    psychologist = await prisma.user.create({
      data: {
        name: "Psicólogo Padrão",
        email: PSYCHOLOGIST_EMAIL,
        password: "senha123", // 🔹 Defina uma senha segura
        role: "admin",
      },
    });
  }

  return psychologist;
}

// ✅ Buscar todos os agendamentos
router.get("/", async (req, res) => {
  try {
    console.log("🔍 Buscando agendamentos...");
    const psychologist = await getOrCreatePsychologist();

    const appointments = await prisma.appointment.findMany({
      where: { psychologistId: psychologist.id }, // 🔹 Agora usa o ID correto
      include: {
        patient: true,
        payments: true,
      },
    });

    res.json(appointments);
  } catch (error) {
    console.error("❌ Erro ao buscar agendamentos:", error.message);
    res
      .status(500)
      .json({ error: "Erro ao buscar agendamentos", details: error.message });
  }
});

// ✅ Criar um agendamento com pagamento
router.post("/", async (req, res) => {
  try {
    const { patientId, date, amount } = req.body;

    if (!patientId || !date || !amount) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios!" });
    }

    // ✅ Verificar se o paciente existe
    const patientExists = await prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patientExists) {
      return res.status(404).json({ error: "Paciente não encontrado!" });
    }

    // ✅ Obter ou criar o psicólogo fixo
    const psychologist = await getOrCreatePsychologist();

    // ✅ Criar a consulta
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        psychologistId: psychologist.id, // 🔹 Usa o ID correto do psicólogo
        date: new Date(date),
        status: "scheduled",
      },
    });

    // ✅ Criar o pagamento associado
    await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        status: "A Pagar",
        dueDate: new Date(date),
        patientId: patientId,
        appointmentId: appointment.id,
      },
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("❌ Erro ao agendar consulta:", error.message);
    res
      .status(500)
      .json({ error: "Erro interno no servidor.", details: error.message });
  }
});

module.exports = router;
