const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

// ✅ Buscar todos os pagamentos vinculados a consultas
router.get("/", async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        patient: true, // ✅ Inclui dados do paciente
        appointment: true,
      },
      orderBy: { dueDate: "asc" }, // ✅ Ordena pelos mais próximos a vencer
    });

    // ✅ Formata os dados antes de enviar para o frontend
    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      patientName: payment.patient ? payment.patient.name : "Desconhecido",
      amount: payment.amount,
      status: payment.status,
      dueDate: payment.dueDate ? new Date(payment.dueDate).toISOString() : null,
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ✅ Criar um novo pagamento associado a um paciente e consulta
router.post("/", async (req, res) => {
  try {
    const { patientId, appointmentId, amount, status, dueDate } = req.body;

    // Verifica se o paciente existe
    const patientExists = await prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patientExists)
      return res.status(404).json({ error: "Paciente não encontrado!" });

    // Verifica se a consulta existe
    const appointmentExists = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointmentExists)
      return res.status(404).json({ error: "Consulta não encontrada!" });

    const newPayment = await prisma.payment.create({
      data: {
        patientId,
        appointmentId,
        amount: parseFloat(amount),
        status,
        dueDate: new Date(dueDate),
      },
    });

    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ✅ Atualizar status do pagamento
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, status, dueDate } = req.body;

    const updatedPayment = await prisma.payment.update({
      where: { id: id },
      data: {
        amount: parseFloat(amount),
        status,
        dueDate: new Date(dueDate),
      },
    });

    res.json(updatedPayment);
  } catch (error) {
    console.error("Erro ao atualizar pagamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ✅ Excluir pagamento
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.payment.delete({ where: { id } });
    res.json({ message: "Pagamento removido" });
  } catch (error) {
    console.error("Erro ao excluir pagamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;
