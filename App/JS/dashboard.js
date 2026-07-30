/**
 * TransCloud ERP - Dashboard Module
 */

document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('chartViagensDia')) return;
    
    loadKPIs();
    loadCharts();
    loadRecentActivities();
});

/**
 * Carrega os KPIs do dashboard
 */
function loadKPIs() {
    const viagens = getData(STORAGE_KEYS.VIAGENS);
    
    const viagensHoje = viagens.filter(v => v.status === 'Em andamento' || v.status === 'Concluída').length;
    const entregasRealizadas = viagens.filter(v => v.status === 'Concluída').length;
    const emTransito = viagens.filter(v => v.status === 'Em andamento').length;
    const atrasos = viagens.filter(v => v.status === 'Cancelada').length;
    
    document.getElementById('kpiViagensHoje').textContent = viagensHoje;
    document.getElementById('kpiEntregasRealizadas').textContent = entregasRealizadas;
    document.getElementById('kpiEmTransito').textContent = emTransito;
    document.getElementById('kpiAtrasos').textContent = atrasos;
}

/**
 * Carrega os gráficos
 */
function loadCharts() {
    const viagens = getData(STORAGE_KEYS.VIAGENS);
    
    // Gráfico de Viagens por Dia (simulado)
    const ctx1 = document.getElementById('chartViagensDia').getContext('2d');
    new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
            datasets: [{
                label: 'Viagens',
                data: [12, 19, 15, 22, 18, 8],
                backgroundColor: '#1a73e8',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
    
    // Gráfico de Status das Entregas
    const statusCounts = {
        'Concluída': viagens.filter(v => v.status === 'Concluída').length,
        'Em andamento': viagens.filter(v => v.status === 'Em andamento').length,
        'Pendente': viagens.filter(v => v.status === 'Pendente').length,
        'Cancelada': viagens.filter(v => v.status === 'Cancelada').length
    };
    
    const ctx2 = document.getElementById('chartStatusEntregas').getContext('2d');
    new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Carrega atividades recentes
 */
function loadRecentActivities() {
    const activities = [
        { icon: '🚛', text: 'Nova viagem iniciada: São Paulo → Campinas', time: 'Há 5 minutos', bg: '#e3f2fd' },
        { icon: '✅', text: 'Entrega concluída: Pedido #12345', time: 'Há 15 minutos', bg: '#e8f5e9' },
        { icon: '👤', text: 'Motorista João Silva finalizou rota', time: 'Há 30 minutos', bg: '#fff3e0' },
        { icon: '⚠️', text: 'Alerta: Veículo JKL-3456 em manutenção', time: 'Há 1 hora', bg: '#fce4ec' },
        { icon: '📋', text: 'Relatório mensal gerado', time: 'Há 2 horas', bg: '#f3e5f5' }
    ];
    
    const container = document.getElementById('recentActivities');
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon" style="background: ${activity.bg};">${activity.icon}</div>
            <div class="activity-content">
                <h4>${activity.text}</h4>
                <p>${activity.time}</p>
            </div>
        </div>
    `).join('');
}