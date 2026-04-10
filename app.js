// =============================================
//  GymPro — Aplicación Principal
// =============================================

// ---- State ----
let state = {
  members:  JSON.parse(JSON.stringify(GymData.members)),
  classes:  JSON.parse(JSON.stringify(GymData.classes)),
  payments: JSON.parse(JSON.stringify(GymData.payments)),
  staff:    JSON.parse(JSON.stringify(GymData.staff)),
  currentSection: 'dashboard',
  editingId: null,
  nextId: { members: 100, classes: 100, payments: 100, staff: 100 }
};

// ---- Helpers ----
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function planBadge(plan) {
  const map = { 'Premium': 'badge-purple', 'Estándar': 'badge-blue', 'Básico': 'badge-gray' };
  return `<span class="badge ${map[plan] || 'badge-gray'}">${plan}</span>`;
}

function statusBadge(status) {
  const map = {
    'Activo': 'badge-green', 'Inactivo': 'badge-gray', 'Pendiente': 'badge-orange',
    'Pagado': 'badge-green', 'Vencido': 'badge-red'
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

function roleBadge(role) {
  const map = { 'Entrenador': 'badge-blue', 'Recepción': 'badge-green', 'Limpieza': 'badge-gray', 'Gerente': 'badge-purple' };
  return `<span class="badge ${map[role] || 'badge-gray'}">${role}</span>`;
}

function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function formatMoney(n) {
  return '$' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showToast(msg, type = 'success') {
  const c = $('toastContainer');
  const t = document.createElement('div');
  const icons = { success: '✓', error: '✕', info: 'i' };
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]}</span> ${msg}`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ---- Navigation ----
function navigateTo(section) {
  state.currentSection = section;
  $$('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-section="${section}"]`)?.classList.add('active');
  $$('.section').forEach(s => s.classList.remove('active'));
  $(`section-${section}`)?.classList.add('active');
  const titles = { dashboard: 'Dashboard', members: 'Miembros', classes: 'Clases', payments: 'Pagos', staff: 'Personal' };
  $('topbarTitle').textContent = titles[section] || '';
  const btnLabels = { dashboard: null, members: '+ Nuevo Miembro', classes: '+ Nueva Clase', payments: '+ Nuevo Pago', staff: '+ Nuevo Personal' };
  const btn = $('topbarActionBtn');
  if (btnLabels[section]) { btn.style.display = ''; btn.textContent = btnLabels[section]; }
  else { btn.style.display = 'none'; }
  closeSidebar();
  renderSection(section);
}

function renderSection(section) {
  if (section === 'dashboard') renderDashboard();
  else if (section === 'members')  renderMembers();
  else if (section === 'classes')  renderClasses();
  else if (section === 'payments') renderPayments();
  else if (section === 'staff')    renderStaff();
}

// ---- Sidebar Mobile ----
function openSidebar() {
  $('sidebar').classList.add('open');
  backdrop.classList.add('open');
}
function closeSidebar() {
  $('sidebar').classList.remove('open');
  backdrop.classList.remove('open');
}
const backdrop = document.createElement('div');
backdrop.className = 'sidebar-backdrop';
backdrop.addEventListener('click', closeSidebar);
document.body.appendChild(backdrop);

