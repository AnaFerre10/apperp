/**
 * TransCloud TMS - Módulo de Relatórios Avançado
 * Única fonte de verdade para o módulo de relatórios
 * (não duplicar esta lógica em <script> inline no HTML)
 */

let chartReceitaInstance = null;
let chartEntregasInstance = null;
let chartMotoristasInstance = null;

document.addEventListener('DOMContentLoaded', function () {
    initializeReports();
    loadKPIs();
    loadCharts();
    loadReportHistory();
});

/* ============================================
   Inicialização
   ============================================ */
function initializeReports() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    const dataFinalEl = document.getElementById('dataFinal');
    const dataInicialEl = document.getElementById('dataInicial');
    if (dataFinalEl) dataFinalEl.valueAsDate = today;
    if (dataInicialEl) dataInicialEl.valueAsDate = firstDay;

    setupEventListeners();
}

function setupEventListeners() {
    // Cards de relatório — usam data-report, não onclick inline
    document.querySelectorAll('.report-card').forEach(card => {
        card.addEventListener('click', function () {
            const reportType = this.dataset.report;
            if (reportType) {
                // sincroniza o select de tipo com o card clicado
                const select = document.getElementById('tipoRelatorio');
                if (select) select.value = reportType;
                filtrarRelatorios();
                highlightCard(this);
            }
        });
    });

    // Botão de filtro
    document.getElementById('btnFiltrar')?.addEventListener('click', filtrarRelatorios);

    // Mudança de tipo/data reflete automaticamente
    document.getElementById('tipoRelatorio')?.addEventListener('change', filtrarRelatorios);
    document.getElementById('dataInicial')?.addEventListener('change', filtrarRelatorios);
    document.getElementById('dataFinal')?.addEventListener('change', filtrarRelatorios);

    // Limpar filtros
    document.getElementById('btnLimparFiltros')?.addEventListener('click', limparFiltros);

    // Exportação
    document.querySelectorAll('[data-export]').forEach(btn => {
        btn.addEventListener('click', function () {
            exportReport(this.dataset.export);
        });
    });

    document.getElementById('btnImprimir')?.addEventListener('click', imprimirRelatorio);
}

/* ============================================
   Acesso a dados (com fallback de exemplo)
   ============================================ */
function getViagens() {
    const viagens = (typeof getData === 'function' && typeof STORAGE_KEYS !== 'undefined')
        ? (getData(STORAGE_KEYS.VIAGENS) || [])
        : [];
    return viagens.length ? viagens : getSampleViagens();
}

function getMotoristas() {
    const motoristas = (typeof getData === 'function' && typeof STORAGE_KEYS !== 'undefined')
        ? (getData(STORAGE_KEYS.MOTORISTAS) || [])
        : [];
    return motoristas.length ? motoristas : getSampleMotoristas();
}

function getVeiculos() {
    const veiculos = (typeof getData === 'function' && typeof STORAGE_KEYS !== 'undefined')
        ? (getData(STORAGE_KEYS.VEICULOS) || [])
        : [];
    return veiculos.length ? veiculos : getSampleVeiculos();
}

// Dados de exemplo — usados apenas quando não há nada salvo ainda,
// para que o módulo não fique vazio na primeira utilização.
function getSampleViagens() {
    return [
        { id: 1001, origem: 'São Paulo/SP', destino: 'Rio de Janeiro/RJ', motorista: 'João Silva', veiculo: 'ABC1D23', data: '2026-07-02', status: 'Concluída', valor: 3200 },
        { id: 1002, origem: 'São Paulo/SP', destino: 'Curitiba/PR', motorista: 'Maria Santos', veiculo: 'DEF4E56', data: '2026-07-05', status: 'Concluída', valor: 2100 },
        { id: 1003, origem: 'Campinas/SP', destino: 'Belo Horizonte/MG', motorista: 'Pedro Costa', veiculo: 'GHI7F89', data: '2026-07-10', status: 'Em andamento', valor: 2800 },
        { id: 1004, origem: 'São Paulo/SP', destino: 'Salvador/BA', motorista: 'Ana Oliveira', veiculo: 'ABC1D23', data: '2026-07-14', status: 'Pendente', valor: 4100 },
        { id: 1005, origem: 'Santos/SP', destino: 'São Paulo/SP', motorista: 'Carlos Souza', veiculo: 'DEF4E56', data: '2026-07-18', status: 'Cancelada', valor: 900 },
        { id: 1006, origem: 'São Paulo/SP', destino: 'Porto Alegre/RS', motorista: 'João Silva', veiculo: 'GHI7F89', data: '2026-07-22', status: 'Concluída', valor: 3600 }
    ];
}

