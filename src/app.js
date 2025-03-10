const express = require("express");
const cors = require("cors");
const prisma = require("./prismaClient"); // Se você estiver usando Prisma para o banco de dados
const app = express();
const port = 5000;

// Middlewares
app.use(cors()); // Habilita o CORS para requisições de domínios diferentes
app.use(express.json()); // Permite que o servidor aceite JSON no corpo da requisição

// Rota para salvar a descrição da consulta
app.post("/api/appointments/:id/description", async (req, res) => {
  const { id } = req.params; // Captura o ID da consulta da URL
  const { description } = req.body; // Captura a descrição do corpo da requisição

  try {
    // Verifica se a consulta existe no banco de dados
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }, // Usa o ID da consulta para procurar no banco
    });

    if (!appointment) {
      return res.status(404).json({ error: "Consulta não encontrada!" });
    }

    // Atualiza a descrição da consulta
    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { description },
    });

    res.status(200).json(updatedAppointment); // Retorna a consulta atualizada
  } catch (error) {
    console.error("Erro ao salvar descrição:", error);
    res.status(500).json({ error: "Erro ao salvar descrição." });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
