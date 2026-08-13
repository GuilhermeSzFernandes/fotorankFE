# Fotec (fotorank-frontend)

Plataforma web para organizar concursos fotográficos: participantes enviam fotos, professores avaliam, administradores controlam as fases do concurso e qualquer visitante pode acompanhar o ranking público. Este repositório é o front-end da plataforma, construído para o **1º Concurso Fotográfico da Etec Carapicuíba**.

## Objetivo

Oferecer, de ponta a ponta, a experiência de um concurso fotográfico institucional:

- Landing page pública com as informações do concurso (inscrições, tema, premiação).
- Cadastro e login de participantes, com recuperação de senha por e-mail.
- Envio de fotos com validação de formato e resolução mínima.
- Avaliação das fotos por professores (notas de 1 a 10 + comentários).
- Painel administrativo para controlar as fases do concurso, gerenciar usuários e acompanhar métricas.
- Ranking público das fotos/participantes, com visibilidade configurável pelo admin.
- Tema claro/escuro, com preferência salva por usuário.

## Tecnologias

- **React 18** + **Vite** — SPA e build tooling.
- **React Router 6** — roteamento client-side.
- **Tailwind CSS 3** — estilização, com um sistema de tokens de cor (CSS variables) que sustenta os temas claro e escuro.
- **Axios** — comunicação com a API REST do back-end.
- **Vercel** — hospedagem (ver `vercel.json`).

## Estrutura

```
src/
  components/   Navbar, Avatar, ProtectedRoute
  contexts/     AuthContext (sessão) e ThemeContext (tema claro/escuro)
  pages/        Home, Login, Register, Upload, Teacher, Admin, Ranking, Settings, ...
  data/         dados estáticos (lista de ETECs)
```

## Rodando localmente

```bash
npm install
npm run dev
```

O `vite.config.js` já faz proxy de `/api` e `/uploads` para o back-end. Se quiser apontar para outra URL de API em produção, defina:

```
VITE_API_URL=https://sua-api.exemplo.com
```

## Repositório relacionado

Back-end (API + banco de dados): [fotorankBE](https://github.com/GuilhermeSzFernandes/fotorankBE)
