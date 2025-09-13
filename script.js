class BookVerse {
    constructor() {
        this.livros = [];
        this.editandoId = null;
        this.logado = false;
        this.senha = 'admin123';
        
        this.inicializar();
        this.carregarLivros();
    }

    inicializar() {
        this.conectarEventos();
    }

    carregarLivros() {
        const livrosFixos = [
            {
                id: 1,
                titulo: "A Jornada do Herói",
                autor: "Joseph Campbell",
                preco: 45.90,
                imagem: "img/imagem_1.jpg"
            },
            {
                id: 2,
                titulo: "Mindset: A Nova Psicologia do Sucesso",
                autor: "Carol S. Dweck",
                preco: 38.50,
                imagem: "img/imagem_2.jpg"
            },
            {
                id: 3,
                titulo: "O Poder do Agora",
                autor: "Eckhart Tolle",
                preco: 42.90,
                imagem: "img/imagem_3.jpg"
            },
            {
                id: 4,
                titulo: "Sapiens: Uma Breve História da Humanidade",
                autor: "Yuval Noah Harari",
                preco: 49.90,
                imagem: "img/imagem_4.jpg"
            },
            {
                id: 5,
                titulo: "Atomic Habits",
                autor: "James Clear",
                preco: 44.50,
                imagem: "img/imagem_5.jpg"
            }
        ];

        const livrosSalvos = localStorage.getItem('bookverse_livros');
        if (livrosSalvos) {
            this.livros = JSON.parse(livrosSalvos);
        } else {
            this.livros = livrosFixos;
            this.salvarLivros();
        }
        this.mostrarCatalogo();
    }

    conectarEventos() {
        document.getElementById('admin-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.mostrarPainelAdmin();
        });

        document.getElementById('close-admin').addEventListener('click', () => {
            this.fecharPainelAdmin();
        });

        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.fazerLogin();
        });

        document.getElementById('add-book-btn').addEventListener('click', () => {
            this.mostrarFormulario();
        });

        document.getElementById('book-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarLivro();
        });

        document.getElementById('cancel-form-btn').addEventListener('click', () => {
            this.esconderFormulario();
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            this.buscarLivros(e.target.value);
        });

        document.querySelector('.admin-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.fecharPainelAdmin();
            }
        });
    }

    mostrarCatalogo(livrosParaMostrar = this.livros) {
        const grid = document.getElementById('catalog-grid');
        
        if (livrosParaMostrar.length === 0) {
            grid.innerHTML = '<p>Nenhum livro encontrado.</p>';
            return;
        }

        grid.innerHTML = livrosParaMostrar.map(livro => `
            <div class="card">
                <img src="${livro.imagem}" alt="${livro.titulo}" 
                     onerror="this.src='https://via.placeholder.com/300x400/cccccc/666666?text=Sem+Imagem'">
                <h1>${this.escaparHtml(livro.titulo)}</h1>
                <h2>por ${this.escaparHtml(livro.autor)}</h2>
                <div class="price-tag">R$ ${livro.preco.toFixed(2).replace('.', ',')}</div>
                <button class="btn btn--primary" style="margin: 16px 20px 20px;">Comprar Agora</button>
            </div>
        `).join('');
    }

    buscarLivros(termo) {
        if (!termo.trim()) {
            this.mostrarCatalogo();
            return;
        }

        const livrosFiltrados = this.livros.filter(livro => 
            livro.titulo.toLowerCase().includes(termo.toLowerCase()) ||
            livro.autor.toLowerCase().includes(termo.toLowerCase())
        );

        this.mostrarCatalogo(livrosFiltrados);
    }

    mostrarPainelAdmin() {
        document.getElementById('admin-panel').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        if (!this.logado) {
            this.mostrarLogin();
        } else {
            this.mostrarDashboard();
        }
    }

    fecharPainelAdmin() {
        document.getElementById('admin-panel').classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.esconderFormulario();
        this.limparAlertas();
    }

    mostrarLogin() {
        document.getElementById('admin-login').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('admin-password').focus();
    }

    mostrarDashboard() {
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        this.mostrarListaAdmin();
    }

    fazerLogin() {
        const senha = document.getElementById('admin-password').value;
        
        if (senha === this.senha) {
            this.logado = true;
            this.mostrarDashboard();
            this.mostrarAlerta('Login realizado com sucesso!', 'success');
            document.getElementById('admin-password').value = '';
        } else {
            this.mostrarAlerta('Senha incorreta!', 'error');
            document.getElementById('admin-password').value = '';
            document.getElementById('admin-password').focus();
        }
    }

    mostrarFormulario(livro = null) {
        const form = document.getElementById('book-form');
        const titulo = document.getElementById('form-title');
        
        form.classList.remove('hidden');
        
        if (livro) {
            titulo.textContent = 'Editar Livro';
            this.editandoId = livro.id;
            
            document.getElementById('book-title').value = livro.titulo;
            document.getElementById('book-author').value = livro.autor;
            document.getElementById('book-price').value = livro.preco;
            document.getElementById('book-image').value = livro.imagem;
        } else {
            titulo.textContent = 'Adicionar Livro';
            this.editandoId = null;
            this.limparFormulario();
        }
        
        document.getElementById('book-title').focus();
    }

    esconderFormulario() {
        document.getElementById('book-form').classList.add('hidden');
        this.limparFormulario();
        this.editandoId = null;
    }

    limparFormulario() {
        document.getElementById('book-form-element').reset();
    }

    salvarLivro() {
        const titulo = document.getElementById('book-title').value.trim();
        const autor = document.getElementById('book-author').value.trim();
        const preco = parseFloat(document.getElementById('book-price').value);
        const imagem = document.getElementById('book-image').value;

        if (!titulo || !autor || !preco || !imagem) {
            this.mostrarAlerta('Preencha todos os campos!', 'error');
            return;
        }

        if (preco <= 0) {
            this.mostrarAlerta('O preço deve ser maior que zero!', 'error');
            return;
        }

        const dadosLivro = { titulo, autor, preco, imagem };

        if (this.editandoId) {
            this.atualizarLivro(this.editandoId, dadosLivro);
        } else {
            this.adicionarLivro(dadosLivro);
        }
    }

    adicionarLivro(dados) {
        const novoLivro = {
            id: Date.now(),
            ...dados
        };

        this.livros.push(novoLivro);
        this.salvarLivros();
        this.mostrarCatalogo();
        this.mostrarListaAdmin();
        this.esconderFormulario();
        this.mostrarAlerta('Livro adicionado com sucesso!', 'success');
    }

    atualizarLivro(id, dados) {
        const index = this.livros.findIndex(livro => livro.id === id);
        
        if (index !== -1) {
            this.livros[index] = { ...this.livros[index], ...dados };
            this.salvarLivros();
            this.mostrarCatalogo();
            this.mostrarListaAdmin();
            this.esconderFormulario();
            this.mostrarAlerta('Livro atualizado com sucesso!', 'success');
        }
    }

    excluirLivro(id) {
        if (confirm('Tem certeza que deseja excluir este livro?')) {
            this.livros = this.livros.filter(livro => livro.id !== id);
            this.salvarLivros();
            this.mostrarCatalogo();
            this.mostrarListaAdmin();
            this.mostrarAlerta('Livro excluído com sucesso!', 'success');
        }
    }

    editarLivro(id) {
        const livro = this.livros.find(livro => livro.id === id);
        if (livro) {
            this.mostrarFormulario(livro);
        }
    }

    mostrarListaAdmin() {
        const lista = document.getElementById('admin-books-list');
        
        if (this.livros.length === 0) {
            lista.innerHTML = '<p>Nenhum livro cadastrado.</p>';
            return;
        }

        lista.innerHTML = this.livros.map(livro => `
            <div class="admin-book-item">
                <img src="${livro.imagem}" alt="${livro.titulo}"
                     onerror="this.src='https://via.placeholder.com/60x80/cccccc/666666?text=Sem+Imagem'">
                <div class="admin-book-info">
                    <h4>${this.escaparHtml(livro.titulo)}</h4>
                    <div class="author">por ${this.escaparHtml(livro.autor)}</div>
                    <div class="price">R$ ${livro.preco.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="admin-book-actions">
                    <button class="btn btn--primary btn--small" onclick="bookverse.editarLivro(${livro.id})">
                        Editar
                    </button>
                    <button class="btn btn--danger btn--small" onclick="bookverse.excluirLivro(${livro.id})">
                        Excluir
                    </button>
                </div>
            </div>
        `).join('');
    }

    salvarLivros() {
        localStorage.setItem('bookverse_livros', JSON.stringify(this.livros));
    }

    mostrarAlerta(mensagem, tipo = 'success') {
        this.limparAlertas();
        
        const alerta = document.createElement('div');
        alerta.className = `alert alert--${tipo}`;
        alerta.textContent = mensagem;
        
        const adminContent = document.querySelector('.admin-content');
        adminContent.insertBefore(alerta, adminContent.firstChild);
        
        setTimeout(() => {
            this.limparAlertas();
        }, 5000);
    }

    limparAlertas() {
        const alertas = document.querySelectorAll('.alert');
        alertas.forEach(alerta => alerta.remove());
    }

    escaparHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }
}

let bookverse;
document.addEventListener('DOMContentLoaded', () => {
    bookverse = new BookVerse();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const adminPanel = document.getElementById('admin-panel');
        if (!adminPanel.classList.contains('hidden')) {
            bookverse.fecharPainelAdmin();
        }
    }
});