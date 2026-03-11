# Documentação de Design: Zombie Art Studio

## 1. Visão Geral
**Título:** Zombie Art Studio
**Gênero:** Simulação / Criatividade / Casual
**Estética:** Pixel Art, Cores Pastel, Estilo "Cozy".

## 2. Personagens
### 2.1 Jogador (Artista)
- **Aparência:** Zumbi de pele verde clara, cabelos vermelhos espetados, camiseta preta, calça escura e sapatos vermelhos.

### 2.2 O Chefe
- **Aparência:** Zumbi grande, gordo e não ameaçador.

## 3. Mecânicas e Economia
### 3.1 Ciclo de Tempo
- **Entrega de Referência:** A cada 2,5 minutos (150s).
- **Tempo de Produção:** O jogador tem 2 minutos (120s) para desenhar e entregar.

### 3.2 Sistema de Recompensa
A avaliação é baseada em cores e composição:
- **Sucesso (Similaridade Alta):** Se cores e silhuetas forem parecidas, o jogador ganha **200 moedas**.
- **Falha (Baixa Similaridade):** Se a obra for muito diferente da referência, o jogador ganha **0 moedas**.
- **Punição por Atraso:** Se não entregar em 2 minutos, o chefe desconta um valor e traz novas obras.

### 3.3 Objetivo
- Acumular **1000 moedas** para vencer. O jogo inicia com **200 moedas**.

## 4. Sistema de Imagens (Referências)
O jogo utiliza um pool de imagens de paisagens e elementos isolados:
1. Montanhas Verdes
2. Girassóis ao Pôr do Sol
3. Gato em Ambiente Rural
4. (Outras paisagens pastel conforme necessário)
