// relatorios.js - Módulo de Relatórios TransCloud (dados fictícios, sem scroll automático)

let chartReceitaInstance = null;
let chartEntregasInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('chartReceita')) return;
    inicializarFiltros();
    carregarGraficos();
    carregarHistorico();
    configurarEventListeners();
});

/* ========== FILTROS ========== */
function inicializarFiltros() {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    document.getElementById('dataInicial').valueAsDate = primeiroDia;
    document.getElementById('dataFinal').valueAsDate = hoje;
}

function obterPeriodo() {
    const ini = document.getElementById('dataInicial').value;
    const fim = document.getElementById('dataFinal').value;
    return { inicio: ini || null, fim: fim || null };
}

function filtrarPorPeriodo(lista, campoData, periodo) {
    if (!periodo.inicio && !periodo.fim) return lista;
    return lista.filter(item => {
        const d = item[campoData];
        if (!d) return false;
        if (periodo.inicio && d < periodo.inicio) return false;
        if (periodo.fim && d > periodo.fim) return false;
        return true;
    });
}

/* ========== EVENT LISTENERS ========== */
function configurarEventListeners() {
    document.querySelectorAll('.report-card').forEach(card => {
        card.addEventListener('click', () => {
            const tipo = card.dataset.report;
            if (!tipo) return;
            document.getElementById('tipoRelatorio').value = tipo;
            gerarRelatorioAtual();
            destacarCard(card);
        });
    });

    document.getElementById('btnFiltrar').addEventListener('click', gerarRelatorioAtual);

    document.getElementById('btnLimparFiltros').addEventListener('click', () => {
        inicializarFiltros();
        document.getElementById('tipoRelatorio').value = 'todos';
        document.getElementById('reportResultCard').style.display = 'none';
        document.querySelectorAll('.report-card').forEach(c => c.classList.remove('active'));
        showToast('Filtros limpos', 'info');
    });

    document.getElementById('tipoRelatorio').addEventListener('change', gerarRelatorioAtual);
}

function gerarRelatorioAtual() {
    const tipo = document.getElementById('tipoRelatorio').value;
    const periodo = obterPeriodo();

    if (periodo.inicio && periodo.fim && periodo.inicio > periodo.fim) {
        showToast('Data inicial não pode ser maior que a final', 'error');
        return;
    }

    if (tipo === 'todos') {
        document.getElementById('reportResultCard').style.display = 'none';
        document.querySelectorAll('.report-card').forEach(c => c.classList.remove('active'));
        showToast('Selecione um tipo de relatório', 'info');
        return;
    }

    const card = document.querySelector(`.report-card[data-report="${tipo}"]`);
    if (card) destacarCard(card);

    gerarRelatorioDetalhado(tipo, periodo);
}