function getSampleMotoristas() {
    return [
        { nome: 'João Silva' },
        { nome: 'Maria Santos' },
        { nome: 'Pedro Costa' },
        { nome: 'Ana Oliveira' },
        { nome: 'Carlos Souza' }
    ];
}

function getSampleVeiculos() {
    return [
        { modelo: 'Volvo FH 540', placa: 'ABC1D23', status: 'Disponível' },
        { modelo: 'Scania R450', placa: 'DEF4E56', status: 'Em viagem' },
        { modelo: 'Mercedes Actros', placa: 'GHI7F89', status: 'Disponível' }
    ];
}

/* ============================================
   Filtro por período (usado por todos os relatórios)
   ============================================ */
function getPeriodoFiltro() {
    const inicio = document.getElementById('dataInicial')?.value || null;
    const fim = document.getElementById('dataFinal')?.value || null;
    return { inicio, fim };
}

function filtrarPorPeriodo(lista, campoData, periodo) {
    if (!periodo.inicio && !periodo.fim) return lista;
    return lista.filter(item => {
        const data = item[campoData];
        if (!data) return false;
        if (periodo.inicio && data < periodo.inicio) return false;
        if (periodo.fim && data > periodo.fim) return false;
        return true;
    });
}

/* ============================================
   KPIs do Dashboard
   ============================================ */
function loadKPIs() {
    const viagens = getViagens();

    const totalViagens = viagens.length;
    const receitaTotal = viagens.reduce((sum, v) => sum + (v.valor || 0), 0);
    const motoristasAtivos = new Set(viagens.map(v => v.motorista)).size;
    const veiculosUtilizados = new Set(viagens.map(v => v.veiculo)).size;

    // Tendência calculada a partir da própria base: primeira metade x segunda metade do período
    const tendencias = calcularTendencias(viagens);

    updateKPIs({ totalViagens, receitaTotal, motoristasAtivos, veiculosUtilizados, tendencias });
}

function calcularTendencias(viagens) {
    const ordenadas = [...viagens].filter(v => v.data).sort((a, b) => a.data.localeCompare(b.data));
    if (ordenadas.length < 2) {
        return { viagens: 0, receita: 0, motoristas: 0, veiculos: 0 };
    }
    const meio = Math.floor(ordenadas.length / 2);
    const primeira = ordenadas.slice(0, meio);
    const segunda = ordenadas.slice(meio);

    const variacao = (a, b) => (a === 0 ? (b > 0 ? 100 : 0) : (((b - a) / a) * 100));

    const receita1 = primeira.reduce((s, v) => s + (v.valor || 0), 0);
    const receita2 = segunda.reduce((s, v) => s + (v.valor || 0), 0);

    return {
        viagens: Number(variacao(primeira.length, segunda.length).toFixed(1)),
        receita: Number(variacao(receita1, receita2).toFixed(1)),
        motoristas: Number(variacao(new Set(primeira.map(v => v.motorista)).size, new Set(segunda.map(v => v.motorista)).size).toFixed(1)),
        veiculos: Number(variacao(new Set(primeira.map(v => v.veiculo)).size, new Set(segunda.map(v => v.veiculo)).size).toFixed(1))
    };
}

function updateKPIs(data) {
    const elements = {
        viagens: document.getElementById('kpiViagens'),
        receita: document.getElementById('kpiReceita'),
        motoristas: document.getElementById('kpiMotoristas'),
        veiculos: document.getElementById('kpiVeiculos')
    };

    if (elements.viagens) {
        elements.viagens.textContent = data.totalViagens;
        updateTrend('trendViagens', data.tendencias.viagens);
    }
    if (elements.receita) {
        elements.receita.textContent = formatCurrency(data.receitaTotal);
        updateTrend('trendReceita', data.tendencias.receita);
    }
    if (elements.motoristas) {
        elements.motoristas.textContent = data.motoristasAtivos;
        updateTrend('trendMotoristas', data.tendencias.motoristas);
    }
    if (elements.veiculos) {
        elements.veiculos.textContent = data.veiculosUtilizados;
        updateTrend('trendVeiculos', data.tendencias.veiculos);
    }
}

