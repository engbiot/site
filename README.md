# Biotec Soluções - Plataforma de Engenharia e Consultoria

Esta é a estrutura oficial do portfólio e plataforma de serviços da **Biotec Soluções**, voltada para consultoria em Engenharia Biotecnológica e desenvolvimento de soluções digitais.

## Estrutura do Projeto
O projeto foi desenvolvido utilizando a tríade base da web moderna, condensado em um único arquivo de altíssima performance estrutural para carregamento instantâneo.
- **HTML5:** Estrutura semântica e rotas em blocos.
- **CSS3:** Animações nativas, variáveis espaciais (ZUI - Zoom User Interface) e Glassmorphism.
- **JavaScript (Vanilla):** Controle de matriz espacial (3D Carousel), validação de e-mail e expressões regulares (RegEx) para as máscaras de telefone, além de sistema assíncrono de partículas em Canvas.

## Como Configurar Localmente

1. Crie uma pasta no seu computador com o nome `site-biotec`.
2. Salve o arquivo HTML principal gerado como `index.html` dentro desta pasta.
3. **Mapeamento de Imagens:** Salve as imagens de referência na mesma pasta. Os nomes devem ser exatamente estes (os arquivos devem ser `.png`):
   - `1.png`: Sua foto de perfil profissional.
   - `2.png` até `14.png`: Imagens e vetores descritivos dos serviços.
   - `dna.png`: O ícone em formato PNG (com fundo transparente) que será carregado como máscara no canto superior direito. 
     *Aviso sobre o `dna.png`: Ele não precisa ter a cor verde neon; o CSS do código (mask-image) aplica a cor e o brilho automaticamente.*

## Integrações
- **Formulário:** Totalmente funcional via API estática do Formspree (`https://formspree.io/f/mgojpzen`). Nenhuma configuração de backend é necessária.
- **WhatsApp:** Configurado dinamicamente para abertura do chat via API com o número oficial predefinido.
- **Responsividade:** Utiliza "Mobile First" fallback para as quebras em `768px` (tablets e smartphones).