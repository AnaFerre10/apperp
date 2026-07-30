/**
 * TransCloud ERP - Storage Module
 * Gerencia dados no LocalStorage com dados simulados iniciais
 */

// Chaves do LocalStorage
const STORAGE_KEYS = {
    VIAGENS: 'transcloud_viagens',
    VEICULOS: 'transcloud_veiculos',
    MOTORISTAS: 'transcloud_motoristas',
    CLIENTES: 'transcloud_clientes',
    TUTORIAL_DONE: 'transcloud_tutorial_done',
    USER: 'transcloud_user',
    SETTINGS: 'transcloud_settings'
};

// Dados simulados iniciais
const DEFAULT_DATA = {
    veiculos: [
        { id: 1, placa: 'ABC-1234', modelo: 'Mercedes-Benz Actros', ano: 2022, capacidade: 25000, status: 'Disponível' },
        { id: 2, placa: 'DEF-5678', modelo: 'Volvo FH 540', ano: 2023, capacidade: 28000, status: 'Em uso' },
        { id: 3, placa: 'GHI-9012', modelo: 'Scania R450', ano: 2021, capacidade: 22000, status: 'Disponível' },
        { id: 4, placa: 'JKL-3456', modelo: 'MAN TGX', ano: 2022, capacidade: 26000, status: 'Manutenção' },
        { id: 5, placa: 'MNO-7890', modelo: 'DAF XF', ano: 2023, capacidade: 24000, status: 'Disponível' }
    ],
    motoristas: [
        { id: 1, nome: 'João Silva', cnh: '12345678900', telefone: '(11) 99999-0001', status: 'Disponível' },
        { id: 2, nome: 'Maria Santos', cnh: '98765432100', telefone: '(11) 99999-0002', status: 'Em viagem' },
        { id: 3, nome: 'Pedro Oliveira', cnh: '45678912300', telefone: '(11) 99999-0003', status: 'Disponível' },
        { id: 4, nome: 'Ana Costa', cnh: '78912345600', telefone: '(11) 99999-0004', status: 'Em viagem' },
        { id: 5, nome: 'Carlos Souza', cnh: '32165498700', telefone: '(11) 99999-0005', status: 'Inativo' }
    ],
    clientes: [
        { id: 1, nome: 'Empresa Alpha Ltda', documento: '12.345.678/0001-90', telefone: '(11) 3000-0001', cidade: 'São Paulo' },
        { id: 2, nome: 'Distribuidora Beta', documento: '98.765.432/0001-10', telefone: '(11) 3000-0002', cidade: 'Campinas' },
        { id: 3, nome: 'Comércio Gamma', documento: '45.678.912/0001-34', telefone: '(11) 3000-0003', cidade: 'Rio de Janeiro' },
        { id: 4, nome: 'Indústria Delta', documento: '78.912.345/0001-67', telefone: '(11) 3000-0004', cidade: 'Belo Horizonte' },
        { id: 5, nome: 'Transportadora Epsilon', documento: '34.567.891/0001-23', telefone: '(11) 3000-0005', cidade: 'Curitiba' }
    ],
    viagens: [
        { id: 1, origem: 'São Paulo', destino: 'Campinas', motorista: 'João Silva', veiculo: 'ABC-1234', status: 'Concluída', valor: 2500.00 },
        { id: 2, origem: 'Rio de Janeiro', destino: 'Belo Horizonte', motorista: 'Maria Santos', veiculo: 'DEF-5678', status: 'Em andamento', valor: 4200.00 },
        { id: 3, origem: 'Curitiba', destino: 'São Paulo', motorista: 'Pedro Oliveira', veiculo: 'GHI-9012', status: 'Pendente', valor: 3800.00 },
        { id: 4, origem: 'Campinas', destino: 'Rio de Janeiro', motorista: 'Ana Costa', veiculo: 'JKL-3456', status: 'Concluída', valor: 3100.00 },
        { id: 5, origem: 'Belo Horizonte', destino: 'Curitiba', motorista: 'João Silva', veiculo: 'MNO-7890', status: 'Cancelada', valor: 2900.00 }
    ]
};

/**
 * Inicializa o storage com dados padrão se não existirem
 */
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.VEICULOS)) {
        localStorage.setItem(STORAGE_KEYS.VEICULOS, JSON.stringify(DEFAULT_DATA.veiculos));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MOTORISTAS)) {
        localStorage.setItem(STORAGE_KEYS.MOTORISTAS, JSON.stringify(DEFAULT_DATA.motoristas));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTES)) {
        localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(DEFAULT_DATA.clientes));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VIAGENS)) {
        localStorage.setItem(STORAGE_KEYS.VIAGENS, JSON.stringify(DEFAULT_DATA.viagens));
    }
}

/**
 * Obtém dados do LocalStorage
 * @param {string} key - Chave do storage
 * @returns {Array} Dados armazenados
 */
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

/**
 * Salva dados no LocalStorage
 * @param {string} key - Chave do storage
 * @param {Array} data - Dados a serem salvos
 */
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Gera um novo ID para registros
 * @param {Array} items - Lista de itens
 * @returns {number} Novo ID
 */
function generateId(items) {
    if (items.length === 0) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
}

// Inicializa storage ao carregar
document.addEventListener('DOMContentLoaded', initStorage);