function updateTrend(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = `${value > 0 ? '+' : ''}${value}%`;
    element.className = 'kpi-trend';

    if (value > 0) element.classList.add('positive');
    else if (value < 0) element.classList.add('negative');
    else element.classList.add('neutral');
}

/* ============================================
   Gráficos
   ============================================ */
function loadCharts() {
    loadRevenueChart();
    loadDeliveriesChart();
    loadDriversChart();
}

function loadRevenueChart() {
    const canvas = document.getElementById('chartReceita');
    if (!canvas || typeof Chart === 'undefined') return;
    const ctx = canvas.getContext('2d');

    const viagens = getViagens();
    const receitaPorMes = agruparReceitaPorMes(viagens);
    const labels = Object.keys(receitaPorMes).sort();

    if (chartReceitaInstance) chartReceitaInstance.destroy();
    chartReceitaInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(formatarMesLabel),
            datasets: [{
                label: 'Receita',
                data: labels.map(m => receitaPorMes[m]),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12 } } },
                tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` } }
            },
            scales: {
                y: { beginAtZero: true, ticks: { callback: v => formatCurrency(v) }, grid: { drawBorder: false } },
                x: { grid: { display: false } }
            }
        }
    });
}

function loadDeliveriesChart() {
    const canvas = document.getElementById('chartEntregas');
    if (!canvas || typeof Chart === 'undefined') return;
    const ctx = canvas.getContext('2d');

    const viagens = getViagens();
    const contagem = contarPorStatus(viagens);

    if (chartEntregasInstance) chartEntregasInstance.destroy();
    chartEntregasInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Concluídas', 'Em Andamento', 'Pendentes', 'Canceladas'],
            datasets: [{
                data: [contagem.concluidas, contagem.emAndamento, contagem.pendentes, contagem.canceladas],
                backgroundColor: ['#059669', '#2563eb', '#d97706', '#dc2626'],
                borderWidth: 0,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12 } } } },
            cutout: '65%'
        }
    });
}

function loadDriversChart() {
    const canvas = document.getElementById('chartMotoristas');
    if (!canvas || typeof Chart === 'undefined') return;
    const ctx = canvas.getContext('2d');

    const viagens = getViagens();
    const ranking = rankingMotoristas(viagens).slice(0, 5);

    if (chartMotoristasInstance) chartMotoristasInstance.destroy();
    chartMotoristasInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ranking.map(m => m.nome),
            datasets: [{
                label: 'Viagens Realizadas',
                data: ranking.map(m => m.viagens),
                backgroundColor: '#2563eb',
                borderRadius: 8,
                barThickness: 24
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { drawBorder: false }, ticks: { precision: 0 } },
                y: { grid: { display: false } }
            }
        }
    });
}

/* ============================================
   Filtro principal — aciona a geração do relatório
   ============================================ */
function filtrarRelatorios() {
    const tipo = document.getElementById('tipoRelatorio')?.value || 'todos';
    const periodo = getPeriodoFiltro();

    if (periodo.inicio && periodo.fim && periodo.inicio > periodo.fim) {
        showToast('A data inicial não pode ser maior que a data final', 'error');
        return;
    }

    if (tipo === 'todos') {
        document.getElementById('reportResultCard').style.display = 'none';
        document.querySelectorAll('.report-card').forEach(c => c.classList.remove('active'));
        showToast('Selecione um tipo de relatório para visualizar os dados', 'info');
        return;
    }

    generateDetailedReport(tipo, periodo);

    const card = document.querySelector(`.report-card[data-report="${tipo}"]`);
    if (card) highlightCard(card);
}

function limparFiltros() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('dataInicial').valueAsDate = firstDay;
    document.getElementById('dataFinal').valueAsDate = today;
    document.getElementById('tipoRelatorio').value = 'todos';
    document.getElementById('reportResultCard').style.display = 'none';
    document.querySelectorAll('.report-card').forEach(c => c.classList.remove('active'));
    showToast('Filtros limpos', 'info');
}

/* ============================================
   Geração de Relatórios Detalhados
   ============================================ */
function generateDetailedReport(type, periodo) {
    periodo = periodo || getPeriodoFiltro();
    const reportCard = document.getElementById('reportResultCard');
    const reportTitle = document.getElementById('reportTitle');
    const reportOutput = document.getElementById('reportOutput');

    if (!reportCard || !reportOutput) return;

    reportOutput.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Gerando relatório...</p>
        </div>
    `;
    reportCard.style.display = 'block';
    reportCard.dataset.currentType = type;

    setTimeout(() => {
        let html = '';
        let title = '';

        switch (type) {
            case 'viagens':
                title = 'Relatório de Viagens';
                html = generateViagensDetailedReport(periodo);
                break;
            case 'financeiro':
                title = 'Relatório Financeiro';
                html = generateFinanceiroDetailedReport(periodo);
                break;
            case 'motoristas':
                title = 'Relatório por Motorista';
                html = generateMotoristasDetailedReport(periodo);
                break;
            case 'veiculos':
                title = 'Relatório por Veículo';
                html = generateVeiculosDetailedReport(periodo);
                break;
            case 'entregas':
                title = 'Relatório de Entregas';
                html = generateEntregasDetailedReport(periodo);
                break;
            default:
                title = 'Relatório';
                html = '<div class="empty-state">Tipo de relatório inválido.</div>';
        }

        reportTitle.textContent = title;
        reportOutput.innerHTML = html;
        reportCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast('Relatório gerado com sucesso!', 'success');
    }, 500);
}

