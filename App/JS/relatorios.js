/**
 * TransCloud ERP - Relatórios Module (Página Separada)
 */

document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.reports-grid') && window.location.pathname.includes('relatorios.html')) {
        // Carrega dados específicos para a página de relatórios
        loadDetailedReports();
    }
});

function loadDetailedReports() {
    // Implementação específica para a página de relatórios detalhados
    const viagens = getData(STORAGE_KEYS.VIAGENS);
    // ... código específico para relatórios detalhados
}

// Função para gerar relatórios (usada em ambas as páginas)
function generateReport(type) {
    const viagens = getData(STORAGE_KEYS.VIAGENS);
    const output = document.getElementById('reportOutput');
    
    if (!output) return;
    
    let html = '';
    
    switch(type) {
        case 'viagens':
            html = generateViagensReport(viagens);
            break;
        case 'financeiro':
            html = generateFinanceiroReport(viagens);
            break;
        case 'motoristas':
            html = generateMotoristasReport(viagens);
            break;
        case 'veiculos':
            html = generateVeiculosReport(viagens);
            break;
    }
    
    output.innerHTML = html;
    showToast('Relatório gerado com sucesso!', 'success');
}

function generateViagensReport(viagens) {
    const total = viagens.length;
    const concluidas = viagens.filter(v => v.status === 'Concluída').length;
    const emAndamento = viagens.filter(v => v.status === 'Em andamento').length;
    const valorTotal = viagens.reduce((sum, v) => sum + v.valor, 0);
    
    return `
        <div class="report-summary">
            <div class="summary-item">
                <div class="label">Total de Viagens</div>
                <div class="value">${total}</div>
            </div>
            <div class="summary-item">
                <div class="label">Concluídas</div>
                <div class="value">${concluidas}</div>
            </div>
            <div class="summary-item">
                <div class="label">Em Andamento</div>
                <div class="value">${emAndamento}</div>
            </div>
            <div class="summary-item">
                <div class="label">Valor Total</div>
                <div class="value">${formatCurrency(valorTotal)}</div>
            </div>
        </div>
        <table class="report-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Origem</th>
                    <th>Destino</th>
                    <th>Motorista</th>
                    <th>Status</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                ${viagens.map(v => `
                    <tr>
                        <td>#${v.id}</td>
                        <td>${v.origem}</td>
                        <td>${v.destino}</td>
                        <td>${v.motorista}</td>
                        <td><span class="badge badge-${getStatusClass(v.status)}">${v.status}</span></td>
                        <td>${formatCurrency(v.valor)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="export-buttons">
            <button class="btn btn-primary" onclick="exportToPDF()">Exportar PDF</button>
            <button class="btn btn-secondary" onclick="exportToExcel()">Exportar Excel</button>
        </div>
    `;
}

function generateFinanceiroReport(viagens) {
    const receitaTotal = viagens.reduce((sum, v) => sum + v.valor, 0);
    const mediaViagem = viagens.length > 0 ? receitaTotal / viagens.length : 0;
    
    return `
        <div class="report-summary">
            <div class="summary-item">
                <div class="label">Receita Total</div>
                <div class="value">${formatCurrency(receitaTotal)}</div>
            </div>
            <div class="summary-item">
                <div class="label">Média por Viagem</div>
                <div class="value">${formatCurrency(mediaViagem)}</div>
            </div>
            <div class="summary-item">
                <div class="label">Total de Viagens</div>
                <div class="value">${viagens.length}</div>
            </div>
        </div>
        <div class="export-buttons">
            <button class="btn btn-primary" onclick="exportToPDF()">Exportar PDF</button>
            <button class="btn btn-secondary" onclick="exportToExcel()">Exportar Excel</button>
        </div>
    `;
}

function generateMotoristasReport(viagens) {
    const motoristas = getData(STORAGE_KEYS.MOTORISTAS);
    const motoristaStats = motoristas.map(m => {
        const viagensMotorista = viagens.filter(v => v.motorista === m.nome);
        const valorTotal = viagensMotorista.reduce((sum, v) => sum + v.valor, 0);
        return {
            nome: m.nome,
            viagens: viagensMotorista.length,
            valorTotal: valorTotal
        };
    });
    
    return `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Motorista</th>
                    <th>Total Viagens</th>
                    <th>Valor Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${motoristaStats.map(m => `
                    <tr>
                        <td>${m.nome}</td>
                        <td>${m.viagens}</td>
                        <td>${formatCurrency(m.valorTotal)}</td>
                        <td><span class="badge badge-success">Ativo</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="export-buttons">
            <button class="btn btn-primary" onclick="exportToPDF()">Exportar PDF</button>
            <button class="btn btn-secondary" onclick="exportToExcel()">Exportar Excel</button>
        </div>
    `;
}

function generateVeiculosReport(viagens) {
    const veiculos = getData(STORAGE_KEYS.VEICULOS);
    
    return `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Veículo</th>
                    <th>Placa</th>
                    <th>Total Viagens</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${veiculos.map(v => {
                    const viagensVeiculo = viagens.filter(vi => vi.veiculo === v.placa);
                    return `
                        <tr>
                            <td>${v.modelo}</td>
                            <td>${v.placa}</td>
                            <td>${viagensVeiculo.length}</td>
                            <td><span class="badge badge-${v.status === 'Disponível' ? 'success' : 'info'}">${v.status}</span></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        <div class="export-buttons">
            <button class="btn btn-primary" onclick="exportToPDF()">Exportar PDF</button>
            <button class="btn btn-secondary" onclick="exportToExcel()">Exportar Excel</button>
        </div>
    `;
}

function getStatusClass(status) {
    const classes = {
        'Concluída': 'success',
        'Em andamento': 'info',
        'Pendente': 'warning',
        'Cancelada': 'danger'
    };
    return classes[status] || 'info';
}

function exportToPDF() {
    showToast('Exportando para PDF... (Simulação)', 'info');
    setTimeout(() => {
        showToast('PDF exportado com sucesso!', 'success');
    }, 1500);
}

function exportToExcel() {
    showToast('Exportando para Excel... (Simulação)', 'info');
    setTimeout(() => {
        showToast('Excel exportado com sucesso!', 'success');
    }, 1500);
}