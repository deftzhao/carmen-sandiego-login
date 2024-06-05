const express = require('express'); // Framework web para Node.js
const cors = require('cors'); // Middleware para habilitar o Cross-Origin Resource Sharing (CORS).
const mongoose = require('mongoose'); // ODM (Object Data Modeling) para MongoDB.
const bodyParser = require('body-parser'); // Middleware para analisar o corpo das solicitações HTTP.

const app = express(); // Cria uma instância do aplicativo Express.
app.use(bodyParser.json()); // Analisa o corpo das solicitações como JSON.
app.use(cors()); // Habilita o CORS para todas as rotas.


// Conecte ao MongoDB Atlas
mongoose.connect('mongodb+srv://deft:revil56123@carmensandiego.7y6nmvm.mongodb.net/?retryWrites=true&w=majority&appName=CarmenSandiego', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado ao MongoDB Atlas'))
    .catch((error) => console.error('Erro ao conectar ao MongoDB Atlas:', error));

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Middleware para lidar com as solicitações OPTIONS
app.options('*', (req, res) => {
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
});

app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    console.log('Dados recebidos para registro:', req.body);

    if (password !== confirmPassword) {
        return res.status(400).send({ message: 'As senhas não coincidem.' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Nome de usuário já registrado.');
            return res.status(400).send({ message: 'Nome de usuário já registrado.' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            console.log('E-mail já registrado.');
            return res.status(400).send({ message: 'E-mail já registrado.' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        console.log('Usuário registrado com sucesso.');
        res.status(201).send({ message: 'Usuário registrado com sucesso.' });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).send({ message: 'Erro ao registrar usuário.', error });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Dados recebidos para login:', req.body);

    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            console.log('Nome de usuário ou senha incorretos.');
            return res.status(400).send({ message: 'Nome de usuário ou senha incorretos.' });
        }

        console.log('Login bem-sucedido.');
        res.status(200).send({ message: 'Login bem-sucedido.' });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).send({ message: 'Erro ao fazer login.', error });
    }
});

// Exporte o modelo User para ser usado em outras partes do código
module.exports = User;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