function generateViagensDetailedReport(periodo) {
    const viagens = filtrarPorPeriodo(getViagens(), 'data', periodo);
    const total = viagens.length;
    const concluidas = viagens.filter(v => v.status === 'Concluída').length;
    const emAndamento = viagens.filter(v => v.status === 'Em andamento').length;
    const receitaTotal = viagens.reduce((sum, v) => sum + (v.valor || 0), 0);

    return `
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total de Viagens</div>
                <div class="summary-value trips">${total}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Concluídas</div>
                <div class="summary-value">${concluidas}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Em Andamento</div>
                <div class="summary-value">${emAndamento}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Receita Total</div>
                <div class="summary-value revenue">${formatCurrency(receitaTotal)}</div>
            </div>
        </div>
        <div class="table-responsive">
            <table class="report-table" id="tabelaRelatorio">
                <thead>
                    <tr>
                        <th>ID</th><th>Origem</th><th>Destino</th><th>Motorista</th><th>Data</th><th>Status</th><th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${total > 0 ? viagens.map(v => `
                        <tr>
                            <td><strong>#${v.id || '-'}</strong></td>
                            <td>${v.origem || '-'}</td>
                            <td>${v.destino || '-'}</td>
                            <td>${v.motorista || '-'}</td>
                            <td>${formatarData(v.data)}</td>
                            <td><span class="status-badge ${getStatusClass(v.status)}">${v.status || '-'}</span></td>
                            <td class="revenue"><strong>${formatCurrency(v.valor || 0)}</strong></td>
                        </tr>
                    `).join('') : `<tr><td colspan="7" class="text-center text-muted">Nenhuma viagem encontrada no período selecionado</td></tr>`}
                </tbody>
            </table>
        </div>
    `;
}

function generateFinanceiroDetailedReport(periodo) {
    const viagens = filtrarPorPeriodo(getViagens(), 'data', periodo);
    const receitaTotal = viagens.reduce((sum, v) => sum + (v.valor || 0), 0);
    const ticketMedio = viagens.length > 0 ? receitaTotal / viagens.length : 0;
    const receitaPorMes = agruparReceitaPorMes(viagens);

    return `
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Receita Total</div>
                <div class="summary-value revenue">${formatCurrency(receitaTotal)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Ticket Médio</div>
                <div class="summary-value">${formatCurrency(ticketMedio)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Viagens</div>
                <div class="summary-value trips">${viagens.length}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Meses com Registro</div>
                <div class="summary-value">${Object.keys(receitaPorMes).length}</div>
            </div>
        </div>
        <div class="table-responsive">
            <table class="report-table" id="tabelaRelatorio">
                <thead><tr><th>Período</th><th>Viagens</th><th>Receita</th><th>Média</th></tr></thead>
                <tbody>
                    ${Object.keys(receitaPorMes).length > 0 ? Object.entries(receitaPorMes).sort().map(([mes, valor]) => {
                        const viagensMes = viagens.filter(v => (v.data || '').startsWith(mes));
                        return `
                            <tr>
                                <td><strong>${formatarMesLabel(mes)}</strong></td>
                                <td>${viagensMes.length}</td>
                                <td class="revenue">${formatCurrency(valor)}</td>
                                <td>${formatCurrency(viagensMes.length ? valor / viagensMes.length : 0)}</td>
                            </tr>
                        `;
                    }).join('') : `<tr><td colspan="4" class="text-center text-muted">Nenhum dado financeiro no período selecionado</td></tr>`}
                </tbody>
            </table>
        </div>
    `;
}

