/**
 * TransCloud ERP - Transportes Module
 * Gerencia CRUD de viagens, veículos, motoristas e clientes
 */

document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.tabs')) return;
    
    setupTabs();
    loadViagens();
    loadVeiculos();
    loadMotoristas();
    loadClientes();
    setupSearchListeners();
    setupFormListeners();
});

/**
 * Configura as abas
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${tabName}`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

/**
 * Popula os selects de motorista e veículo nos formulários
 */
function populateSelects() {
    const motoristas = getData(STORAGE_KEYS.MOTORISTAS);
    const veiculos = getData(STORAGE_KEYS.VEICULOS);
    
    const selectMotorista = document.getElementById('viagemMotorista');
    const selectVeiculo = document.getElementById('viagemVeiculo');
    
    if (selectMotorista) {
        selectMotorista.innerHTML = '<option value="">Selecione um motorista</option>' +
            motoristas.map(m => `<option value="${m.nome}">${m.nome}</option>`).join('');
    }
    
    if (selectVeiculo) {
        selectVeiculo.innerHTML = '<option value="">Selecione um veículo</option>' +
            veiculos.map(v => `<option value="${v.placa}">${v.placa} - ${v.modelo}</option>`).join('');
    }
}

/**
 * Carrega lista de viagens
 */
