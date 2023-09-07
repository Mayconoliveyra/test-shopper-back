import { server } from "./server";

// Verifico se foi configurado a Porta que vai rodar a aplicação, caso contrario retorna mensagem de error.
if (!process.env.SERVER_PORT) {
  console.error(
    "Erro: Para iniciar a aplicação, a variável 'SERVER_PORT' deve ser configurada no arquivo .env"
  );
  process.exit();
}

// Verifico se foi configurado as variáveis de conexão com o banco de dados.
if (
  !process.env.DATABASE_HOST ||
  !process.env.DATABASE_USER ||
  !process.env.DATABASE_NAME ||
  !process.env.DATABASE_PORT ||
  !process.env.DATABASE_PASSWORD
) {
  console.error(`
  Erro: Para iniciar a aplicação, é necessário fornecer as variáveis de conexão com o banco de dados.
  DATABASE_HOST: ${process.env.DATABASE_HOST}
  DATABASE_USER: ${process.env.DATABASE_USER}
  DATABASE_NAME: ${process.env.DATABASE_NAME}
  DATABASE_PORT: ${process.env.DATABASE_PORT}
  DATABASE_PASSWORD: ${process.env.DATABASE_PASSWORD}
  `);

  process.exit();
}

server.listen(process.env.SERVER_PORT, () => {
  console.log(`App rodando na porta ${process.env.SERVER_PORT}`);
});