function rankingMotoristas(viagens) {
    const motoristas = getMotoristas();
    return motoristas.map(m => {
        const viagensMotorista = viagens.filter(v => v.motorista === m.nome);
        const valorTotal = viagensMotorista.reduce((sum, v) => sum + (v.valor || 0), 0);
        return {
            nome: m.nome,
            viagens: viagensMotorista.length,
            valorTotal,
            media: viagensMotorista.length > 0 ? valorTotal / viagensMotorista.length : 0
        };
    }).sort((a, b) => b.valorTotal - a.valorTotal);
}

function generateMotoristasDetailedReport(periodo) {
    const viagens = filtrarPorPeriodo(getViagens(), 'data', periodo);
    const motoristaStats = rankingMotoristas(viagens);
    const maiorValor = motoristaStats[0]?.valorTotal || 1;

    return `
        <div class="table-responsive">
            <table class="report-table" id="tabelaRelatorio">
                <thead>
                    <tr><th>#</th><th>Motorista</th><th>Total Viagens</th><th>Valor Total</th><th>Média por Viagem</th><th>Performance</th></tr>
                </thead>
                <tbody>
                    ${motoristaStats.length > 0 ? motoristaStats.map((m, index) => `
                        <tr>
                            <td><strong>${index + 1}º</strong></td>
                            <td>${m.nome}</td>
                            <td>${m.viagens}</td>
                            <td class="revenue">${formatCurrency(m.valorTotal)}</td>
                            <td>${formatCurrency(m.media)}</td>
                            <td>
                                <div class="performance-bar">
                                    <div class="performance-fill" style="width: ${Math.min((m.valorTotal / maiorValor) * 100, 100)}%"></div>
                                </div>
                            </td>
                        </tr>
                    `).join('') : `<tr><td colspan="6" class="text-center text-muted">Nenhum motorista cadastrado</td></tr>`}
                </tbody>
            </table>
        </div>
    `;
}

function generateVeiculosDetailedReport(periodo) {
    const veiculos = getVeiculos();
    const viagens = filtrarPorPeriodo(getViagens(), 'data', periodo);

    const veiculoStats = veiculos.map(v => {
        const viagensVeiculo = viagens.filter(vi => vi.veiculo === v.placa);
        const valorTotal = viagensVeiculo.reduce((sum, vi) => sum + (vi.valor || 0), 0);
        return {
            modelo: v.modelo,
            placa: v.placa,
            viagens: viagensVeiculo.length,
            valorTotal,
            status: v.status || 'Disponível'
        };
    });

    return `
        <div class="table-responsive">
            <table class="report-table" id="tabelaRelatorio">
                <thead><tr><th>Veículo</th><th>Placa</th><th>Total Viagens</th><th>Receita Gerada</th><th>Status</th></tr></thead>
                <tbody>
                    ${veiculoStats.length > 0 ? veiculoStats.map(v => `
                        <tr>
                            <td><strong>${v.modelo}</strong></td>
                            <td>${v.placa}</td>
                            <td>${v.viagens}</td>
                            <td class="revenue">${formatCurrency(v.valorTotal)}</td>
                            <td><span class="status-badge ${v.status === 'Disponível' ? 'completed' : 'in-progress'}">${v.status}</span></td>
                        </tr>
                    `).join('') : `<tr><td colspan="5" class="text-center text-muted">Nenhum veículo cadastrado</td></tr>`}
                </tbody>
            </table>
        </div>
    `;
}

function contarPorStatus(viagens) {
    return {
        concluidas: viagens.filter(v => v.status === 'Concluída').length,
        emAndamento: viagens.filter(v => v.status === 'Em andamento').length,
        pendentes: viagens.filter(v => v.status === 'Pendente').length,
        canceladas: viagens.filter(v => v.status === 'Cancelada').length
    };
}

