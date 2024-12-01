const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const usersFilePath = path.join(__dirname, '../database/db.json');

const readUsersData = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

const writeUsersData = (data) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2), 'utf8');
};

// Endpoint untuk menambahkan nomor dengan delay berdasarkan username
router.post('/add', (req, res) => {
  const { username, number, delay } = req.body;

  if (!username || !number || !delay) {
    return res.status(400).json({ message: 'Username, number, and delay are required' });
  }

  const usersData = readUsersData();

  if (!usersData[username]) {
    usersData[username] = { numbers: {} };
  }

  const userNumbers = usersData[username].numbers;

  // Cari indeks berikutnya untuk nomor
  const nextIndex = Object.keys(userNumbers).length + 1;

  userNumbers[nextIndex] = [number, delay];

  // Simpan data yang telah diupdate
  writeUsersData(usersData);

  return res.status(200).json({
    message: 'Nomor berhasil ditambahkan',
    username,
    number,
    delay,
  });
});

// Endpoint untuk menghapus nomor berdasarkan username dan nomor
router.post('/delete', (req, res) => {
  const { username, number } = req.body;

  if (!username || !number) {
    return res.status(400).json({ message: 'Username and number are required' });
  }

  const usersData = readUsersData();

  if (!usersData[username]) {
    return res.status(404).json({ message: 'Username tidak ditemukan' });
  }

  const userNumbers = usersData[username].numbers;

  // Cari nomor berdasarkan value
  const targetKey = Object.keys(userNumbers).find(key => userNumbers[key][0] === number);

  if (!targetKey) {
    return res.status(404).json({ message: 'Nomor tidak ditemukan' });
  }

  // Hapus nomor dari objek
  delete userNumbers[targetKey];

  // Simpan data yang telah diupdate
  writeUsersData(usersData);

  return res.status(200).json({ message: 'Nomor berhasil dihapus', username, number });
});

module.exports = router;