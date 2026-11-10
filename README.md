# FreeGo

Protótipo navegável de plataforma para conectar contratantes e profissionais freelancers.

## Páginas e fluxos

- `index.html`: página inicial com indicadores, categorias e projetos em destaque.
- `projects.html`, `project.html`, `publish.html`: explorar, consultar e publicar projetos; freelancers podem enviar propostas.
- `dashboard.html`, `proposals.html`, `review.html`: acompanhar atividades, aceitar uma proposta, concluir o projeto e registrar avaliação.
- `freelancers.html`, `profile.html`: buscar profissionais e editar o perfil.
- `login.html`, `cadastro.html`, `admin.html`: autenticação demonstrativa, criação de conta e administração.

## Como experimentar

Abra `index.html` pelo GitHub Pages ou por um servidor local. Use **Trocar Perfil (Demo)** no cabeçalho para experimentar os fluxos de contratante, freelancer e administrador. Também é possível criar contas na página de cadastro. Exemplos iniciais de projetos e profissionais já aparecem no protótipo.

Projetos, propostas, perfis, contas e avaliações são guardados no `localStorage` do navegador. Assim, as ações continuam disponíveis nesse navegador, mas não são compartilhadas entre visitantes ou dispositivos. Este projeto não tem backend: use dados fictícios e não cadastre senhas reais. A autenticação e os controles administrativos são apenas demonstrativos e não oferecem segurança para produção.

Para reiniciar a demonstração, limpe os dados de armazenamento local do site nas ferramentas de desenvolvimento do navegador.
