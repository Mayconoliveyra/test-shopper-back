import { server } from "./server";

// Verifico se foi configurado a Porta que vai rodar a aplicação, caso contrario retorna mensagem de error.
if (!process.env.PORT) {
  console.error(
    "Erro: Para iniciar a aplicação, a variável 'PORT' deve ser configurada no arquivo .env"
  );
  process.exit();
}

server.listen(process.env.PORT, () => {
  console.log(`App rodando na porta ${process.env.PORT}`);
});