function destacarCard(card) {
    document.querySelectorAll('.report-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
}

/* ========== GERAÇÃO DE RELATÓRIOS (SEM SCROLL) ========== */
function gerarRelatorioDetalhado(tipo, periodo) {
    const container = document.getElementById('reportResultCard');
    const titulo = document.getElementById('reportTitle');
    const saida = document.getElementById('reportOutput');

    container.style.display = 'block';
    saida.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Gerando relatório...</p></div>';

    setTimeout(() => {
        let html = '', tituloTexto = '';
        switch (tipo) {
            case 'viagens': tituloTexto = 'Relatório de Viagens'; html = relatorioViagens(periodo); break;
            case 'financeiro': tituloTexto = 'Relatório Financeiro'; html = relatorioFinanceiro(periodo); break;
            case 'motoristas': tituloTexto = 'Relatório por Motorista'; html = relatorioMotoristas(periodo); break;
            case 'veiculos': tituloTexto = 'Relatório por Veículo'; html = relatorioVeiculos(periodo); break;
            case 'entregas': tituloTexto = 'Relatório de Entregas'; html = relatorioEntregas(periodo); break;
            default: tituloTexto = 'Relatório'; html = '<div class="empty-state">Tipo inválido</div>';
        }
        titulo.textContent = tituloTexto;
        saida.innerHTML = html;
        // Removido scrollIntoView propositalmente
        registrarHistorico(tipo, tituloTexto);
        carregarHistorico();
        showToast('Relatório gerado com sucesso!', 'success');
    }, 400);
}

/* ========== DADOS FICTÍCIOS ABRANGENTES ========== */
function getViagens() {
    try { return (typeof getData === 'function' && typeof STORAGE_KEYS !== 'undefined') ? (getData(STORAGE_KEYS.VIAGENS) || []) : getViagensExemplo(); }
    catch (e) { return getViagensExemplo(); }
}
function getMotoristas() {
    try { return (typeof getData === 'function' && typeof STORAGE_KEYS !== 'undefined') ? (getData(STORAGE_KEYS.MOTORISTAS) || []) : getMotoristasExemplo(); }
    catch (e) { return getMotoristasExemplo(); }
}
function getVeiculos() {
    try { return (typeof getData === 'function' && typeof STORAGE_KEYS !== 'undefined') ? (getData(STORAGE_KEYS.VEICULOS) || []) : getVeiculosExemplo(); }
    catch (e) { return getVeiculosExemplo(); }
}

function getViagensExemplo() {
    return [
        { id:1001, origem:'São Paulo/SP', destino:'Rio de Janeiro/RJ', motorista:'João Silva', veiculo:'ABC1D23', data:'2026-05-05', status:'Concluída', valor:3200 },
        { id:1002, origem:'São Paulo/SP', destino:'Curitiba/PR', motorista:'Maria Santos', veiculo:'DEF4E56', data:'2026-05-12', status:'Concluída', valor:2100 },
        { id:1003, origem:'Campinas/SP', destino:'Belo Horizonte/MG', motorista:'Pedro Costa', veiculo:'GHI7F89', data:'2026-06-02', status:'Concluída', valor:2800 },
        { id:1004, origem:'São Paulo/SP', destino:'Salvador/BA', motorista:'Ana Oliveira', veiculo:'ABC1D23', data:'2026-06-18', status:'Concluída', valor:4100 },
        { id:1005, origem:'Santos/SP', destino:'São Paulo/SP', motorista:'Carlos Souza', veiculo:'DEF4E56', data:'2026-07-01', status:'Cancelada', valor:900 },
        { id:1006, origem:'São Paulo/SP', destino:'Porto Alegre/RS', motorista:'João Silva', veiculo:'GHI7F89', data:'2026-07-10', status:'Concluída', valor:3600 },
        { id:1007, origem:'Rio de Janeiro/RJ', destino:'Vitória/ES', motorista:'Maria Santos', veiculo:'ABC1D23', data:'2026-07-15', status:'Em andamento', valor:1500 },
        { id:1008, origem:'Belo Horizonte/MG', destino:'Brasília/DF', motorista:'Pedro Costa', veiculo:'DEF4E56', data:'2026-07-20', status:'Pendente', valor:2200 },
        { id:1009, origem:'Curitiba/PR', destino:'Florianópolis/SC', motorista:'Ana Oliveira', veiculo:'GHI7F89', data:'2026-07-22', status:'Concluída', valor:1800 },
        { id:1010, origem:'São Paulo/SP', destino:'Goiânia/GO', motorista:'Carlos Souza', veiculo:'ABC1D23', data:'2026-07-25', status:'Concluída', valor:2900 }
    ];
}
function getMotoristasExemplo() {
    return [
        { nome:'João Silva', cnh:'12345678900', telefone:'(11) 99999-0001', status:'Disponível' },
        { nome:'Maria Santos', cnh:'98765432100', telefone:'(21) 98888-0002', status:'Em viagem' },
        { nome:'Pedro Costa', cnh:'45612378900', telefone:'(31) 97777-0003', status:'Disponível' },
        { nome:'Ana Oliveira', cnh:'78932145600', telefone:'(41) 96666-0004', status:'Disponível' },
        { nome:'Carlos Souza', cnh:'32165498700', telefone:'(51) 95555-0005', status:'Inativo' }
    ];
}
function getVeiculosExemplo() {
    return [
        { modelo:'Volvo FH 540', placa:'ABC1D23', ano:2022, capacidade:25000, status:'Disponível' },
        { modelo:'Scania R450', placa:'DEF4E56', ano:2023, capacidade:22000, status:'Em viagem' },
        { modelo:'Mercedes Actros', placa:'GHI7F89', ano:2021, capacidade:24000, status:'Disponível' }
    ];
}

/* ========== RELATÓRIOS INDIVIDUAIS ========== */
function relatorioViagens(periodo) {
    const viagens = filtrarPorPeriodo(getViagens(), 'data', periodo);
    const total = viagens.length;
    const concluidas = viagens.filter(v=>v.status==='Concluída').length;
    const emAndamento = viagens.filter(v=>v.status==='Em andamento').length;
    const receita = viagens.reduce((s,v)=>s+(v.valor||0),0);
    return `
        <div class="summary-grid">
            <div class="summary-item"><div class="summary-label">Total Viagens</div><div class="summary-value trips">${total}</div></div>
            <div class="summary-item"><div class="summary-label">Concluídas</div><div class="summary-value">${concluidas}</div></div>
            <div class="summary-item"><div class="summary-label">Em Andamento</div><div class="summary-value">${emAndamento}</div></div>
            <div class="summary-item"><div class="summary-label">Receita Total</div><div class="summary-value revenue">${formatCurrency(receita)}</div></div>
        </div>
        <div class="table-responsive">
            <table class="report-table" id="tabelaRelatorio">
                <thead><tr><th>ID</th><th>Origem</th><th>Destino</th><th>Motorista</th><th>Data</th><th>Status</th><th>Valor</th></tr></thead>
                <tbody>${total ? viagens.map(v=>`<tr><td>#${v.id||'-'}</td><td>${v.origem}</td><td>${v.destino}</td><td>${v.motorista}</td><td>${formatarData(v.data)}</td><td><span class="status-badge ${statusClass(v.status)}">${v.status}</span></td><td class="revenue">${formatCurrency(v.valor)}</td></tr>`).join('') : `<tr><td colspan="7" class="text-center text-muted">Nenhuma viagem no período</td></tr>`}</tbody>
            </table>
        </div>`;
}

function relatorioFinanceiro(periodo) {
    const viagens = filtrarPorPeriodo(getViagens(), 'data', periodo);
    const receita = viagens.reduce((s,v)=>s+(v.valor||0),0);
    const ticket = viagens.length ? receita/viagens.length : 0;
    const porMes = agruparReceitaPorMes(viagens);
    return `
        <div class="summary-grid">
            <div class="summary-item"><div class="summary-label">Receita Total</div><div class="summary-value revenue">${formatCurrency(receita)}</div></div>
            <div class="summary-item"><div class="summary-label">Ticket Médio</div><div class="summary-value">${formatCurrency(ticket)}</div></div>
            <div class="summary-item"><div class="summary-label">Viagens</div><div class="summary-value trips">${viagens.length}</div></div>
            <div class="summary-item"><div class="summary-label">Meses</div><div class="summary-value">${Object.keys(porMes).length}</div></div>
        </div>
        <div class="table-responsive">
            <table class="report-table" id="tabelaRelatorio">
                <thead><tr><th>Mês</th><th>Viagens</th><th>Receita</th><th>Média</th></tr></thead>
                <tbody>${Object.entries(porMes).sort().map(([mes,valor])=>{
                    const qtd = viagens.filter(v=>v.data?.startsWith(mes)).length;
                    return `<tr><td><strong>${formatarMesLabel(mes)}</strong></td><td>${qtd}</td><td class="revenue">${formatCurrency(valor)}</td><td>${formatCurrency(qtd?valor/qtd:0)}</td></tr>`;
                }).join('') || `<tr><td colspan="4" class="text-center text-muted">Sem dados</td></tr>`}</tbody>
            </table>
        </div>`;
}

function relatorioMotoristas(periodo) {
    const viagens = filtrarPorPeriodo(getViagens(), 'data', periodo);
    const motoristas = getMotoristas().map(m=>{
        const v = viagens.filter(v=>v.motorista===m.nome);
        const valor = v.reduce((s,i)=>s+(i.valor||0),0);
        return { nome:m.nome, viagens:v.length, valor, media: v.length?valor/v.length:0 };
    }).sort((a,b)=>b.valor-a.valor);
    const max = motoristas[0]?.valor || 1;
    return `<div class="table-responsive">
        <table class="report-table" id="tabelaRelatorio">
            <thead><tr><th>#</th><th>Motorista</th><th>Viagens</th><th>Valor Total</th><th>Média</th><th>Performance</th></tr></thead>
            <tbody>${motoristas.length ? motoristas.map((m,i)=>`<tr><td>${i+1}º</td><td>${m.nome}</td><td>${m.viagens}</td><td class="revenue">${formatCurrency(m.valor)}</td><td>${formatCurrency(m.media)}</td><td><div class="performance-bar"><div class="performance-fill" style="width:${Math.min((m.valor/max)*100,100)}%"></div></div></td></tr>`).join('') : `<tr><td colspan="6" class="text-center text-muted">Nenhum motorista</td></tr>`}</tbody>
        </table></div>`;
}

function relatorioVeiculos(periodo) {
    const viagens = filtrarPorPeriodo(getViagens(), 'data', periodo);
    const veiculos = getVeiculos().map(v=>{
        const vv = viagens.filter(vi=>vi.veiculo===v.placa);
        const valor = vv.reduce((s,i)=>s+(i.valor||0),0);
        return { ...v, viagens:vv.length, valor };
    });
    return `<div class="table-responsive">
        <table class="report-table" id="tabelaRelatorio">
            <thead><tr><th>Veículo</th><th>Placa</th><th>Viagens</th><th>Receita</th><th>Status</th></tr></thead>
            <tbody>${veiculos.length ? veiculos.map(v=>`<tr><td><strong>${v.modelo}</strong></td><td>${v.placa}</td><td>${v.viagens}</td><td class="revenue">${formatCurrency(v.valor)}</td><td><span class="status-badge ${v.status==='Disponível'?'completed':'in-progress'}">${v.status}</span></td></tr>`).join('') : `<tr><td colspan="5" class="text-center text-muted">Nenhum veículo</td></tr>`}</tbody>
        </table></div>`;
}

function relatorioEntregas(periodo) {
    const viagens = filtrarPorPeriodo(getViagens(), 'data', periodo);
    const statusCount = { concluidas:0, emAndamento:0, pendentes:0, canceladas:0 };
    viagens.forEach(v=>{
        if(v.status==='Concluída') statusCount.concluidas++;
        else if(v.status==='Em andamento') statusCount.emAndamento++;
        else if(v.status==='Pendente') statusCount.pendentes++;
        else if(v.status==='Cancelada') statusCount.canceladas++;
    });
    const total = Object.values(statusCount).reduce((a,b)=>a+b,0);
    const taxa = total ? ((statusCount.concluidas/total)*100).toFixed(1) : 0;
    const labels = { concluidas:'Concluída', emAndamento:'Em andamento', pendentes:'Pendente', canceladas:'Cancelada' };
    return `
        <div class="summary-grid">
            <div class="summary-item"><div class="summary-label">Total</div><div class="summary-value trips">${total}</div></div>
            <div class="summary-item"><div class="summary-label">Taxa Sucesso</div><div class="summary-value revenue">${taxa}%</div></div>
            <div class="summary-item"><div class="summary-label">Concluídas</div><div class="summary-value">${statusCount.concluidas}</div></div>
            <div class="summary-item"><div class="summary-label">Canceladas</div><div class="summary-value">${statusCount.canceladas}</div></div>
        </div>
        <div class="table-responsive">
            <table class="report-table" id="tabelaRelatorio">
                <thead><tr><th>Status</th><th>Qtd</th><th>%</th><th>Progresso</th></tr></thead>
                <tbody>${total ? Object.entries(statusCount).map(([k,v])=>`<tr><td><span class="status-badge ${statusClass(labels[k])}">${labels[k]}</span></td><td><strong>${v}</strong></td><td>${((v/total)*100).toFixed(1)}%</td><td><div class="progress-bar"><div class="progress-fill" style="width:${(v/total)*100}%"></div></div></td></tr>`).join('') : `<tr><td colspan="4" class="text-center text-muted">Sem entregas</td></tr>`}</tbody>
            </table>
        </div>`;
}

/* ========== GRÁFICOS ========== */
function carregarGraficos() {
    carregarGraficoReceita();
    carregarGraficoEntregas();
}

function carregarGraficoReceita() {
    const canvas = document.getElementById('chartReceita');
    if (!canvas || typeof Chart === 'undefined') return;
    const viagens = getViagens();
    const receitaPorMes = agruparReceitaPorMes(viagens);
    const meses = Object.keys(receitaPorMes).sort();
    if (chartReceitaInstance) chartReceitaInstance.destroy();
    chartReceitaInstance = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: meses.map(formatarMesLabel),
            datasets: [{
                label: 'Receita',
                data: meses.map(m => receitaPorMes[m]),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true } },
                tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` } }
            },
            scales: {
                y: { beginAtZero: true, ticks: { callback: v => formatCurrency(v) }, grid: { drawBorder: false } },
                x: { grid: { display: false } }
            }
        }
    });
}

