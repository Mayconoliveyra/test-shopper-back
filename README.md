# Teste técnico

## Instalação

1. Clone o repositório: `git clone https://github.com/Mayconoliveyra/test-shopper-back.git`
2. Navegue até o diretório: `cd test-shopper-back`
3. Instale as dependências: `npm install`
4. Crie um arquivo .env no diretório raiz do projeto
5. Configure as variáveis de ambiente no arquivo .env. Você pode usar o arquivo .env.example como modelo, renomeando-o para .env e inserindo as informações necessárias

   SERVER_PORT=
   <br> DATABASE_HOST=
   <br> DATABASE_USER=
   <br> DATABASE_NAME=
   <br> DATABASE_PORT=
   <br> DATABASE_PASSWORD=

   exemplo:
   <br> SERVER_PORT=3030
   <br> DATABASE_HOST=localhost
   <br> DATABASE_USER=root
   <br> DATABASE_NAME=test-shopper
   <br> DATABASE_PORT=3306
   <br> DATABASE_PASSWORD=123456

6. Certifique-se de que já importou a base de dados no MySQL com o mesmo nome definido na variável 'DATABASE_NAME'. Se você não possui a base de dados, pode utilizar a que está disponível na pasta raiz, chamada 'database.sql'.
7. Para iniciar o projeto utilize o comando `npm start`

## Testes

Este projeto inclui uma série de testes automatizados para garantir a qualidade do código. Os testes são realizados usando a estrutura de testes Jest.
<br>Importante: Os testes estão configurados para serem executados na mesma base do projeto, simplificando o processo de teste.

### Executando os Testes

Para executar os testes, siga estas etapas:

1. Certifique-se de ter concluído todo o processo de configuração e instalação mencionado anteriormente, pois é essencial para que os testes funcionem corretamente.
2. Para executar os teste utilize o comando `npm run test`
