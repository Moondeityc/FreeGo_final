(() => {
  const KEYS = { users: 'freego.users', session: 'freego.session', projects: 'freego.projects', proposals: 'freego.proposals', reviews: 'freego.reviews', admins: 'freego.admins', profiles: 'freego.profiles' };
  const categories = ['Desenvolvimento Web', 'Design', 'Marketing Digital', 'Redação', 'Vídeo e Animação', 'Dados e IA', 'Negócios', 'Aplicativos'];
  const demoProfiles = {
    client: { id: 'demo-client', name: 'Ana Costa', email: 'ana@demo.freego', role: 'client' },
    freelancer: { id: 'demo-freelancer', name: 'Carlos Dev', email: 'carlos@demo.freego', role: 'freelancer' },
    admin: { id: 'demo-admin', name: 'Admin Master', email: 'admin@demo.freego', role: 'admin' }
  };
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const id = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fields = (form) => Object.fromEntries([...form.elements].filter((element) => element.name).map((element) => [element.name, element]));
  const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const session = () => read(KEYS.session, null);
  const projects = () => read(KEYS.projects, []);
  const proposals = () => read(KEYS.proposals, []);
  const currentPage = document.body.dataset.page || 'home';
  const say = (message) => { const el = document.querySelector('[data-notice]'); if (el) { el.textContent = message; el.hidden = false; window.setTimeout(() => { el.hidden = true; }, 3800); } else window.alert(message); };

  function seed() {
    if (!localStorage.getItem(KEYS.projects)) write(KEYS.projects, [
      { id: 'sample-web', title: 'Loja virtual para marca local', category: 'Desenvolvimento Web', subcategory: 'E-commerce', budget: 4200, deadline: 30, skills: 'React, UX, pagamentos', description: 'Criar uma loja responsiva para uma marca local, com catálogo, carrinho e integração de pagamento demonstrativa.', ownerId: 'demo-client', ownerName: 'Ana Costa', status: 'Aberto', sample: true },
      { id: 'sample-brand', title: 'Identidade visual para cafeteria', category: 'Design', subcategory: 'Branding', budget: 1600, deadline: 14, skills: 'Logo, identidade visual, Figma', description: 'Desenvolver uma identidade visual acolhedora, incluindo logotipo, paleta e aplicações para redes sociais.', ownerId: 'demo-client', ownerName: 'Ana Costa', status: 'Aberto', sample: true },
      { id: 'sample-social', title: 'Planejamento de conteúdo para redes', category: 'Marketing Digital', subcategory: 'Conteúdo', budget: 950, deadline: 10, skills: 'Instagram, conteúdo, estratégia', description: 'Planejar um mês de conteúdo para uma pequena empresa, com calendário editorial e sugestões de formatos.', ownerId: 'demo-client', ownerName: 'Ana Costa', status: 'Aberto', sample: true }
    ]);
    if (!localStorage.getItem(KEYS.proposals)) write(KEYS.proposals, []);
    if (!localStorage.getItem(KEYS.reviews)) write(KEYS.reviews, []);
    if (!localStorage.getItem(KEYS.admins)) write(KEYS.admins, [{ id: 'admin-base', name: 'Admin Master', email: 'admin@demo.freego', sector: 'Gestão Geral' }]);
    if (!localStorage.getItem(KEYS.profiles)) write(KEYS.profiles, {});
  }

  function header() {
    const nav = document.querySelector('[data-app-nav], #desktop-nav-links');
    if (nav) nav.innerHTML = `<a class="nav-link px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50" href="index.html">Início</a><a class="nav-link px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50" href="projects.html">Projetos</a><a class="nav-link px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50" href="freelancers.html">Profissionais</a><a class="nav-link px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50" href="dashboard.html">Painel</a>${session()?.role === 'admin' ? '<a class="nav-link px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50" href="admin.html">Administração</a>' : ''}`;
    const mobile = document.getElementById('mobile-menu');
    if (mobile) mobile.innerHTML = '<a href="index.html">Início</a><a href="projects.html">Projetos</a><a href="freelancers.html">Profissionais</a><a href="dashboard.html">Painel</a>';
    const account = document.querySelector('[data-app-account], #auth-header-container');
    if (account) {
      const user = session();
      account.innerHTML = user ? `<span class="account-name">${esc(user.name)} · ${esc({ client: 'Contratante', freelancer: 'Freelancer', admin: 'Admin' }[user.role] || '')}</span><button class="button button-quiet button-small" data-logout>Sair</button>` : '<a class="button button-quiet button-small" href="login.html">Entrar</a><a class="button button-primary button-small" href="cadastro.html">Criar conta</a>';
      account.querySelector('[data-logout]')?.addEventListener('click', () => { localStorage.removeItem(KEYS.session); location.href = 'index.html'; });
    }
  }

  function card(project, ownerActions = false) {
    const count = proposals().filter((p) => p.projectId === project.id).length;
    return `<article class="project-card"><div class="card-top"><span class="tag">${esc(project.category)}</span><span class="status">${esc(project.status)}</span></div><h3>${esc(project.title)}</h3><p>${esc(project.description.slice(0, 130))}${project.description.length > 130 ? '…' : ''}</p><div class="card-meta"><span>${money(project.budget)}</span><span>${esc(project.deadline)} dias</span></div><div class="card-footer"><span>Por ${esc(project.ownerName || 'Contratante')} · ${count} proposta${count === 1 ? '' : 's'}</span><a class="text-link" href="project.html?id=${encodeURIComponent(project.id)}">Ver projeto →</a></div>${ownerActions ? `<a class="button button-outline button-small full-button" href="proposals.html?id=${encodeURIComponent(project.id)}">Ver propostas (${count})</a>` : ''}</article>`;
  }

  function home() {
    const list = projects();
    document.querySelectorAll('[data-stat="projects"], #stat-total-projects').forEach((n) => n.textContent = list.length);
    document.querySelectorAll('[data-stat="freelancers"], #stat-active-freelancers').forEach((n) => n.textContent = 4 + read(KEYS.users, []).filter((u) => u.role === 'freelancer').length);
    document.querySelectorAll('[data-stat="proposals"], #stat-total-proposals').forEach((n) => n.textContent = proposals().length);
    document.querySelectorAll('#stat-completed-projects').forEach((n) => n.textContent = list.filter((p) => p.status === 'Concluído').length);
    const grid = document.getElementById('home-recent-projects');
    if (grid) grid.innerHTML = list.slice(0, 3).map((p) => card(p)).join('') || '<p class="empty-state">Ainda não há projetos publicados.</p>';
    const cats = document.getElementById('home-categories-grid');
    if (cats) cats.innerHTML = categories.map((c) => `<a class="category-card" href="projects.html?categoria=${encodeURIComponent(c)}"><span class="category-icon">✦</span><span>${esc(c)}</span></a>`).join('');
  }

  function projectsPage() {
    const target = document.querySelector('[data-content]'); if (!target) return;
    const params = new URLSearchParams(location.search);
    target.innerHTML = `<div class="page-heading"><div><span class="eyebrow">OPORTUNIDADES</span><h1>Explore projetos</h1><p>Encontre um trabalho que combine com suas habilidades.</p></div><a href="publish.html" class="button button-primary">＋ Publicar projeto</a></div><div class="filter-row"><input data-filter-text type="search" placeholder="Buscar por título, descrição ou habilidade"><select data-filter-category><option value="">Todas as categorias</option>${categories.map((c) => `<option>${esc(c)}</option>`).join('')}</select></div><div class="project-grid" data-project-list></div>`;
    const text = target.querySelector('[data-filter-text]'); const cat = target.querySelector('[data-filter-category]');
    cat.value = params.get('categoria') || '';
    const draw = () => { const q = text.value.toLocaleLowerCase('pt-BR'); const list = projects().filter((p) => p.status === 'Aberto' && (!cat.value || p.category === cat.value) && (!q || `${p.title} ${p.description} ${p.skills}`.toLocaleLowerCase('pt-BR').includes(q))); target.querySelector('[data-project-list]').innerHTML = list.map((p) => card(p)).join('') || '<p class="empty-state">Nenhum projeto encontrado. Ajuste os filtros ou publique uma nova oportunidade.</p>'; };
    text.addEventListener('input', draw); cat.addEventListener('change', draw); draw();
  }

  function projectPage() {
    const target = document.querySelector('[data-content]'); if (!target) return;
    const project = projects().find((p) => p.id === new URLSearchParams(location.search).get('id'));
    if (!project) { target.innerHTML = '<div class="empty-state"><h1>Projeto não encontrado</h1><a class="button button-primary" href="projects.html">Voltar aos projetos</a></div>'; return; }
    const user = session(); const own = user?.id === project.ownerId;
    target.innerHTML = `<a class="back-link" href="projects.html">← Voltar aos projetos</a><div class="detail-layout"><article class="detail-card"><span class="tag">${esc(project.category)}${project.subcategory ? ` · ${esc(project.subcategory)}` : ''}</span><span class="status">${esc(project.status)}</span><h1>${esc(project.title)}</h1><p class="muted">Publicado por ${esc(project.ownerName)}</p><div class="detail-facts"><div><small>ORÇAMENTO</small><strong>${money(project.budget)}</strong></div><div><small>PRAZO</small><strong>${esc(project.deadline)} dias</strong></div><div><small>PROPOSTAS</small><strong>${proposals().filter((p) => p.projectId === project.id).length}</strong></div></div><h2>Sobre o projeto</h2><p class="description">${esc(project.description)}</p><h2>Habilidades necessárias</h2><div class="tag-list">${project.skills.split(',').map((s) => `<span class="tag">${esc(s.trim())}</span>`).join('')}</div>${own ? `<a class="button button-primary top-gap" href="proposals.html?id=${encodeURIComponent(project.id)}">Acompanhar propostas</a>` : ''}</article><aside class="form-card"><h2>Envie sua proposta</h2>${!user ? '<p class="muted">Entre ou crie uma conta para apresentar sua proposta.</p><a class="button button-primary full-button" href="login.html">Entrar para continuar</a>' : user.role !== 'freelancer' ? '<p class="muted">Entre como freelancer para enviar uma proposta.</p><a class="button button-outline full-button" href="dashboard.html">Ir ao painel</a>' : `<form data-proposal-form><input type="hidden" name="projectId" value="${esc(project.id)}"><label>Valor proposto (R$)<input name="amount" type="number" min="1" required value="${esc(project.budget)}"></label><label>Prazo de entrega (dias)<input name="days" type="number" min="1" required value="${esc(project.deadline)}"></label><label>Apresentação<textarea name="message" rows="5" required placeholder="Conte como você pode contribuir com este projeto"></textarea></label><button class="button button-primary full-button">Enviar proposta</button><p class="form-hint">Você pode acompanhar o status pelo seu painel.</p></form>`}</aside></div>`;
    target.querySelector('[data-proposal-form]')?.addEventListener('submit', (e) => { e.preventDefault(); const f = fields(e.currentTarget); const list = proposals(); if (list.some((p) => p.projectId === project.id && p.freelancerId === user.id)) return say('Você já enviou uma proposta para este projeto.'); list.push({ id: id(), projectId: project.id, freelancerId: user.id, freelancerName: user.name, amount: Number(f.amount.value), days: Number(f.days.value), message: f.message.value.trim(), status: 'Pendente' }); write(KEYS.proposals, list); say('Proposta enviada com sucesso.'); setTimeout(() => location.href = 'dashboard.html', 500); });
  }

  function publishPage() {
    const target = document.querySelector('[data-content]'); if (!target) return;
    const user = session();
    target.innerHTML = `<div class="page-heading"><div><span class="eyebrow">NOVA OPORTUNIDADE</span><h1>Publique um projeto</h1><p>Descreva o que precisa e receba propostas de profissionais.</p></div></div>${!user ? '<div class="notice-box">Entre como contratante para publicar um projeto. <a href="login.html">Entrar</a></div>' : user.role !== 'client' && user.role !== 'admin' ? '<div class="notice-box">A publicação de projetos está disponível para contratantes. <a href="dashboard.html">Acessar painel</a></div>' : `<form class="form-card wide-form" data-publish-form><div class="form-grid"><label class="span-two">Título do projeto<input name="title" required maxlength="90" placeholder="Ex.: Criar um site institucional"></label><label>Categoria<select name="category" required>${categories.map((c) => `<option>${esc(c)}</option>`).join('')}</select></label><label>Subcategoria<input name="subcategory" placeholder="Ex.: E-commerce"></label><label>Orçamento previsto (R$)<input name="budget" type="number" min="1" required placeholder="2500"></label><label>Prazo estimado (dias)<input name="deadline" type="number" min="1" required placeholder="20"></label><label class="span-two">Habilidades necessárias<input name="skills" required placeholder="React, UX, conteúdo"></label><label class="span-two">Descrição detalhada<textarea name="description" rows="6" required placeholder="Descreva objetivos, entregas e contexto do projeto"></textarea></label></div><div class="form-actions"><a class="button button-quiet" href="dashboard.html">Cancelar</a><button class="button button-primary">Publicar projeto</button></div></form>`}`;
    target.querySelector('[data-publish-form]')?.addEventListener('submit', (e) => { e.preventDefault(); const f = fields(e.currentTarget); const list = projects(); const project = { id: id(), title: f.title.value.trim(), category: f.category.value, subcategory: f.subcategory.value.trim(), budget: Number(f.budget.value), deadline: Number(f.deadline.value), skills: f.skills.value.trim(), description: f.description.value.trim(), ownerId: user.id, ownerName: user.name, status: 'Aberto' }; list.unshift(project); write(KEYS.projects, list); location.href = `project.html?id=${encodeURIComponent(project.id)}`; });
  }

  function dashboard() {
    const target = document.querySelector('[data-content]'); if (!target) return;
    const user = session(); if (!user) { target.innerHTML = '<div class="empty-state"><h1>Acesse seu painel</h1><p>Entre ou cadastre-se para acompanhar seus projetos e propostas.</p><a class="button button-primary" href="login.html">Entrar</a></div>'; return; }
    const mine = projects().filter((p) => p.ownerId === user.id); const sent = proposals().filter((p) => p.freelancerId === user.id);
    let body = '';
    if (user.role === 'client' || user.role === 'admin') body = `<div class="page-heading"><div><span class="eyebrow">ÁREA DO CONTRATANTE</span><h1>Meus projetos</h1><p>Acompanhe oportunidades e propostas recebidas.</p></div><a class="button button-primary" href="publish.html">＋ Novo projeto</a></div><div class="project-grid">${mine.map((p) => card(p, true)).join('') || '<p class="empty-state">Você ainda não publicou projetos. Publique sua primeira oportunidade.</p>'}</div>`;
    else body = `<div class="page-heading"><div><span class="eyebrow">ÁREA DO FREELANCER</span><h1>Minhas propostas</h1><p>Acompanhe as oportunidades às quais você se candidatou.</p></div><a class="button button-primary" href="projects.html">Explorar projetos</a></div><div class="table-wrap"><table><thead><tr><th>Projeto</th><th>Valor</th><th>Prazo</th><th>Status</th><th></th></tr></thead><tbody>${sent.map((p) => { const proj = projects().find((x) => x.id === p.projectId); return `<tr><td>${esc(proj?.title || 'Projeto removido')}</td><td>${money(p.amount)}</td><td>${esc(p.days)} dias</td><td><span class="status">${esc(p.status)}</span></td><td>${proj ? `<a class="text-link" href="project.html?id=${encodeURIComponent(proj.id)}">Abrir</a>` : ''}</td></tr>`; }).join('') || '<tr><td colspan="5">Você ainda não enviou propostas.</td></tr>'}</tbody></table></div>`;
    target.innerHTML = `<div class="dashboard-welcome"><div><span class="eyebrow">PAINEL</span><h1>Olá, ${esc(user.name.split(' ')[0])}!</h1><p>Seu espaço de trabalho FreeGo.</p></div><a href="profile.html" class="button button-outline">Editar perfil</a></div>${body}${user.role === 'admin' ? '<p class="top-gap"><a class="text-link" href="admin.html">Abrir administração →</a></p>' : ''}`;
  }

  function proposalsPage() {
    const target = document.querySelector('[data-content]'); if (!target) return;
    const project = projects().find((p) => p.id === new URLSearchParams(location.search).get('id')); const user = session();
    if (!project || !user || (user.id !== project.ownerId && user.role !== 'admin')) { target.innerHTML = '<div class="empty-state"><h1>Propostas indisponíveis</h1><p>Entre com a conta contratante que publicou o projeto.</p><a href="dashboard.html" class="button button-primary">Voltar ao painel</a></div>'; return; }
    const list = proposals().filter((p) => p.projectId === project.id);
    target.innerHTML = `<a class="back-link" href="dashboard.html">← Voltar ao painel</a><div class="page-heading"><div><span class="eyebrow">PROPOSTAS RECEBIDAS</span><h1>${esc(project.title)}</h1><p>Compare condições e escolha como avançar.</p></div><span class="status">${esc(project.status)}</span></div><div class="proposal-list">${list.map((p) => `<article class="proposal-card"><div><h2>${esc(p.freelancerName)}</h2><p class="muted">${esc(p.message)}</p></div><div class="proposal-facts"><strong>${money(p.amount)}</strong><span>${esc(p.days)} dias</span><span class="status">${esc(p.status)}</span></div>${p.status === 'Pendente' && project.status === 'Aberto' ? `<button class="button button-primary" data-accept="${esc(p.id)}">Aceitar proposta</button>` : p.status === 'Aceita' && project.status === 'Em andamento' ? `<button class="button button-outline" data-complete="${esc(project.id)}">Marcar projeto como concluído</button>` : p.status === 'Aceita' && project.status === 'Concluído' ? `<a class="button button-outline" href="review.html?project=${encodeURIComponent(project.id)}&freelancer=${encodeURIComponent(p.freelancerId)}">Avaliar trabalho</a>` : ''}</article>`).join('') || '<div class="empty-state">Ainda não há propostas. Compartilhe o projeto para receber candidaturas.</div>'}</div>`;
    target.querySelectorAll('[data-accept]').forEach((btn) => btn.addEventListener('click', () => { const next = proposals().map((p) => p.projectId === project.id ? { ...p, status: p.id === btn.dataset.accept ? 'Aceita' : 'Não selecionada' } : p); write(KEYS.proposals, next); write(KEYS.projects, projects().map((p) => p.id === project.id ? { ...p, status: 'Em andamento' } : p)); say('Proposta aceita.'); proposalsPage(); }));
    target.querySelectorAll('[data-complete]').forEach((btn) => btn.addEventListener('click', () => { write(KEYS.projects, projects().map((p) => p.id === project.id ? { ...p, status: 'Concluído' } : p)); say('Projeto marcado como concluído.'); proposalsPage(); }));
  }

  function reviewPage() {
    const target = document.querySelector('[data-content]'); if (!target) return;
    const params = new URLSearchParams(location.search); const user = session(); const project = projects().find((p) => p.id === params.get('project')); const proposal = proposals().find((p) => p.projectId === params.get('project') && p.freelancerId === params.get('freelancer'));
    if (!user || !project || !proposal || user.id !== project.ownerId) { target.innerHTML = '<div class="empty-state"><h1>Avaliação indisponível</h1><a class="button button-primary" href="dashboard.html">Voltar ao painel</a></div>'; return; }
    target.innerHTML = `<div class="page-heading"><div><span class="eyebrow">CONCLUSÃO DO PROJETO</span><h1>Avalie o trabalho</h1><p>${esc(project.title)} · ${esc(proposal.freelancerName)}</p></div></div><form class="form-card narrow-form" data-review-form><label>Nota<select name="stars"><option value="5">★★★★★ — Excelente</option><option value="4">★★★★☆ — Muito bom</option><option value="3">★★★☆☆ — Bom</option><option value="2">★★☆☆☆ — Regular</option><option value="1">★☆☆☆☆ — Precisa melhorar</option></select></label><label>Comentário<textarea name="comment" rows="5" required placeholder="Conte como foi trabalhar com este profissional"></textarea></label><div class="form-actions"><a href="dashboard.html" class="button button-quiet">Cancelar</a><button class="button button-primary">Concluir e avaliar</button></div></form>`;
    target.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const f = fields(e.currentTarget); const reviews = read(KEYS.reviews, []); reviews.push({ id: id(), projectId: project.id, freelancerId: proposal.freelancerId, freelancerName: proposal.freelancerName, author: user.name, stars: Number(f.stars.value), comment: f.comment.value.trim() }); write(KEYS.reviews, reviews); write(KEYS.projects, projects().map((p) => p.id === project.id ? { ...p, status: 'Concluído' } : p)); say('Avaliação salva. Projeto concluído.'); setTimeout(() => location.href = 'dashboard.html', 600); });
  }

  function profilePage() {
    const target = document.querySelector('[data-content]'); if (!target) return; const user = session();
    if (!user) { target.innerHTML = '<div class="empty-state"><h1>Entre para editar seu perfil</h1><a class="button button-primary" href="login.html">Entrar</a></div>'; return; }
    const profiles = read(KEYS.profiles, {}); const profile = profiles[user.id] || {};
    target.innerHTML = `<div class="page-heading"><div><span class="eyebrow">SEU PERFIL</span><h1>Perfil profissional</h1><p>Apresente sua experiência e habilidades.</p></div></div><form class="form-card narrow-form" data-profile-form><label>Nome público<input name="name" required value="${esc(profile.name || user.name)}"></label><label>Área de atuação<select name="area">${categories.map((c) => `<option ${profile.area === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label><label>Experiência<select name="experience">${['Iniciante', 'Pleno', 'Sênior'].map((x) => `<option ${profile.experience === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label><label>Valor por hora (R$)<input name="rate" type="number" min="0" value="${esc(profile.rate || '')}" placeholder="100"></label><label>Habilidades<textarea name="skills" rows="2" placeholder="React, UX, escrita">${esc(profile.skills || '')}</textarea></label><label>Resumo profissional<textarea name="bio" rows="5" placeholder="Conte um pouco sobre sua experiência">${esc(profile.bio || '')}</textarea></label><label>Foto de perfil (URL)<input name="avatar" type="url" placeholder="https://..." value="${esc(profile.avatar || '')}"></label><div class="form-actions"><a href="dashboard.html" class="button button-quiet">Voltar</a><button class="button button-primary">Salvar perfil</button></div></form>`;
    target.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const f = fields(e.currentTarget); profiles[user.id] = { name: f.name.value.trim(), area: f.area.value, experience: f.experience.value, rate: Number(f.rate.value), skills: f.skills.value.trim(), bio: f.bio.value.trim(), avatar: f.avatar.value.trim() }; write(KEYS.profiles, profiles); say('Perfil atualizado.'); setTimeout(() => location.href = 'dashboard.html', 500); });
  }

  function freelancersPage() {
    const target = document.querySelector('[data-content]'); if (!target) return; const users = read(KEYS.users, []).filter((u) => u.role === 'freelancer'); const profiles = read(KEYS.profiles, {});
    const demos = [{ id: 'demo-freelancer', name: 'Carlos Dev', email: '', role: 'freelancer' }, { id: 'demo-freelancer-2', name: 'Marina Design', role: 'freelancer' }, { id: 'demo-freelancer-3', name: 'João Conteúdo', role: 'freelancer' }, { id: 'demo-freelancer-4', name: 'Lia Marketing', role: 'freelancer' }];
    const all = [...demos, ...users].map((u) => ({ ...u, ...(profiles[u.id] || {}) }));
    target.innerHTML = `<div class="page-heading"><div><span class="eyebrow">TALENTOS FREEGO</span><h1>Encontre profissionais</h1><p>Conheça especialistas prontos para colaborar.</p></div></div><div class="filter-row"><input data-freelancer-search type="search" placeholder="Buscar por nome, área ou habilidade"></div><div class="freelancer-grid" data-freelancer-list></div>`;
    const search = target.querySelector('input'); const draw = () => { const q = search.value.toLocaleLowerCase('pt-BR'); const filtered = all.filter((p) => `${p.name} ${p.area || ''} ${p.skills || ''}`.toLocaleLowerCase('pt-BR').includes(q)); target.querySelector('[data-freelancer-list]').innerHTML = filtered.map((p) => `<article class="freelancer-card">${p.avatar ? `<img class="avatar" src="${esc(p.avatar)}" alt="">` : `<div class="avatar avatar-initial">${esc(p.name.charAt(0))}</div>`}<h2>${esc(p.name)}</h2><p class="tag">${esc(p.area || 'Profissional freelancer')}</p><p class="muted">${esc(p.bio || 'Profissional disponível para novos projetos na comunidade FreeGo.')}</p><div class="tag-list">${(p.skills || 'Comunicação, organização').split(',').slice(0, 4).map((s) => `<span class="tag">${esc(s.trim())}</span>`).join('')}</div><strong>${p.rate ? `${money(p.rate)} / hora` : 'Disponível para projetos'}</strong><a class="button button-outline full-button" href="projects.html">Ver projetos compatíveis</a></article>`).join('') || '<p class="empty-state">Nenhum profissional encontrado.</p>'; }; search.addEventListener('input', draw); draw();
  }

  function adminPage() {
    const target = document.querySelector('[data-content]'); if (!target) return; const user = session();
    if (!user || user.role !== 'admin') { target.innerHTML = '<div class="empty-state"><h1>Área administrativa</h1><p>Use o seletor de perfil de demonstração para acessar a administração.</p><a class="button button-primary" href="index.html">Voltar ao início</a></div>'; return; }
    const admins = read(KEYS.admins, []);
    target.innerHTML = `<div class="page-heading"><div><span class="eyebrow">GESTÃO FREEGO</span><h1>Administração</h1><p>Gerencie a equipe de demonstração e acompanhe a atividade.</p></div></div><div class="stats-row"><div class="stat-card"><strong>${projects().length}</strong><span>Projetos</span></div><div class="stat-card"><strong>${proposals().length}</strong><span>Propostas</span></div><div class="stat-card"><strong>${read(KEYS.users, []).length}</strong><span>Contas cadastradas</span></div></div><section class="form-card top-gap"><h2>Adicionar administrador</h2><form class="inline-form" data-admin-form><label>Nome<input name="name" required></label><label>E-mail<input name="email" type="email" required></label><label>Setor<select name="sector"><option>Moderação e suporte</option><option>Tecnologia e infraestrutura</option><option>Financeiro e contratos</option><option>Gestão geral</option></select></label><button class="button button-primary">Cadastrar</button></form></section><h2 class="section-title">Equipe administrativa</h2><div class="table-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Setor</th><th></th></tr></thead><tbody>${admins.map((a) => `<tr><td>${esc(a.name)}</td><td>${esc(a.email)}</td><td>${esc(a.sector)}</td><td>${a.id !== 'admin-base' ? `<button class="text-link danger" data-remove-admin="${esc(a.id)}">Remover</button>` : '—'}</td></tr>`).join('')}</tbody></table></div>`;
    target.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const f = fields(e.currentTarget); const list = read(KEYS.admins, []); if (list.some((a) => a.email.toLowerCase() === f.email.value.toLowerCase())) return say('Este e-mail já está na equipe.'); list.push({ id: id(), name: f.name.value.trim(), email: f.email.value.trim(), sector: f.sector.value }); write(KEYS.admins, list); adminPage(); say('Administrador cadastrado.'); });
    target.querySelectorAll('[data-remove-admin]').forEach((b) => b.addEventListener('click', () => { write(KEYS.admins, read(KEYS.admins, []).filter((a) => a.id !== b.dataset.removeAdmin)); adminPage(); say('Administrador removido.'); }));
  }

  function authPages() {
    const users = read(KEYS.users, []);
    document.querySelector('[data-signup-form]')?.addEventListener('submit', (e) => { e.preventDefault(); const f = fields(e.currentTarget); if (f.password.value.length < 8) return say('A senha precisa ter pelo menos 8 caracteres.'); if (f.password.value !== f.confirmation.value) return say('As senhas não coincidem.'); if (users.some((u) => u.email === f.email.value.trim().toLowerCase())) return say('Já existe uma conta com este e-mail.'); const created = { id: id(), name: f.name.value.trim(), email: f.email.value.trim().toLowerCase(), password: f.password.value, role: f.role.value }; users.push(created); write(KEYS.users, users); write(KEYS.session, created); say('Conta criada. Boas-vindas à FreeGo!'); setTimeout(() => location.href = 'dashboard.html', 600); });
    document.querySelector('[data-login-form]')?.addEventListener('submit', (e) => { e.preventDefault(); const f = fields(e.currentTarget); const email = f.email.value.trim().toLowerCase(); const user = users.find((u) => u.email === email && u.password === f.password.value); if (!user) return say('E-mail ou senha inválidos.'); write(KEYS.session, user); location.href = 'dashboard.html'; });
  }

  seed(); header();
  const renderers = { home, projects: projectsPage, project: projectPage, publish: publishPage, dashboard, proposals: proposalsPage, review: reviewPage, profile: profilePage, freelancers: freelancersPage, admin: adminPage };
  renderers[currentPage]?.();
  authPages();
  window.app = {
    navigateTo: (view) => location.href = view === 'home' ? 'index.html' : view === 'projects' ? 'projects.html' : 'dashboard.html',
    openModal: (modal) => location.href = modal === 'modal-signup' ? 'cadastro.html' : modal === 'modal-publish-project' ? 'publish.html' : 'login.html',
    closeModal: () => {},
    openPublishProjectModal: () => location.href = 'publish.html',
    toggleQuickSwitchMenu: () => document.getElementById('quick-switch-menu')?.classList.toggle('hidden'),
    toggleMobileMenu: () => document.getElementById('mobile-menu')?.classList.toggle('hidden'),
    toggleTheme: () => document.documentElement.classList.toggle('dark'),
    hideToast: () => document.getElementById('notification-toast')?.classList.add('hidden'),
    demoSwitch: (role) => { const demo = demoProfiles[role]; if (demo) { write(KEYS.session, demo); location.href = 'dashboard.html'; } }
  };
})();
