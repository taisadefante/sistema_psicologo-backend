const express = require("express");
const prisma = require("../prismaClient");
const router = express.Router();

// Buscar todos os pagamentos
router.get("/", async (req, res) => {
  try {
    const payments = await prisma.payment.findMany();
    res.json(payments);
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Criar um novo pagamento
router.post("/", async (req, res) => {
  try {
    const { patientId, amount, status, dueDate } = req.body;
    const newPayment = await prisma.payment.create({
      data: { patientId, amount, status, dueDate },
    });
    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Atualizar pagamento
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, status, dueDate } = req.body;
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: { amount, status, dueDate },
    });
    res.json(updatedPayment);
  } catch (error) {
    console.error("Erro ao atualizar pagamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Excluir pagamento
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