function loadViagens() {
    const viagens = getData(STORAGE_KEYS.VIAGENS);
    const tbody = document.getElementById('tableViagens');
    
    if (!tbody) return;
    
    tbody.innerHTML = viagens.map(viagem => `
        <tr>
            <td>#${viagem.id}</td>
            <td>${viagem.origem}</td>
            <td>${viagem.destino}</td>
            <td>${viagem.motorista}</td>
            <td>${viagem.veiculo}</td>
            <td><span class="badge badge-${getStatusClass(viagem.status)}">${viagem.status}</span></td>
            <td>${formatCurrency(viagem.valor)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick="editViagem(${viagem.id})" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.3333 2.00001C11.5084 1.82491 11.7163 1.68602 11.9451 1.59126C12.1738 1.4965 12.4187 1.44772 12.6662 1.44772C12.9137 1.44772 13.1586 1.4965 13.3874 1.59126C13.6161 1.68602 13.824 1.82491 13.9991 2.00001C14.1742 2.17511 14.3131 2.38297 14.4079 2.61171C14.5026 2.84045 14.5514 3.08535 14.5514 3.33284C14.5514 3.58033 14.5026 3.82523 14.4079 4.05397C14.3131 4.28271 14.1742 4.49057 13.9991 4.66567L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00001Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteViagem(${viagem.id})" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4H14M5.33333 4V2.66667C5.33333 2.29848 5.63181 2 6 2H10C10.3682 2 10.6667 2.29848 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 14.0697 12.0697 14.6667 11.3333 14.6667H4.66667C3.93029 14.6667 3.33333 14.0697 3.33333 13.3333V4H12.6667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    populateSelects();
}

/**
 * Carrega lista de veículos
 */
function loadVeiculos() {
    const veiculos = getData(STORAGE_KEYS.VEICULOS);
    const tbody = document.getElementById('tableVeiculos');
    
    if (!tbody) return;
    
    tbody.innerHTML = veiculos.map(veiculo => `
        <tr>
            <td>#${veiculo.id}</td>
            <td>${veiculo.placa}</td>
            <td>${veiculo.modelo}</td>
            <td>${veiculo.ano}</td>
            <td>${veiculo.capacidade} kg</td>
            <td><span class="badge badge-${veiculo.status === 'Disponível' ? 'success' : veiculo.status === 'Em uso' ? 'info' : 'warning'}">${veiculo.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick="editVeiculo(${veiculo.id})" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.3333 2.00001C11.5084 1.82491 11.7163 1.68602 11.9451 1.59126C12.1738 1.4965 12.4187 1.44772 12.6662 1.44772C12.9137 1.44772 13.1586 1.4965 13.3874 1.59126C13.6161 1.68602 13.824 1.82491 13.9991 2.00001C14.1742 2.17511 14.3131 2.38297 14.4079 2.61171C14.5026 2.84045 14.5514 3.08535 14.5514 3.33284C14.5514 3.58033 14.5026 3.82523 14.4079 4.05397C14.3131 4.28271 14.1742 4.49057 13.9991 4.66567L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00001Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteVeiculo(${veiculo.id})" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4H14M5.33333 4V2.66667C5.33333 2.29848 5.63181 2 6 2H10C10.3682 2 10.6667 2.29848 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 14.0697 12.0697 14.6667 11.3333 14.6667H4.66667C3.93029 14.6667 3.33333 14.0697 3.33333 13.3333V4H12.6667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Carrega lista de motoristas
 */
function loadMotoristas() {
    const motoristas = getData(STORAGE_KEYS.MOTORISTAS);
    const tbody = document.getElementById('tableMotoristas');
    
    if (!tbody) return;
    
    tbody.innerHTML = motoristas.map(motorista => `
        <tr>
            <td>#${motorista.id}</td>
            <td>${motorista.nome}</td>
            <td>${motorista.cnh}</td>
            <td>${motorista.telefone}</td>
            <td><span class="badge badge-${motorista.status === 'Disponível' ? 'success' : motorista.status === 'Em viagem' ? 'info' : 'warning'}">${motorista.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick="editMotorista(${motorista.id})" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.3333 2.00001C11.5084 1.82491 11.7163 1.68602 11.9451 1.59126C12.1738 1.4965 12.4187 1.44772 12.6662 1.44772C12.9137 1.44772 13.1586 1.4965 13.3874 1.59126C13.6161 1.68602 13.824 1.82491 13.9991 2.00001C14.1742 2.17511 14.3131 2.38297 14.4079 2.61171C14.5026 2.84045 14.5514 3.08535 14.5514 3.33284C14.5514 3.58033 14.5026 3.82523 14.4079 4.05397C14.3131 4.28271 14.1742 4.49057 13.9991 4.66567L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00001Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteMotorista(${motorista.id})" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4H14M5.33333 4V2.66667C5.33333 2.29848 5.63181 2 6 2H10C10.3682 2 10.6667 2.29848 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 14.0697 12.0697 14.6667 11.3333 14.6667H4.66667C3.93029 14.6667 3.33333 14.0697 3.33333 13.3333V4H12.6667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Carrega lista de clientes
 */
function loadClientes() {
    const clientes = getData(STORAGE_KEYS.CLIENTES);
    const tbody = document.getElementById('tableClientes');
    
    if (!tbody) return;
    
    tbody.innerHTML = clientes.map(cliente => `
        <tr>
            <td>#${cliente.id}</td>
            <td>${cliente.nome}</td>
            <td>${cliente.documento}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.cidade}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick="editCliente(${cliente.id})" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.3333 2.00001C11.5084 1.82491 11.7163 1.68602 11.9451 1.59126C12.1738 1.4965 12.4187 1.44772 12.6662 1.44772C12.9137 1.44772 13.1586 1.4965 13.3874 1.59126C13.6161 1.68602 13.824 1.82491 13.9991 2.00001C14.1742 2.17511 14.3131 2.38297 14.4079 2.61171C14.5026 2.84045 14.5514 3.08535 14.5514 3.33284C14.5514 3.58033 14.5026 3.82523 14.4079 4.05397C14.3131 4.28271 14.1742 4.49057 13.9991 4.66567L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00001Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteCliente(${cliente.id})" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4H14M5.33333 4V2.66667C5.33333 2.29848 5.63181 2 6 2H10C10.3682 2 10.6667 2.29848 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 14.0697 12.0697 14.6667 11.3333 14.6667H4.66667C3.93029 14.6667 3.33333 14.0697 3.33333 13.3333V4H12.6667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Configura listeners de pesquisa
 */
function setupSearchListeners() {
    const searchViagens = document.getElementById('searchViagens');
    const searchVeiculos = document.getElementById('searchVeiculos');
    const searchMotoristas = document.getElementById('searchMotoristas');
    const searchClientes = document.getElementById('searchClientes');
    
    if (searchViagens) {
        searchViagens.addEventListener('input', debounce(function(e) {
            filterTable('tableViagens', e.target.value);
        }, 300));
    }
    
    if (searchVeiculos) {
        searchVeiculos.addEventListener('input', debounce(function(e) {
            filterTable('tableVeiculos', e.target.value);
        }, 300));
    }
    
    if (searchMotoristas) {
        searchMotoristas.addEventListener('input', debounce(function(e) {
            filterTable('tableMotoristas', e.target.value);
        }, 300));
    }
    
    if (searchClientes) {
        searchClientes.addEventListener('input', debounce(function(e) {
            filterTable('tableClientes', e.target.value);
        }, 300));
    }
}

/**
 * Filtra tabela por termo de busca
 */
function filterTable(tableId, searchTerm) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    
    const rows = tbody.getElementsByTagName('tr');
    const term = searchTerm.toLowerCase();
    
    Array.from(rows).forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

/**
 * Configura listeners dos formulários
 */
function setupFormListeners() {
    const formViagem = document.getElementById('formViagem');
    const formVeiculo = document.getElementById('formVeiculo');
    const formMotorista = document.getElementById('formMotorista');
    const formCliente = document.getElementById('formCliente');
    
    if (formViagem) {
        formViagem.addEventListener('submit', function(e) {
            e.preventDefault();
            saveViagem();
        });
    }
    
    if (formVeiculo) {
        formVeiculo.addEventListener('submit', function(e) {
            e.preventDefault();
            saveVeiculo();
        });
    }
    
    if (formMotorista) {
        formMotorista.addEventListener('submit', function(e) {
            e.preventDefault();
            saveMotorista();
        });
    }
    
    if (formCliente) {
        formCliente.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCliente();
        });
    }
}

// ============================================
// CRUD - VIAGENS
// ============================================

function saveViagem() {
    const id = document.getElementById('viagemId').value;
    const viagem = {
        id: id ? parseInt(id) : 0,
        origem: document.getElementById('viagemOrigem').value,
        destino: document.getElementById('viagemDestino').value,
        motorista: document.getElementById('viagemMotorista').value,
        veiculo: document.getElementById('viagemVeiculo').value,
        status: document.getElementById('viagemStatus').value,
        valor: parseFloat(document.getElementById('viagemValor').value)
    };
    
    const viagens = getData(STORAGE_KEYS.VIAGENS);
    
    if (id) {
        // Editar
        const index = viagens.findIndex(v => v.id === parseInt(id));
        if (index !== -1) {
            viagens[index] = viagem;
            showToast('Viagem atualizada com sucesso!', 'success');
        }
    } else {
        // Novo
        viagem.id = generateId(viagens);
        viagens.push(viagem);
        showToast('Viagem cadastrada com sucesso!', 'success');
    }
    
    saveData(STORAGE_KEYS.VIAGENS, viagens);
    closeModal('modalViagem');
    loadViagens();
    document.getElementById('formViagem').reset();
    document.getElementById('viagemId').value = '';
}

function editViagem(id) {
    const viagens = getData(STORAGE_KEYS.VIAGENS);
    const viagem = viagens.find(v => v.id === id);
    
    if (viagem) {
        document.getElementById('viagemId').value = viagem.id;
        document.getElementById('viagemOrigem').value = viagem.origem;
        document.getElementById('viagemDestino').value = viagem.destino;
        document.getElementById('viagemMotorista').value = viagem.motorista;
        document.getElementById('viagemVeiculo').value = viagem.veiculo;
        document.getElementById('viagemStatus').value = viagem.status;
        document.getElementById('viagemValor').value = viagem.valor;
        openModal('modalViagem');
    }
}

function deleteViagem(id) {
    if (confirm('Tem certeza que deseja excluir esta viagem?')) {
        const viagens = getData(STORAGE_KEYS.VIAGENS);
        const filtered = viagens.filter(v => v.id !== id);
        saveData(STORAGE_KEYS.VIAGENS, filtered);
        loadViagens();
        showToast('Viagem excluída com sucesso!', 'success');
    }
}

// ============================================
// CRUD - VEÍCULOS
// ============================================

function saveVeiculo() {
    const id = document.getElementById('veiculoId').value;
    const veiculo = {
        id: id ? parseInt(id) : 0,
        placa: document.getElementById('veiculoPlaca').value,
        modelo: document.getElementById('veiculoModelo').value,
        ano: parseInt(document.getElementById('veiculoAno').value),
        capacidade: parseInt(document.getElementById('veiculoCapacidade').value),
        status: document.getElementById('veiculoStatus').value
    };
    
    const veiculos = getData(STORAGE_KEYS.VEICULOS);
    
    if (id) {
        const index = veiculos.findIndex(v => v.id === parseInt(id));
        if (index !== -1) {
            veiculos[index] = veiculo;
            showToast('Veículo atualizado com sucesso!', 'success');
        }
    } else {
        veiculo.id = generateId(veiculos);
        veiculos.push(veiculo);
        showToast('Veículo cadastrado com sucesso!', 'success');
    }
    
    saveData(STORAGE_KEYS.VEICULOS, veiculos);
    closeModal('modalVeiculo');
    loadVeiculos();
    document.getElementById('formVeiculo').reset();
    document.getElementById('veiculoId').value = '';
}

function editVeiculo(id) {
    const veiculos = getData(STORAGE_KEYS.VEICULOS);
    const veiculo = veiculos.find(v => v.id === id);
    
    if (veiculo) {
        document.getElementById('veiculoId').value = veiculo.id;
        document.getElementById('veiculoPlaca').value = veiculo.placa;
        document.getElementById('veiculoModelo').value = veiculo.modelo;
        document.getElementById('veiculoAno').value = veiculo.ano;
        document.getElementById('veiculoCapacidade').value = veiculo.capacidade;
        document.getElementById('veiculoStatus').value = veiculo.status;
        openModal('modalVeiculo');
    }
}

function deleteVeiculo(id) {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
        const veiculos = getData(STORAGE_KEYS.VEICULOS);
        const filtered = veiculos.filter(v => v.id !== id);
        saveData(STORAGE_KEYS.VEICULOS, filtered);
        loadVeiculos();
        showToast('Veículo excluído com sucesso!', 'success');
    }
}

// ============================================
// CRUD - MOTORISTAS
// ============================================

function saveMotorista() {
    const id = document.getElementById('motoristaId').value;
    const motorista = {
        id: id ? parseInt(id) : 0,
        nome: document.getElementById('motoristaNome').value,
        cnh: document.getElementById('motoristaCNH').value,
        telefone: document.getElementById('motoristaTelefone').value,
        status: document.getElementById('motoristaStatus').value
    };
    
    const motoristas = getData(STORAGE_KEYS.MOTORISTAS);
    
    if (id) {
        const index = motoristas.findIndex(m => m.id === parseInt(id));
        if (index !== -1) {
            motoristas[index] = motorista;
            showToast('Motorista atualizado com sucesso!', 'success');
        }
    } else {
        motorista.id = generateId(motoristas);
        motoristas.push(motorista);
        showToast('Motorista cadastrado com sucesso!', 'success');
    }
    
    saveData(STORAGE_KEYS.MOTORISTAS, motoristas);
    closeModal('modalMotorista');
    loadMotoristas();
    document.getElementById('formMotorista').reset();
    document.getElementById('motoristaId').value = '';
}

function editMotorista(id) {
    const motoristas = getData(STORAGE_KEYS.MOTORISTAS);
    const motorista = motoristas.find(m => m.id === id);
    
    if (motorista) {
        document.getElementById('motoristaId').value = motorista.id;
        document.getElementById('motoristaNome').value = motorista.nome;
        document.getElementById('motoristaCNH').value = motorista.cnh;
        document.getElementById('motoristaTelefone').value = motorista.telefone;
        document.getElementById('motoristaStatus').value = motorista.status;
        openModal('modalMotorista');
    }
}

function deleteMotorista(id) {
    if (confirm('Tem certeza que deseja excluir este motorista?')) {
        const motoristas = getData(STORAGE_KEYS.MOTORISTAS);
        const filtered = motoristas.filter(m => m.id !== id);
        saveData(STORAGE_KEYS.MOTORISTAS, filtered);
        loadMotoristas();
        showToast('Motorista excluído com sucesso!', 'success');
    }
}

// ============================================
// CRUD - CLIENTES
// ============================================

function saveCliente() {
    const id = document.getElementById('clienteId').value;
    const cliente = {
        id: id ? parseInt(id) : 0,
        nome: document.getElementById('clienteNome').value,
        documento: document.getElementById('clienteDocumento').value,
        telefone: document.getElementById('clienteTelefone').value,
        cidade: document.getElementById('clienteCidade').value
    };
    
    const clientes = getData(STORAGE_KEYS.CLIENTES);
    
    if (id) {
        const index = clientes.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
            clientes[index] = cliente;
            showToast('Cliente atualizado com sucesso!', 'success');
        }
    } else {
        cliente.id = generateId(clientes);
        clientes.push(cliente);
        showToast('Cliente cadastrado com sucesso!', 'success');
    }
    
    saveData(STORAGE_KEYS.CLIENTES, clientes);
    closeModal('modalCliente');
    loadClientes();
    document.getElementById('formCliente').reset();
    document.getElementById('clienteId').value = '';
}

function editCliente(id) {
    const clientes = getData(STORAGE_KEYS.CLIENTES);
    const cliente = clientes.find(c => c.id === id);
    
    if (cliente) {
        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('clienteNome').value = cliente.nome;
        document.getElementById('clienteDocumento').value = cliente.documento;
        document.getElementById('clienteTelefone').value = cliente.telefone;
        document.getElementById('clienteCidade').value = cliente.cidade;
        openModal('modalCliente');
    }
}

function deleteCliente(id) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        const clientes = getData(STORAGE_KEYS.CLIENTES);
        const filtered = clientes.filter(c => c.id !== id);
        saveData(STORAGE_KEYS.CLIENTES, filtered);
        loadClientes();
        showToast('Cliente excluído com sucesso!', 'success');
    }
}

/**
 * Retorna a classe CSS baseada no status
 */
function getStatusClass(status) {
    const classes = {
        'Concluída': 'success',
        'Em andamento': 'info',
        'Pendente': 'warning',
        'Cancelada': 'danger',
        'Disponível': 'success',
        'Em uso': 'info',
        'Manutenção': 'warning',
        'Em viagem': 'info',
        'Inativo': 'danger'
    };
    return classes[status] || 'info';
}