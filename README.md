# Teste Técnico Shopper - Back-end

## Sobre o projeto

### Desenvolvendo Soluções: Atualização de Preços no E-commerce

Em um cenário altamente competitivo de e-commerce, a gestão de preços atualizados se torna um elemento crucial para o sucesso de qualquer empresa. No entanto, quando estamos lidando com lojas que disponibilizam milhares de produtos, essa tarefa se torna complexa e suscetível a erros que podem ter um impacto significativo nos resultados do negócio. Foi nesse contexto desafiador que recebi a missão de criar uma ferramenta que simplificasse e aprimorasse o processo de atualização de preços.

Após minuciosas reuniões com as equipes envolvidas, foram identificados os seguintes requisitos fundamentais:

Time de Compras: Responsáveis por gerar um arquivo CSV contendo códigos de produtos e seus novos preços.

Time Financeiro: Necessidade de evitar preços de venda inferiores aos custos de aquisição, garantindo a sustentabilidade financeira.

Time de Marketing: A preocupação com o impacto nas estratégias de marketing levou à exigência de evitar reajustes superiores ou inferiores a 10% em relação aos preços atuais.

Produtos em Pacotes: Com a venda de produtos em pacotes, tornou-se essencial que a ferramenta atualizasse não apenas o preço do pacote, mas também dos componentes, de forma a manter o valor final do pacote igual à soma dos componentes.

O desenvolvimento dessa solução representa um passo significativo na simplificação de um desafio complexo, proporcionando às empresas de e-commerce uma ferramenta capaz de aprimorar a gestão de preços, a rentabilidade e a satisfação do cliente.

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
   <br> DATABASE_NAME=shopper
   <br> DATABASE_PORT=3306
   <br> DATABASE_PASSWORD=123456

6. Certifique-se de que já importou a base de dados no MySQL com o mesmo nome definido na variável 'DATABASE_NAME'. Se você não possui a base de dados, pode utilizar a que está disponível na pasta raiz, chamada 'database.sql'.
7. Para iniciar o projeto utilize o comando `npm start`

## Testes

Este projeto inclui uma série de testes automatizados para garantir a qualidade do código. Os testes são realizados usando a estrutura de testes Jest.

### Executando os Testes

Para executar os testes, siga estas etapas:

1. Certifique-se de ter concluído todo o processo de configuração e instalação mencionado anteriormente, pois é essencial para que os testes funcionem corretamente.
2. Crie uma base de dados com o nome 'test-shopper' e assegure-se de que ela esteja vazia, sem tabelas ou registros.
3. Para executar os teste utilize o comando `npm run test`
