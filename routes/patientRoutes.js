const express = require("express");
const prisma = require("../prismaClient");
const router = express.Router();

const calculateAge = (birthdate) => {
  if (!birthdate) return null;
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

router.get("/", async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { name: "asc" },
    });
    res.json(patients);
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    res.status(500).json({ error: "Erro interno ao buscar pacientes." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, phone, address, birthdate, contact } = req.body;
    const formattedBirthdate = birthdate
      ? new Date(birthdate).toISOString()
      : null;
    const age = birthdate ? calculateAge(birthdate) : null;

    const newPatient = await prisma.patient.create({
      data: {
        name,
        phone,
        address,
        birthdate: formattedBirthdate,
        age,
        contact,
      },
    });

    res.status(201).json(newPatient);
  } catch (error) {
    console.error("Erro ao criar paciente:", error);
    res.status(500).json({ error: "Erro interno ao salvar paciente." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, birthdate, contact } = req.body;
    const formattedBirthdate = birthdate
      ? new Date(birthdate).toISOString()
      : null;
    const age = birthdate ? calculateAge(birthdate) : null;

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        name,
        phone,
        address,
        birthdate: formattedBirthdate,
        age,
        contact,
      },
    });

    res.json(updatedPatient);
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error);
    res.status(500).json({ error: "Erro interno ao atualizar paciente." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.patient.delete({ where: { id } });
    res.json({ message: "Paciente removido com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir paciente:", error);
    res.status(500).json({ error: "Erro interno ao excluir paciente." });
  }
});

module.exports = router;