function generateEntregasDetailedReport(periodo) {
    const viagens = filtrarPorPeriodo(getViagens(), 'data', periodo);
    const entregas = contarPorStatus(viagens);
    const totalEntregas = Object.values(entregas).reduce((sum, val) => sum + val, 0);
    const taxaSucesso = totalEntregas > 0 ? ((entregas.concluidas / totalEntregas) * 100).toFixed(1) : 0;

    const labelMap = {
        concluidas: 'Concluída',
        emAndamento: 'Em andamento',
        pendentes: 'Pendente',
        canceladas: 'Cancelada'
    };

    return `
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Entregas</div>
                <div class="summary-value trips">${totalEntregas}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Taxa de Sucesso</div>
                <div class="summary-value revenue">${taxaSucesso}%</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Concluídas</div>
                <div class="summary-value">${entregas.concluidas}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Canceladas</div>
                <div class="summary-value">${entregas.canceladas}</div>
            </div>
        </div>
        <div class="table-responsive">
            <table class="report-table" id="tabelaRelatorio">
                <thead><tr><th>Status</th><th>Quantidade</th><th>Percentual</th><th>Progresso</th></tr></thead>
                <tbody>
                    ${totalEntregas > 0 ? Object.entries(entregas).map(([status, quantidade]) => `
                        <tr>
                            <td><span class="status-badge ${getStatusClass(labelMap[status])}">${labelMap[status]}</span></td>
                            <td><strong>${quantidade}</strong></td>
                            <td>${((quantidade / totalEntregas) * 100).toFixed(1)}%</td>
                            <td>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${(quantidade / totalEntregas) * 100}%"></div>
                                </div>
                            </td>
                        </tr>
                    `).join('') : `<tr><td colspan="4" class="text-center text-muted">Nenhuma entrega no período selecionado</td></tr>`}
                </tbody>
            </table>
        </div>
    `;
}

/* ============================================
   Histórico de Relatórios
   ============================================ */
