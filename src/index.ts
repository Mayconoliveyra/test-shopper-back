import { server } from "./server";

// Verifico se foi configurado a Porta que vai rodar a aplicação, caso contrario retorna mensagem de error.
if (!process.env.SERVER_PORT) {
  console.error(
    "Erro: Para iniciar a aplicação, a variável 'SERVER_PORT' deve ser configurada no arquivo .env"
  );
  process.exit();
}

server.listen(process.env.SERVER_PORT, () => {
  console.log(`App rodando na porta ${process.env.SERVER_PORT}`);
});