// ---- Dashboard ----
function renderDashboard() {
  const activeMembers = state.members.filter(m => m.status === 'Activo').length;
  const revenue = state.payments.filter(p => p.status === 'Pagado').reduce((s, p) => s + p.amount, 0);
  $('statMembers').textContent = activeMembers;
  $('statRevenue').textContent = formatMoney(revenue);
  $('statClasses').textContent = state.classes.length;
  $('statStaff').textContent   = state.staff.length;

  // Recent Members (last 5)
  const recent = [...state.members].slice(-5).reverse();
  const tbody = document.querySelector('#recentMembersTable tbody');
  tbody.innerHTML = recent.map(m => `
    <tr>
      <td>
        <div class="member-cell">
          <div class="member-avatar" style="background:${m.color}">${getInitials(m.name)}</div>
          <span>${m.name}</span>
        </div>
      </td>
      <td>${planBadge(m.plan)}</td>
      <td>${statusBadge(m.status)}</td>
    </tr>`).join('');

  // Today's Classes (use Lunes as demo)
  const todayClasses = state.classes.filter(c => c.day === 'Lunes').slice(0, 4);
  $('todayClasses').innerHTML = todayClasses.length
    ? todayClasses.map(c => `
      <div class="today-class-item">
        <span class="today-class-time">${c.time}</span>
        <div class="today-class-info">
          <div class="today-class-name">${c.name}</div>
          <div class="today-class-trainer">${c.trainer}</div>
        </div>
        ${statusBadge(c.enrolled >= c.capacity ? 'Inactivo' : 'Activo')}
      </div>`).join('')
    : '<div class="empty-state"><p>Sin clases hoy</p></div>';

  // Revenue Chart
  const max = Math.max(...GymData.monthlyRevenue.map(m => m.amount));
  $('revenueChart').innerHTML = GymData.monthlyRevenue.map((m, i) => {
    const pct = Math.round((m.amount / max) * 100);
    return `<div class="bar-item ${i === 11 ? 'current' : ''}" style="height:${pct}%" title="${m.month}: ${formatMoney(m.amount)}"></div>`;
  }).join('');
  $('revenueLabels').innerHTML = GymData.monthlyRevenue.map(m => `<div class="bar-label">${m.month}</div>`).join('');

  // Plan Distribution
  const plans = ['Premium', 'Estándar', 'Básico'];
  const colors = { Premium: '#a855f7', Estándar: '#3b82f6', Básico: '#64748b' };
  const total  = state.members.length;
  $('planDistribution').innerHTML = plans.map(p => {
    const count = state.members.filter(m => m.plan === p).length;
    const pct = total ? Math.round((count / total) * 100) : 0;
    return `
      <div class="plan-item">
        <div class="plan-dot" style="background:${colors[p]}"></div>
        <div class="plan-bar-wrap">
          <div class="plan-bar-label"><span>${p}</span><span>${count} (${pct}%)</span></div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%;background:${colors[p]}"></div>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ---- Members ----
function getFilteredMembers() {
  const search = ($('memberSearch')?.value || '').toLowerCase();
  const plan   = $('memberFilter')?.value || '';
  const status = $('memberStatusFilter')?.value || '';
  return state.members.filter(m =>
    (!search || m.name.toLowerCase().includes(search) || m.email.toLowerCase().includes(search)) &&
    (!plan   || m.plan === plan) &&
    (!status || m.status === status)
  );
}

function renderMembers() {
  const members = getFilteredMembers();
  const tbody = document.querySelector('#membersTable tbody');
  if (!members.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">&#128100;</div><p>No se encontraron miembros</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = members.map(m => `
    <tr>
      <td>
        <div class="member-cell">
          <div class="member-avatar" style="background:${m.color}">${getInitials(m.name)}</div>
          <span>${m.name}</span>
        </div>
      </td>
      <td>${m.email}</td>
      <td>${m.phone}</td>
      <td>${planBadge(m.plan)}</td>
      <td>${formatDate(m.expiry)}</td>
      <td>${statusBadge(m.status)}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-secondary" onclick="editMember(${m.id})">Editar</button>
          <button class="btn btn-sm btn-danger"    onclick="deleteMember(${m.id})">Eliminar</button>
        </div>
      </td>
    </tr>`).join('');
}

function openMemberModal(member = null) {
  state.editingId = member ? member.id : null;
  $('modalTitle').textContent = member ? 'Editar Miembro' : 'Nuevo Miembro';
  $('modalBody').innerHTML = `
    <div class="form-group">
      <label class="form-label">Nombre Completo</label>
      <input class="form-input" id="fName" value="${member ? member.name : ''}" placeholder="Ej: Ana García" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="fEmail" type="email" value="${member ? member.email : ''}" placeholder="correo@email.com" />
      </div>
      <div class="form-group">
        <label class="form-label">Teléfono</label>
        <input class="form-input" id="fPhone" value="${member ? member.phone : ''}" placeholder="+34 600 000 000" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Plan</label>
        <select class="form-select" id="fPlan">
          ${['Básico','Estándar','Premium'].map(p => `<option ${member?.plan===p?'selected':''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select class="form-select" id="fStatus">
          ${['Activo','Inactivo','Pendiente'].map(s => `<option ${member?.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Fecha de Alta</label>
        <input class="form-input" id="fJoined" type="date" value="${member ? member.joined : new Date().toISOString().split('T')[0]}" />
      </div>
      <div class="form-group">
        <label class="form-label">Vencimiento</label>
        <input class="form-input" id="fExpiry" type="date" value="${member ? member.expiry : ''}" />
      </div>
    </div>`;
  openModal(() => saveMember());
}

function saveMember() {
  const name  = $('fName').value.trim();
  const email = $('fEmail').value.trim();
  if (!name || !email) { showToast('Nombre y email son obligatorios', 'error'); return false; }
  const colors = ['#3b82f6','#a855f7','#22c55e','#f97316','#ef4444','#06b6d4','#f59e0b'];
  const data = {
    name, email,
    phone:  $('fPhone').value.trim(),
    plan:   $('fPlan').value,
    status: $('fStatus').value,
    joined: $('fJoined').value,
    expiry: $('fExpiry').value,
  };
  if (state.editingId) {
    const idx = state.members.findIndex(m => m.id === state.editingId);
    state.members[idx] = { ...state.members[idx], ...data };
    showToast('Miembro actualizado correctamente');
  } else {
    state.members.push({ id: state.nextId.members++, color: colors[Math.floor(Math.random()*colors.length)], ...data });
    showToast('Miembro agregado correctamente');
  }
  closeModal();
  renderMembers();
  return true;
}

function editMember(id) {
  const m = state.members.find(m => m.id === id);
  if (m) openMemberModal(m);
}

function deleteMember(id) {
  const m = state.members.find(m => m.id === id);
  if (!m) return;
  openConfirmModal(`¿Eliminar a <strong>${m.name}</strong>? Esta acción no se puede deshacer.`, () => {
    state.members = state.members.filter(m => m.id !== id);
    showToast('Miembro eliminado', 'info');
    renderMembers();
  });
}

// ---- Classes ----
function getFilteredClasses() {
  const search = ($('classSearch')?.value || '').toLowerCase();
  const day    = $('classDayFilter')?.value || '';
  return state.classes.filter(c =>
    (!search || c.name.toLowerCase().includes(search) || c.trainer.toLowerCase().includes(search)) &&
    (!day    || c.day === day)
  );
}

function renderClasses() {
  const classes = getFilteredClasses();
  const grid = $('classesGrid');
  if (!classes.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">&#127947;</div><p>No se encontraron clases</p></div>`;
    return;
  }
  grid.innerHTML = classes.map(c => {
    const pct = Math.round((c.enrolled / c.capacity) * 100);
    const fillClass = pct >= 90 ? 'high' : pct >= 60 ? 'mid' : 'low';
    const levelBadgeMap = { 'Todos': 'badge-green', 'Intermedio': 'badge-orange', 'Avanzado': 'badge-red' };
    return `
      <div class="class-card">
        <div class="class-card-header">
          <div>
            <div class="class-name">${c.name}</div>
            <div class="class-trainer">${c.trainer}</div>
          </div>
          <span class="badge ${levelBadgeMap[c.level] || 'badge-gray'}">${c.level}</span>
        </div>
        <div class="class-details">
          <div class="class-detail-row"><span>Día</span><span>${c.day}</span></div>
          <div class="class-detail-row"><span>Horario</span><span>${c.time} h</span></div>
          <div class="class-detail-row"><span>Duración</span><span>${c.duration} min</span></div>
        </div>
        <div class="capacity-bar">
          <div class="capacity-label">
            <span>Ocupación</span>
            <span>${c.enrolled}/${c.capacity}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${fillClass}" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="class-actions">
          <button class="btn btn-sm btn-secondary" style="flex:1" onclick="editClass(${c.id})">Editar</button>
          <button class="btn btn-sm btn-danger"    style="flex:1" onclick="deleteClass(${c.id})">Eliminar</button>
        </div>
      </div>`;
  }).join('');
}

function openClassModal(cls = null) {
  state.editingId = cls ? cls.id : null;
  $('modalTitle').textContent = cls ? 'Editar Clase' : 'Nueva Clase';
  const days = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  const levels = ['Todos','Intermedio','Avanzado'];
  $('modalBody').innerHTML = `
    <div class="form-group">
      <label class="form-label">Nombre de la Clase</label>
      <input class="form-input" id="fcName" value="${cls ? cls.name : ''}" placeholder="Ej: Yoga Matutino" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Entrenador</label>
        <select class="form-select" id="fcTrainer">
          ${state.staff.filter(s => s.role === 'Entrenador').map(s =>
            `<option ${cls?.trainer===s.name?'selected':''}>${s.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Nivel</label>
        <select class="form-select" id="fcLevel">
          ${levels.map(l => `<option ${cls?.level===l?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Día</label>
        <select class="form-select" id="fcDay">
          ${days.map(d => `<option ${cls?.day===d?'selected':''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Horario</label>
        <input class="form-input" id="fcTime" type="time" value="${cls ? cls.time : '08:00'}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Duración (min)</label>
        <input class="form-input" id="fcDuration" type="number" min="15" max="180" value="${cls ? cls.duration : 60}" />
      </div>
      <div class="form-group">
        <label class="form-label">Capacidad máx.</label>
        <input class="form-input" id="fcCapacity" type="number" min="1" value="${cls ? cls.capacity : 20}" />
      </div>
    </div>`;
  openModal(() => saveClass());
}

function saveClass() {
  const name = $('fcName').value.trim();
  if (!name) { showToast('El nombre es obligatorio', 'error'); return false; }
  const colors = ['#3b82f6','#a855f7','#22c55e','#f97316','#ef4444','#06b6d4'];
  const data = {
    name,
    trainer:  $('fcTrainer').value,
    level:    $('fcLevel').value,
    day:      $('fcDay').value,
    time:     $('fcTime').value,
    duration: parseInt($('fcDuration').value) || 60,
    capacity: parseInt($('fcCapacity').value) || 20,
  };
  if (state.editingId) {
    const idx = state.classes.findIndex(c => c.id === state.editingId);
    state.classes[idx] = { ...state.classes[idx], ...data };
    showToast('Clase actualizada correctamente');
  } else {
    state.classes.push({ id: state.nextId.classes++, enrolled: 0, color: colors[Math.floor(Math.random()*colors.length)], ...data });
    showToast('Clase agregada correctamente');
  }
  closeModal();
  renderClasses();
  return true;
}

function editClass(id) {
  const c = state.classes.find(c => c.id === id);
  if (c) openClassModal(c);
}

function deleteClass(id) {
  const c = state.classes.find(c => c.id === id);
  if (!c) return;
  openConfirmModal(`¿Eliminar la clase <strong>${c.name}</strong>?`, () => {
    state.classes = state.classes.filter(c => c.id !== id);
    showToast('Clase eliminada', 'info');
    renderClasses();
  });
}

// ---- Payments ----
function getFilteredPayments() {
  const search = ($('paymentSearch')?.value || '').toLowerCase();
  const status = $('paymentStatusFilter')?.value || '';
  return state.payments.filter(p =>
    (!search || p.member.toLowerCase().includes(search) || p.plan.toLowerCase().includes(search)) &&
    (!status || p.status === status)
  );
}

function renderPayments() {
  const payments = getFilteredPayments();
  const paid    = state.payments.filter(p => p.status === 'Pagado').reduce((s, p) => s + p.amount, 0);
  const pending = state.payments.filter(p => p.status === 'Pendiente').reduce((s, p) => s + p.amount, 0);
  const overdue = state.payments.filter(p => p.status === 'Vencido').reduce((s, p) => s + p.amount, 0);
  $('payStatPaid').textContent    = formatMoney(paid);
  $('payStatPending').textContent = formatMoney(pending);
  $('payStatOverdue').textContent = formatMoney(overdue);

  const tbody = document.querySelector('#paymentsTable tbody');
  if (!payments.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">&#128181;</div><p>No se encontraron pagos</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = payments.map(p => `
    <tr>
      <td style="color:var(--text3)">#${String(p.id).padStart(4,'0')}</td>
      <td>${p.member}</td>
      <td>${planBadge(p.plan)}</td>
      <td style="font-weight:600">${formatMoney(p.amount)}</td>
      <td>${formatDate(p.date)}</td>
      <td>${formatDate(p.dueDate)}</td>
      <td>${statusBadge(p.status)}</td>
      <td>
        <div class="table-actions">
          ${p.status !== 'Pagado' ? `<button class="btn btn-sm btn-success" onclick="markPaid(${p.id})">Marcar Pagado</button>` : ''}
          <button class="btn btn-sm btn-danger" onclick="deletePayment(${p.id})">Eliminar</button>
        </div>
      </td>
    </tr>`).join('');
}

function openPaymentModal() {
  state.editingId = null;
  $('modalTitle').textContent = 'Registrar Pago';
  $('modalBody').innerHTML = `
    <div class="form-group">
      <label class="form-label">Miembro</label>
      <select class="form-select" id="fpMember">
        ${state.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Plan</label>
        <select class="form-select" id="fpPlan">
          <option>Básico</option><option>Estándar</option><option>Premium</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Monto ($)</label>
        <input class="form-input" id="fpAmount" type="number" step="0.01" value="39.99" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Fecha de Pago</label>
        <input class="form-input" id="fpDate" type="date" value="${new Date().toISOString().split('T')[0]}" />
      </div>
      <div class="form-group">
        <label class="form-label">Fecha Vencimiento</label>
        <input class="form-input" id="fpDue" type="date" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Estado</label>
      <select class="form-select" id="fpStatus">
        <option>Pagado</option><option>Pendiente</option>
      </select>
    </div>`;
  openModal(() => savePayment());
}

function savePayment() {
  const memberId = parseInt($('fpMember').value);
  const member   = state.members.find(m => m.id === memberId);
  const amount   = parseFloat($('fpAmount').value);
  if (!member || isNaN(amount)) { showToast('Datos inválidos', 'error'); return false; }
  state.payments.push({
    id: state.nextId.payments++,
    memberId,
    member: member.name,
    plan:    $('fpPlan').value,
    amount,
    date:    $('fpStatus').value === 'Pagado' ? $('fpDate').value : '',
    dueDate: $('fpDue').value,
    status:  $('fpStatus').value,
  });
  showToast('Pago registrado correctamente');
  closeModal();
  renderPayments();
  return true;
}

function markPaid(id) {
  const idx = state.payments.findIndex(p => p.id === id);
  if (idx > -1) {
    state.payments[idx].status = 'Pagado';
    state.payments[idx].date   = new Date().toISOString().split('T')[0];
    showToast('Pago marcado como pagado');
    renderPayments();
  }
}

function deletePayment(id) {
  openConfirmModal('¿Eliminar este registro de pago?', () => {
    state.payments = state.payments.filter(p => p.id !== id);
    showToast('Pago eliminado', 'info');
    renderPayments();
  });
}

// ---- Staff ----
function getFilteredStaff() {
  const search = ($('staffSearch')?.value || '').toLowerCase();
  const role   = $('staffRoleFilter')?.value || '';
  return state.staff.filter(s =>
    (!search || s.name.toLowerCase().includes(search) || s.speciality.toLowerCase().includes(search)) &&
    (!role   || s.role === role)
  );
}

function renderStaff() {
  const staff = getFilteredStaff();
  const grid  = $('staffGrid');
  if (!staff.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">&#128119;</div><p>No se encontró personal</p></div>`;
    return;
  }
  grid.innerHTML = staff.map(s => `
    <div class="staff-card">
      <div class="staff-avatar" style="background:${s.color}">${getInitials(s.name)}</div>
      <div class="staff-name">${s.name}</div>
      <div class="staff-role">${roleBadge(s.role)}</div>
      <div class="staff-info">${s.speciality}</div>
      <div class="staff-info" style="color:var(--text3);font-size:.75rem">${s.email}</div>
      <div class="staff-info" style="color:var(--text3);font-size:.75rem">${s.phone}</div>
      <div class="staff-info" style="color:var(--text3);font-size:.75rem">Desde ${formatDate(s.since)}</div>
      <div class="staff-actions">
        <button class="btn btn-sm btn-secondary" onclick="editStaff(${s.id})">Editar</button>
        <button class="btn btn-sm btn-danger"    onclick="deleteStaff(${s.id})">Eliminar</button>
      </div>
    </div>`).join('');
}

function openStaffModal(member = null) {
  state.editingId = member ? member.id : null;
  $('modalTitle').textContent = member ? 'Editar Personal' : 'Nuevo Personal';
  const roles = ['Entrenador','Recepción','Limpieza','Gerente'];
  $('modalBody').innerHTML = `
    <div class="form-group">
      <label class="form-label">Nombre Completo</label>
      <input class="form-input" id="fsName" value="${member ? member.name : ''}" placeholder="Ej: Sofía Reyes" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Rol</label>
        <select class="form-select" id="fsRole">
          ${roles.map(r => `<option ${member?.role===r?'selected':''}>${r}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Especialidad</label>
        <input class="form-input" id="fsSpeciality" value="${member ? member.speciality : ''}" placeholder="Ej: Yoga & Pilates" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="fsEmail" type="email" value="${member ? member.email : ''}" placeholder="correo@gympro.com" />
      </div>
      <div class="form-group">
        <label class="form-label">Teléfono</label>
        <input class="form-input" id="fsPhone" value="${member ? member.phone : ''}" placeholder="+34 600 000 000" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Fecha de Inicio</label>
      <input class="form-input" id="fsSince" type="date" value="${member ? member.since : new Date().toISOString().split('T')[0]}" />
    </div>`;
  openModal(() => saveStaff());
}

function saveStaff() {
  const name = $('fsName').value.trim();
  const email = $('fsEmail').value.trim();
  if (!name || !email) { showToast('Nombre y email son obligatorios', 'error'); return false; }
  const colors = ['#3b82f6','#a855f7','#22c55e','#f97316','#ef4444','#06b6d4','#f59e0b'];
  const data = {
    name, email,
    role:       $('fsRole').value,
    speciality: $('fsSpeciality').value.trim(),
    phone:      $('fsPhone').value.trim(),
    since:      $('fsSince').value,
  };
  if (state.editingId) {
    const idx = state.staff.findIndex(s => s.id === state.editingId);
    state.staff[idx] = { ...state.staff[idx], ...data };
    showToast('Personal actualizado correctamente');
  } else {
    state.staff.push({ id: state.nextId.staff++, color: colors[Math.floor(Math.random()*colors.length)], ...data });
    showToast('Personal agregado correctamente');
  }
  closeModal();
  renderStaff();
  return true;
}

function editStaff(id) {
  const s = state.staff.find(s => s.id === id);
  if (s) openStaffModal(s);
}

function deleteStaff(id) {
  const s = state.staff.find(s => s.id === id);
  if (!s) return;
  openConfirmModal(`¿Eliminar a <strong>${s.name}</strong> del personal?`, () => {
    state.staff = state.staff.filter(s => s.id !== id);
    showToast('Personal eliminado', 'info');
    renderStaff();
  });
}

// ---- Modal ----
let modalSaveCallback = null;

function openModal(onSave) {
  modalSaveCallback = onSave;
  $('modalOverlay').classList.add('open');
}

function closeModal() {
  $('modalOverlay').classList.remove('open');
  modalSaveCallback = null;
  state.editingId = null;
}

function openConfirmModal(message, onConfirm) {
  $('modalTitle').textContent = 'Confirmar Acción';
  $('modalBody').innerHTML = `<p style="color:var(--text2);line-height:1.6">${message}</p>`;
  $('modalConfirm').textContent = 'Confirmar';
  $('modalConfirm').className = 'btn btn-danger';
  openModal(() => { onConfirm(); closeModal(); $('modalConfirm').textContent = 'Guardar'; $('modalConfirm').className = 'btn btn-primary'; return true; });
}

// ---- Event Listeners ----
document.addEventListener('DOMContentLoaded', () => {
  // Date display
  const now = new Date();
  $('dateDisplay').textContent = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Navigation
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(link.dataset.section);
    });
  });

  // Dashboard "see all" links
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-section]');
    if (link && !link.classList.contains('nav-link')) {
      e.preventDefault();
      navigateTo(link.dataset.section);
    }
  });

  // Sidebar toggle
  $('menuBtn').addEventListener('click', openSidebar);
  $('sidebarToggle').addEventListener('click', closeSidebar);

  // Topbar action button
  $('topbarActionBtn').addEventListener('click', () => {
    const s = state.currentSection;
    if (s === 'members')  openMemberModal();
    if (s === 'classes')  openClassModal();
    if (s === 'payments') openPaymentModal();
    if (s === 'staff')    openStaffModal();
  });

  // Modal buttons
  $('modalClose').addEventListener('click', closeModal);
  $('modalCancel').addEventListener('click', closeModal);
  $('modalOverlay').addEventListener('click', e => { if (e.target === $('modalOverlay')) closeModal(); });
  $('modalConfirm').addEventListener('click', () => { if (modalSaveCallback) modalSaveCallback(); });

  // Search / filter inputs with debounce
  function addFilterListener(inputId, renderFn) {
    const el = $(inputId);
    if (!el) return;
    el.addEventListener('input', () => renderFn());
    el.addEventListener('change', () => renderFn());
  }
  addFilterListener('memberSearch',        renderMembers);
  addFilterListener('memberFilter',        renderMembers);
  addFilterListener('memberStatusFilter',  renderMembers);
  addFilterListener('classSearch',         renderClasses);
  addFilterListener('classDayFilter',      renderClasses);
  addFilterListener('paymentSearch',       renderPayments);
  addFilterListener('paymentStatusFilter', renderPayments);
  addFilterListener('staffSearch',         renderStaff);
  addFilterListener('staffRoleFilter',     renderStaff);

  // Initial render
  navigateTo('dashboard');
});