function loadReportHistory() {
    const tbody = document.getElementById('historicoRelatorios');
    if (!tbody) return;

    const historico = getReportHistory();

    tbody.innerHTML = historico.map(item => `
        <tr>
            <td>${item.data}</td>
            <td><span class="report-type-indicator">${getReportTypeIcon(item.tipoChave)} ${item.tipo}</span></td>
            <td>${item.periodo}</td>
            <td><span class="status-badge ${item.status === 'Concluído' ? 'completed' : 'pending'}">${item.status}</span></td>
            <td>
                <div class="action-icons">
                    <button class="action-icon view" onclick="visualizarRelatorio('${item.tipoChave}')" title="Visualizar">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3.33C4.67 3.33 1.67 5.67.67 8.67c1 3 4 5.33 7.33 5.33s6.33-2.33 7.33-5.33c-1-3-4-5.34-7.33-5.34z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8 11.33a2.67 2.67 0 100-5.33 2.67 2.67 0 000 5.33z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="action-icon download" onclick="downloadRelatorio('${item.tipoChave}')" title="Baixar CSV">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2.67 11.33v1.34c0 .35.14.69.39.94s.59.39.94.39h8c.35 0 .69-.14.94-.39s.39-.59.39-.94v-1.34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M4.67 6.67L8 10l3.33-3.33" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8 10V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getReportHistory() {
    // Em produção, viria do backend. Aqui refletimos as gerações reais desta sessão,
    // com um pequeno histórico de exemplo como ponto de partida.
    const sessao = JSON.parse(sessionStorage.getItem('historicoRelatoriosSessao') || '[]');
    const base = [
        { data: '26/07/2026', tipo: 'Financeiro', tipoChave: 'financeiro', periodo: 'Julho/2026', status: 'Concluído' },
        { data: '25/07/2026', tipo: 'Viagens', tipoChave: 'viagens', periodo: 'Semanal', status: 'Concluído' },
        { data: '24/07/2026', tipo: 'Motoristas', tipoChave: 'motoristas', periodo: 'Julho/2026', status: 'Concluído' },
        { data: '23/07/2026', tipo: 'Veículos', tipoChave: 'veiculos', periodo: 'Mensal', status: 'Pendente' },
        { data: '22/07/2026', tipo: 'Entregas', tipoChave: 'entregas', periodo: 'Julho/2026', status: 'Concluído' }
    ];
    return [...sessao, ...base].slice(0, 8);
}

function registrarNoHistorico(tipoChave, tipoLabel) {
    const sessao = JSON.parse(sessionStorage.getItem('historicoRelatoriosSessao') || '[]');
    sessao.unshift({
        data: new Date().toLocaleDateString('pt-BR'),
        tipo: tipoLabel,
        tipoChave,
        periodo: 'Sob demanda',
        status: 'Concluído'
    });
    sessionStorage.setItem('historicoRelatoriosSessao', JSON.stringify(sessao.slice(0, 5)));
}

function getReportTypeIcon(type) {
    const icons = {
        financeiro: '💰',
        viagens: '🚛',
        motoristas: '👤',
        veiculos: '🚚',
        entregas: '📦'
    };
    return icons[type] || '📊';
}

/* ============================================
   Exportação real
   ============================================ */
function exportReport(format) {
    const table = document.getElementById('tabelaRelatorio');
    if (!table) {
        showToast('Gere um relatório antes de exportar', 'warning');
        return;
    }
    const tipo = document.getElementById('reportResultCard')?.dataset.currentType || 'relatorio';

    if (format === 'pdf') {
        imprimirRelatorio();
        return;
    }

    if (format === 'excel') {
        exportarExcel(table, tipo);
        return;
    }

    if (format === 'csv') {
        exportarCSV(table, tipo);
        return;
    }
}

function tableToAOA(table) {
    const rows = Array.from(table.querySelectorAll('tr'));
    return rows.map(row =>
        Array.from(row.querySelectorAll('th,td')).map(cell => cell.textContent.trim())
    );
}

function exportarCSV(table, tipo) {
    const aoa = tableToAOA(table);
    const csv = aoa.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')
    ).join('\r\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    baixarBlob(blob, `relatorio-${tipo}-${dataArquivo()}.csv`);
    showToast('CSV exportado com sucesso!', 'success');
    registrarNoHistorico(tipo, document.getElementById('reportTitle')?.textContent || tipo);
    loadReportHistory();
}

function exportarExcel(table, tipo) {
    if (typeof XLSX === 'undefined') {
        showToast('Biblioteca de Excel não carregada — exportando como CSV', 'warning');
        exportarCSV(table, tipo);
        return;
    }
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Relatório' });
    XLSX.writeFile(wb, `relatorio-${tipo}-${dataArquivo()}.xlsx`);
    showToast('Excel exportado com sucesso!', 'success');
    registrarNoHistorico(tipo, document.getElementById('reportTitle')?.textContent || tipo);
    loadReportHistory();
}

function baixarBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function dataArquivo() {
    return new Date().toISOString().slice(0, 10);
}

function imprimirRelatorio() {
    window.print();
}

/* ============================================
   Utilitários
   ============================================ */
function getStatusClass(status) {
    const classes = {
        'Concluída': 'completed',
        'Em andamento': 'in-progress',
        'Pendente': 'pending',
        'Cancelada': 'cancelled'
    };
    return classes[status] || 'in-progress';
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function formatarData(iso) {
    if (!iso) return '-';
    const [ano, mes, dia] = iso.split('-');
    if (!ano || !mes || !dia) return iso;
    return `${dia}/${mes}/${ano}`;
}

function formatarMesLabel(mesISO) {
    if (!mesISO || mesISO === 'Não definido') return 'Não definido';
    const [ano, mes] = mesISO.split('-');
    const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const idx = parseInt(mes, 10) - 1;
    return nomes[idx] ? `${nomes[idx]}/${ano}` : mesISO;
}

function agruparReceitaPorMes(viagens) {
    const receitaPorMes = {};
    viagens.forEach(v => {
        const mes = v.data ? v.data.substring(0, 7) : 'Não definido';
        receitaPorMes[mes] = (receitaPorMes[mes] || 0) + (v.valor || 0);
    });
    return receitaPorMes;
}

function highlightCard(card) {
    document.querySelectorAll('.report-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/* Funções globais chamadas a partir do HTML */
function visualizarRelatorio(tipo) {
    const select = document.getElementById('tipoRelatorio');
    if (select) select.value = tipo;
    generateDetailedReport(tipo, getPeriodoFiltro());
}

function downloadRelatorio(tipo) {
    const select = document.getElementById('tipoRelatorio');
    if (select) select.value = tipo;
    generateDetailedReport(tipo, getPeriodoFiltro());
    setTimeout(() => exportReport('csv'), 600);
}