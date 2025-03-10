const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

const PSYCHOLOGIST_EMAIL = "psicologo@email.com";

// 🔁 Obter ou criar psicólogo padrão
async function getOrCreatePsychologist() {
  let psychologist = await prisma.user.findUnique({
    where: { email: PSYCHOLOGIST_EMAIL },
  });

  if (!psychologist) {
    psychologist = await prisma.user.create({
      data: {
        name: "Psicólogo Padrão",
        email: PSYCHOLOGIST_EMAIL,
        password: "senha123",
        role: "admin",
      },
    });
  }

  return psychologist;
}

// ✅ Listar agendamentos
router.get("/", async (req, res) => {
  try {
    const psychologist = await getOrCreatePsychologist();
    const appointments = await prisma.appointment.findMany({
      where: { psychologistId: psychologist.id },
      orderBy: { date: "asc" },
      include: { patient: true, payments: true },
    });
    res.json(appointments);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao buscar agendamentos", details: error.message });
  }
});

// ✅ Criar agendamento com pagamento + WhatsApp
router.post("/", async (req, res) => {
  try {
    const { patientId, date, amount, type, link } = req.body;
    if (!patientId || !date || !amount) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios!" });
    }

    const appointmentDate = new Date(date);
    if (appointmentDate < new Date()) {
      return res.status(400).json({ error: "Data não pode ser no passado." });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient)
      return res.status(404).json({ error: "Paciente não encontrado!" });

    const psychologist = await getOrCreatePsychologist();

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        psychologistId: psychologist.id,
        date: appointmentDate,
        status: "scheduled",
        type,
        link,
      },
    });

    await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        status: "A Pagar",
        dueDate: appointmentDate,
        patientId,
        appointmentId: appointment.id,
      },
    });

    const formattedDate = appointmentDate.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });

    let message = ` Olá ${patient.name}, sua consulta foi agendada para ${formattedDate}.`;
    if (type === "remoto" && link) {
      message += `\n Atendimento remoto: ${link}`;
    }
    message += `\n💰 Valor: R$ ${parseFloat(amount).toFixed(2)}`;

    const whatsappURL = `https://wa.me/${
      patient.phone
    }?text=${encodeURIComponent(message)}`;

    res.status(201).json({ appointment, whatsappURL });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao agendar consulta", details: error.message });
  }
});

// ✅ Atualizar agendamento com WhatsApp
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { patientId, date, type, amount, link } = req.body;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment)
      return res.status(404).json({ error: "Consulta não encontrada!" });

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient)
      return res.status(404).json({ error: "Paciente não encontrado!" });

    const updated = await prisma.appointment.update({
      where: { id },
      data: { patientId, date: new Date(date), type, link },
    });

    await prisma.payment.updateMany({
      where: { appointmentId: id },
      data: { amount: parseFloat(amount), dueDate: new Date(date) },
    });

    const formattedDate = new Date(date).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });

    let message = ` Olá ${patient.name}, sua consulta foi atualizada para ${formattedDate}.`;
    if (type === "remoto" && link) {
      message += `\n Novo link: ${link}`;
    }
    message += `\n Valor: R$ ${parseFloat(amount).toFixed(2)}`;

    const whatsappURL = `https://wa.me/${
      patient.phone
    }?text=${encodeURIComponent(message)}`;

    res.status(200).json({ updated, whatsappURL });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao atualizar consulta", details: error.message });
  }
});

// ✅ Atualizar descrição
router.put("/:id/description", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment)
      return res.status(404).json({ error: "Consulta não encontrada!" });

    const updated = await prisma.appointment.update({
      where: { id },
      data: { description },
    });

    res.json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao atualizar descrição", details: error.message });
  }
});

// ✅ Deletar agendamento e pagamentos
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment)
      return res.status(404).json({ error: "Agendamento não encontrado!" });

    await prisma.payment.deleteMany({ where: { appointmentId: id } });
    await prisma.appointment.delete({ where: { id } });

    res.status(200).json({ message: "Agendamento deletado com sucesso!" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao deletar agendamento", details: error.message });
  }
});

module.exports = router;