function carregarGraficoEntregas() {
    const canvas = document.getElementById('chartEntregas');
    if (!canvas || typeof Chart === 'undefined') return;
    const viagens = getViagens();
    const concluidas = viagens.filter(v=>v.status==='Concluída').length;
    const andamento = viagens.filter(v=>v.status==='Em andamento').length;
    const pendentes = viagens.filter(v=>v.status==='Pendente').length;
    const canceladas = viagens.filter(v=>v.status==='Cancelada').length;
    if (chartEntregasInstance) chartEntregasInstance.destroy();
    chartEntregasInstance = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Concluídas', 'Em Andamento', 'Pendentes', 'Canceladas'],
            datasets: [{
                data: [concluidas, andamento, pendentes, canceladas],
                backgroundColor: ['#059669', '#2563eb', '#d97706', '#dc2626'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } },
            cutout: '65%'
        }
    });
}

/* ========== HISTÓRICO ========== */
function carregarHistorico() {
    const historico = obterHistorico();
    const tbody = document.getElementById('historicoRelatorios');
    if (!tbody) return;
    tbody.innerHTML = historico.map(item => `
        <tr>
            <td>${item.data}</td>
            <td><span class="report-type-indicator">${iconeTipo(item.tipoChave)} ${item.tipo}</span></td>
            <td>${item.periodo}</td>
            <td><span class="status-badge ${item.status==='Concluído'?'completed':'pending'}">${item.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick="visualizarDoHistorico('${item.tipoChave}')" title="Visualizar">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3.33C4.67 3.33 1.67 5.67.67 8.67c1 3 4 5.33 7.33 5.33s6.33-2.33 7.33-5.33c-1-3-4-5.34-7.33-5.34z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 11.33a2.67 2.67 0 100-5.33 2.67 2.67 0 000 5.33z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="btn-icon download" onclick="exportarDoHistorico('${item.tipoChave}')" title="Baixar Excel">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M5.33333 8H10.6667M5.33333 10.6667H10.6667M5.33333 5.33333H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function iconeTipo(tipo) {
    const icons = {
        viagens: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 3L3 7v6l7 4 7-4V7l-7-4z" stroke="#1a73e8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        financeiro: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#4caf50" stroke-width="1.5"/><path d="M10 6v8M7 9h6" stroke="#4caf50" stroke-width="1.5" stroke-linecap="round"/></svg>',
        motoristas: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="#ff9800" stroke-width="1.5"/><path d="M4 18c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#ff9800" stroke-width="1.5" stroke-linecap="round"/></svg>',
        veiculos: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="10" rx="2" stroke="#f44336" stroke-width="1.5"/><circle cx="6" cy="15" r="2" fill="#f44336"/><circle cx="14" cy="15" r="2" fill="#f44336"/></svg>',
        entregas: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 7v6l7 4 7-4V7l-7-4z" stroke="#9c27b0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 8v2M10 14h0" stroke="#9c27b0" stroke-width="1.5" stroke-linecap="round"/></svg>'
    };
    return icons[tipo] || '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#888" stroke-width="1.5"/></svg>';
}

function obterHistorico() {
    const sessao = JSON.parse(sessionStorage.getItem('historicoRelatorios') || '[]');
    const base = [
        { data: '26/07/2026', tipo: 'Financeiro', tipoChave: 'financeiro', periodo: 'Julho/2026', status: 'Concluído' },
        { data: '25/07/2026', tipo: 'Viagens', tipoChave: 'viagens', periodo: 'Semanal', status: 'Concluído' },
        { data: '24/07/2026', tipo: 'Motoristas', tipoChave: 'motoristas', periodo: 'Julho/2026', status: 'Concluído' },
        { data: '23/07/2026', tipo: 'Veículos', tipoChave: 'veiculos', periodo: 'Mensal', status: 'Pendente' }
    ];
    return [...sessao, ...base].slice(0, 8);
}

function registrarHistorico(tipoChave, tipoNome) {
    const sessao = JSON.parse(sessionStorage.getItem('historicoRelatorios') || '[]');
    sessao.unshift({
        data: new Date().toLocaleDateString('pt-BR'),
        tipo: tipoNome,
        tipoChave,
        periodo: `${document.getElementById('dataInicial').value || '?'} a ${document.getElementById('dataFinal').value || '?'}`,
        status: 'Concluído'
    });
    sessionStorage.setItem('historicoRelatorios', JSON.stringify(sessao.slice(0, 5)));
}

function visualizarDoHistorico(tipo) {
    document.getElementById('tipoRelatorio').value = tipo;
    gerarRelatorioAtual();
    const card = document.querySelector(`.report-card[data-report="${tipo}"]`);
    if (card) destacarCard(card);
}

function exportarDoHistorico(tipo) {
    document.getElementById('tipoRelatorio').value = tipo;
    gerarRelatorioDetalhado(tipo, obterPeriodo());
    setTimeout(() => exportReport('excel'), 600);
}

/* ========== EXPORTAÇÃO ========== */
function exportReport(formato) {
    const tabela = document.getElementById('tabelaRelatorio');
    if (!tabela) { showToast('Gere um relatório primeiro', 'warning'); return; }
    const tipo = document.getElementById('reportResultCard')?.dataset.currentType || 'relatorio';
    if (formato === 'pdf') { imprimirRelatorio(); return; }
    if (formato === 'excel' && typeof XLSX !== 'undefined') {
        const wb = XLSX.utils.table_to_book(tabela, { sheet: 'Relatório' });
        XLSX.writeFile(wb, `relatorio-${tipo}-${dataHoje()}.xlsx`);
        showToast('Excel exportado', 'success');
        return;
    }
    if (formato === 'csv' || formato === 'excel') {
        const csv = tabelaParaCSV(tabela);
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        baixarBlob(blob, `relatorio-${tipo}-${dataHoje()}.csv`);
        showToast('CSV exportado', 'success');
    }
}

function tabelaParaCSV(tabela) {
    const linhas = Array.from(tabela.querySelectorAll('tr'));
    return linhas.map(linha =>
        Array.from(linha.querySelectorAll('th,td')).map(cel => `"${cel.textContent.trim().replace(/"/g, '""')}"`).join(';')
    ).join('\r\n');
}

function baixarBlob(blob, nome) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nome;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function imprimirRelatorio() { window.print(); }
function dataHoje() { return new Date().toISOString().slice(0,10); }

/* ========== UTILITÁRIOS ========== */
function statusClass(status) {
    const map = { 'Concluída':'completed', 'Em andamento':'in-progress', 'Pendente':'pending', 'Cancelada':'cancelled' };
    return map[status] || 'in-progress';
}
function formatCurrency(v) { return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v||0); }
function formatarData(iso) { if(!iso) return '-'; const [a,m,d]=iso.split('-'); return `${d}/${m}/${a}`; }
function formatarMesLabel(mesISO) { if(!mesISO) return '?'; const [a,m]=mesISO.split('-'); const nomes=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']; return nomes[parseInt(m)-1]+'/'+a; }
function agruparReceitaPorMes(viagens) {
    const map = {};
    viagens.forEach(v=>{ const mes=v.data?.substring(0,7)||'?'; map[mes]=(map[mes]||0)+(v.valor||0); });
    return map;
}
function showToast(msg, tipo='info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`; toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(()=>toast.remove(), 3000);
}