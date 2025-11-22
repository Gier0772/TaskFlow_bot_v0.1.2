const usuarios = [
    { 
        usuario: "admin", 
        pass: "admin123", 
        rol: "administrador",
        nombre: "Administrador Principal",
        email: "admin@empresa.com",
        fechaRegistro: new Date().toISOString()
    },
    { 
        usuario: "empleado", 
        pass: "tareas123", 
        rol: "empleado",
        nombre: "Juan Pérez",
        email: "juan@empresa.com",
        fechaRegistro: new Date().toISOString()
    }
];

let usuarioActivo = null;
let tareas = [];
let empleados = [];
let filtro = "todas";
let editandoId = null;
let editandoEmpleadoId = null;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando TaskFlow...');
    inicializarSistema();
});

function inicializarSistema() {
    cargarDatos();
    configurarEventListeners();
    console.log('Sistema inicializado correctamente');
}

function cargarDatos() {
    // Cargar tareas desde localStorage
    const tareasGuardadas = localStorage.getItem('tareas');
    if (tareasGuardadas) {
        tareas = JSON.parse(tareasGuardadas);
        console.log('Tareas cargadas:', tareas.length);
    }
    
    // Cargar empleados desde localStorage
    const empleadosGuardados = localStorage.getItem('empleados');
    if (empleadosGuardados) {
        empleados = JSON.parse(empleadosGuardados);
        console.log('Empleados cargados:', empleados.length);
    }
    
    // Cargar usuarios adicionales desde localStorage
    const usuariosGuardados = localStorage.getItem('usuarios');
    if (usuariosGuardados) {
        const usuariosExtra = JSON.parse(usuariosGuardados);
        usuarios.push(...usuariosExtra.filter(nuevo => 
            !usuarios.some(existente => existente.usuario === nuevo.usuario)
        ));
    }
}

function configurarEventListeners() {
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const user = document.getElementById('loginUser').value.trim();
            const pass = document.getElementById('loginPass').value.trim();
            
            const usuarioEncontrado = usuarios.find(u => u.usuario === user && u.pass === pass);
            if (usuarioEncontrado) {
                usuarioActivo = usuarioEncontrado;
                mostrarDashboard();
            } else {
                mostrarErrorLogin('Usuario o contraseña incorrectos');
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            usuarioActivo = null;
            document.body.classList.remove('dashboard-visible');
            resetearInterfaz();
        });
    }

    // Navegación
    configurarNavegacion();

    // Formularios
    configurarFormularios();

    // Chatbot
    configurarChatbot();

    // Menú hamburguesa
    configurarMenuHamburguesa();

    // Foto de perfil
    configurarFotoPerfil();
}

function configurarNavegacion() {
    document.querySelectorAll('.menu-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const seccionId = this.getAttribute('data-section');
            mostrarSeccion(seccionId);
        });
    });
}

function configurarFormularios() {
    // Formulario de tareas
    const formTarea = document.getElementById('formTarea');
    if (formTarea) {
        formTarea.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarTarea();
        });
    }

    // Formulario de empleados
    const formEmpleado = document.getElementById('formEmpleado');
    if (formEmpleado) {
        formEmpleado.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarEmpleado();
        });
    }

    // Formulario de cambio de contraseña
    const formCambiarClave = document.getElementById('formCambiarClave');
    if (formCambiarClave) {
        formCambiarClave.addEventListener('submit', function(e) {
            e.preventDefault();
            cambiarContraseña();
        });
    }

    // Filtros de tareas
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            filtro = this.getAttribute('data-estado');
            
            if (this.closest('.filtros-tareas-personales')) {
                actualizarMisTareas();
            } else {
                actualizarListadoTareas();
            }
        });
    });

    // Botón exportar Excel
    const btnExportar = document.getElementById('btnExportarExcel');
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarAExcel);
    }
}

function configurarChatbot() {
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChatbot = document.getElementById('close-chatbot');
    const chatbotSend = document.getElementById('chatbot-send');

    if (chatbotIcon && chatbotWindow) {
        chatbotIcon.addEventListener('click', function() {
            chatbotWindow.style.display = chatbotWindow.style.display === 'flex' ? 'none' : 'flex';
            
            // Si se está mostrando el chatbot, inicializarlo con el usuario logeado
            if (chatbotWindow.style.display === 'flex') {
                inicializarChatbot();
            }
        });

        closeChatbot.addEventListener('click', function() {
            chatbotWindow.style.display = 'none';
        });

        chatbotSend.addEventListener('click', enviarMensajeChatbot);

        const userInput = document.getElementById('chatbot-user-input');
        if (userInput) {
            userInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    enviarMensajeChatbot();
                }
            });
        }
    }
}

function inicializarChatbot() {
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.innerHTML = '';
    
    if (usuarioActivo) {
        // Saludo personalizado según el rol
        let saludo = `¡Hola ${usuarioActivo.nombre}! `;
        if (usuarioActivo.rol === 'administrador') {
            saludo += "Soy tu asistente de TaskFlow. Como administrador, puedo ayudarte con:";
            mostrarOpcionesAdmin();
        } else {
            saludo += "Soy tu asistente de TaskFlow. Como empleado, puedo ayudarte con:";
            mostrarOpcionesEmpleado();
        }
        
        addBotMessage(saludo);
    } else {
        addBotMessage("¡Hola! Por favor inicia sesión para usar el asistente.");
    }
}

function mostrarOpcionesAdmin() {
    const options = [
        "Ver tareas pendientes",
        "Estadísticas generales",
        "Empleados registrados",
        "Tareas por empleado",
        "Productividad del equipo"
    ];
    
    mostrarOpcionesChatbot(options);
}

function mostrarOpcionesEmpleado() {
    const options = [
        "Mis tareas pendientes",
        "Mis tareas en progreso",
        "Próximos vencimientos",
        "Cambiar estado de tarea",
        "Mi productividad"
    ];
    
    mostrarOpcionesChatbot(options);
}

function mostrarOpcionesChatbot(options) {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'chatbot-options';
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.addEventListener('click', function() {
            procesarOpcionChatbot(option);
        });
        optionsContainer.appendChild(button);
    });
    
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.appendChild(optionsContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function procesarOpcionChatbot(opcion) {
    addUserMessage(opcion);
    
    // Procesar después de un breve delay
    setTimeout(() => {
        procesarMensajeChatbot(opcion);
    }, 500);
}

function configurarMenuHamburguesa() {
    const menuHamburguesa = document.querySelector('.menu-hamburguesa');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuHamburguesa && sidebar) {
        menuHamburguesa.addEventListener('click', function() {
            sidebar.classList.toggle('menu-open');
        });
    }
}

function configurarFotoPerfil() {
    const btnSeleccionarFoto = document.getElementById('btnSeleccionarFoto');
    const fotoPerfil = document.getElementById('fotoPerfil');
    const btnEliminarFoto = document.getElementById('btnEliminarFoto');

    if (btnSeleccionarFoto && fotoPerfil) {
        btnSeleccionarFoto.addEventListener('click', function() {
            fotoPerfil.click();
        });

        fotoPerfil.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    guardarFotoPerfil(e.target.result);
                    actualizarAvatares(e.target.result);
                    alert('Foto de perfil actualizada correctamente');
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    if (btnEliminarFoto) {
        btnEliminarFoto.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) {
                eliminarFotoPerfil();
                alert('Foto de perfil eliminada');
            }
        });
    }
}

function guardarFotoPerfil(fotoData) {
    if (usuarioActivo) {
        localStorage.setItem(`fotoPerfil_${usuarioActivo.usuario}`, fotoData);
    }
}

function cargarFotoPerfil() {
    if (usuarioActivo) {
        const fotoGuardada = localStorage.getItem(`fotoPerfil_${usuarioActivo.usuario}`);
        if (fotoGuardada) {
            actualizarAvatares(fotoGuardada);
        }
    }
}

function eliminarFotoPerfil() {
    if (usuarioActivo) {
        localStorage.removeItem(`fotoPerfil_${usuarioActivo.usuario}`);
    }
    // Restablecer avatar a iniciales
    const avatares = document.querySelectorAll('#userAvatar, #avatarPreview');
    avatares.forEach(avatar => {
        avatar.style.backgroundImage = 'none';
        avatar.style.background = 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)';
        if (usuarioActivo) {
            avatar.textContent = usuarioActivo.nombre.charAt(0).toUpperCase();
        }
    });
}

function actualizarAvatares(fotoData) {
    const avatares = document.querySelectorAll('#userAvatar, #avatarPreview');
    avatares.forEach(avatar => {
        avatar.style.backgroundImage = `url(${fotoData})`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.textContent = '';
    });
}

function mostrarDashboard() {
    document.body.classList.add('dashboard-visible');
    actualizarInfoUsuario();
    mostrarInterfazPorRol();
    actualizarDashboard();
    actualizarListadoTareas();
    refreshEmpleados();
    refreshReportes();
    
    // Cargar foto de perfil específica del usuario
    cargarFotoPerfil();
    
    // Ocultar error de login
    const loginError = document.getElementById('loginError');
    if (loginError) {
        loginError.style.display = 'none';
    }
    
    // Limpiar formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.reset();
    }
}

function actualizarInfoUsuario() {
    if (!usuarioActivo) return;

    const elementos = {
        'miUsuario': usuarioActivo.usuario,
        'miUsuarioNombre': usuarioActivo.nombre,
        'miRol': usuarioActivo.rol === 'administrador' ? 'Administrador' : 'Empleado',
        'miEmail': usuarioActivo.email,
        'miUsuarioRol': usuarioActivo.rol === 'administrador' ? 'Administrador del Sistema' : 'Empleado'
    };

    for (const [id, valor] of Object.entries(elementos)) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    // Actualizar avatar - CON IMAGEN POR DEFECTO PARA ADMIN
    const avatares = document.querySelectorAll('#userAvatar, #avatarPreview');
    avatares.forEach(avatar => {
        if (avatar) {
            // Cargar foto específica del usuario actual
            const fotoGuardada = localStorage.getItem(`fotoPerfil_${usuarioActivo.usuario}`);
            
            if (fotoGuardada) {
                // Si el usuario tiene foto personalizada
                avatar.style.backgroundImage = `url(${fotoGuardada})`;
                avatar.style.backgroundSize = 'cover';
                avatar.style.backgroundPosition = 'center';
                avatar.textContent = '';
            } else if (usuarioActivo.usuario === 'admin') {
                // Imagen por defecto para administrador
                avatar.style.backgroundImage = 'url(Giomarfoto.jpg)';
                avatar.style.backgroundSize = 'cover';
                avatar.style.backgroundPosition = 'center';
                avatar.textContent = '';
            } else {
                // Para empleados sin foto, usar iniciales
                avatar.style.backgroundImage = 'none';
                avatar.style.background = 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)';
                avatar.textContent = usuarioActivo.nombre.charAt(0).toUpperCase();
            }
        }
    });

    // Actualizar último acceso
    const ultimoAcceso = document.getElementById('ultimoAcceso');
    if (ultimoAcceso) {
        ultimoAcceso.textContent = new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
function mostrarInterfazPorRol() {
    if (!usuarioActivo) return;

    const esAdmin = usuarioActivo.rol === 'administrador';
    
    // Mostrar/ocultar elementos según el rol
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = esAdmin ? 'block' : 'none';
    });
    
    document.querySelectorAll('.empleado-only').forEach(el => {
        el.style.display = esAdmin ? 'none' : 'block';
    });

    // Actualizar dashboard según rol
    actualizarDashboard();
}

// ===== DASHBOARD =====
function actualizarDashboard() {
    const dashboardContent = document.getElementById('dashboard-content-dinamico');
    if (!dashboardContent) return;

    if (usuarioActivo.rol === 'administrador') {
        actualizarDashboardAdmin();
    } else {
        actualizarDashboardEmpleado();
    }
}

function actualizarDashboardAdmin() {
    const dashboardContent = document.getElementById('dashboard-content-dinamico');
    const totalTareas = tareas.length;
    const tareasPendientes = tareas.filter(t => t.estado === 'Pendiente').length;
    const totalEmpleados = empleados.length;
    const productividad = calcularProductividad();

    dashboardContent.innerHTML = `
        <div class="dashboard-cards">
            <div class="dashboard-card">
                <h3>Total Tareas</h3>
                <div class="card-number">${totalTareas}</div>
                <p>En el sistema</p>
            </div>
            <div class="dashboard-card">
                <h3>Tareas Pendientes</h3>
                <div class="card-number">${tareasPendientes}</div>
                <p>Por asignar</p>
            </div>
            <div class="dashboard-card">
                <h3>Empleados</h3>
                <div class="card-number">${totalEmpleados}</div>
                <p>Registrados</p>
            </div>
            <div class="dashboard-card">
                <h3>Productividad</h3>
                <div class="card-number">${productividad}%</div>
                <p>General</p>
            </div>
        </div>
        <div class="dashboard-actions">
            <button class="btn-action" onclick="mostrarSeccion('tareas-section')">Gestionar Tareas</button>
            <button class="btn-action" onclick="mostrarSeccion('empleados-section')">Gestionar Empleados</button>
            <button class="btn-action" onclick="mostrarSeccion('reportes-section')">Ver Reportes</button>
        </div>
    `;
}

function actualizarDashboardEmpleado() {
    const dashboardContent = document.getElementById('dashboard-content-dinamico');
    const misTareas = obtenerMisTareas();
    const tareasPendientes = misTareas.filter(t => t.estado === 'Pendiente').length;
    const tareasEnProgreso = misTareas.filter(t => t.estado === 'Progreso').length;
    const tareasProximas = contarTareasProximas();

    dashboardContent.innerHTML = `
        <div class="dashboard-cards">
            <div class="dashboard-card">
                <h3>Mis Tareas</h3>
                <div class="card-number">${misTareas.length}</div>
                <p>Total asignadas</p>
            </div>
            <div class="dashboard-card">
                <h3>Pendientes</h3>
                <div class="card-number">${tareasPendientes}</div>
                <p>Por completar</p>
            </div>
            <div class="dashboard-card">
                <h3>En Progreso</h3>
                <div class="card-number">${tareasEnProgreso}</div>
                <p>En trabajo</p>
            </div>
            <div class="dashboard-card">
                <h3>Próximas</h3>
                <div class="card-number">${tareasProximas}</div>
                <p>Vencen pronto</p>
            </div>
        </div>
        <div class="dashboard-actions">
            <button class="btn-action" onclick="mostrarSeccion('mis-tareas-section')">Ver Mis Tareas</button>
            <button class="btn-action" onclick="mostrarSeccion('mi-calendario-section')">Mi Calendario</button>
            <button class="btn-action" onclick="mostrarSeccion('tareas-section')">Todas las Tareas</button>
        </div>
    `;
}

function calcularProductividad() {
    const totalTareas = tareas.length;
    const tareasCompletadas = tareas.filter(t => t.estado === 'Completada').length;
    return totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0;
}

function contarTareasProximas() {
    if (!usuarioActivo) return 0;
    
    const hoy = new Date();
    const unaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return obtenerMisTareas().filter(t => {
        if (!t.fecha) return false;
        const fechaTarea = new Date(t.fecha);
        return fechaTarea >= hoy && fechaTarea <= unaSemana;
    }).length;
}

// ===== NAVEGACIÓN =====
function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.dashboard-panel').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Remover active de todos los botones
    document.querySelectorAll('.menu-item').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const seccion = document.getElementById(seccionId);
    if (seccion) {
        seccion.classList.add('active');
    }
    
    // Activar botón correspondiente
    const menuBtn = document.querySelector(`[data-section="${seccionId}"]`);
    if (menuBtn) {
        menuBtn.classList.add('active');
    }
    
    // Ejecutar funciones específicas de cada sección
    switch(seccionId) {
        case "tareas-section":
            actualizarListadoTareas();
            break;
        case "reportes-section":
            refreshReportes();
            break;
        case "empleados-section":
            refreshEmpleados();
            break;
        case "mis-tareas-section":
            actualizarMisTareas();
            break;
        case "mi-calendario-section":
            actualizarCalendario();
            break;
        case "reportes-avanzados-section":
            actualizarReportesAvanzados();
            break;
        case "micuenta-section":
            actualizarInfoUsuario();
            break;
    }
}

// ===== GESTIÓN DE TAREAS =====
function guardarTarea() {
    if (usuarioActivo.rol !== 'administrador') {
        alert('Solo los administradores pueden crear tareas.');
        return;
    }
    
    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const responsable = document.getElementById('responsable').value;
    const fecha = document.getElementById('fecha').value;
    const prioridad = document.getElementById('prioridad').value;
    
    if (editandoId) {
        // Editar tarea existente
        const tarea = tareas.find(t => t.id === editandoId);
        if (tarea) {
            tarea.titulo = titulo;
            tarea.descripcion = descripcion;
            tarea.responsable = responsable;
            tarea.fecha = fecha;
            tarea.prioridad = prioridad;
        }
        editandoId = null;
    } else {
        // Crear nueva tarea
        const nuevaTarea = {
            id: Date.now(),
            titulo,
            descripcion,
            responsable,
            fecha,
            prioridad,
            estado: 'Pendiente',
            creadoPor: usuarioActivo.usuario,
            fechaCreacion: new Date().toISOString()
        };
        tareas.push(nuevaTarea);
    }
    
    guardarTareasStorage();
    actualizarListadoTareas();
    actualizarMisTareas();
    refreshReportes();
    
    // Limpiar formulario
    document.getElementById('formTarea').reset();
}

function guardarTareasStorage() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

function actualizarListadoTareas() {
    const ul = document.getElementById('listaTareas');
    const noTareas = document.getElementById('noTareas');
    if (!ul) return;
    
    ul.innerHTML = '';
    
    let tareasMostrar = tareas;
    
    // Filtrar según el rol
    if (usuarioActivo.rol === 'empleado') {
        tareasMostrar = obtenerMisTareas();
    }
    
    // Aplicar filtro de estado
    if (filtro !== 'todas') {
        tareasMostrar = tareasMostrar.filter(t => t.estado === filtro);
    }
    
    // Mostrar mensaje si no hay tareas
    if (noTareas) {
        noTareas.style.display = tareasMostrar.length === 0 ? 'block' : 'none';
    }
    
    // Generar listado
    tareasMostrar.forEach(tarea => {
        const li = document.createElement('li');
        const puedeEditar = usuarioActivo.rol === 'administrador';
        
        li.innerHTML = `
            <span>
                <strong>${tarea.titulo}</strong> 
                <span class="estado ${tarea.estado}">${tarea.estado}</span>
                <small class="desc" style="color:#666;display:block;">${tarea.descripcion}</small>
                <small class="responsable" style="color:#594;">Resp: ${tarea.responsable}</small>
                <small style="color:#666;">Vence: ${tarea.fecha}</small>
                <span class="estado ${tarea.prioridad}">${tarea.prioridad}</span>
            </span>
            <div>
                <button class="btn-cambiar" onclick="cambiarEstadoTarea(${tarea.id})">Siguiente estado</button>
                ${puedeEditar ? `
                    <button class="btn-editar" onclick="editarTarea(${tarea.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarTarea(${tarea.id})">Eliminar</button>
                ` : ''}
            </div>
        `;
        ul.appendChild(li);
    });
}

function obtenerMisTareas() {
    if (!usuarioActivo) return [];
    
    return tareas.filter(t => 
        t.responsable && (
            t.responsable.toLowerCase().includes(usuarioActivo.nombre.toLowerCase()) ||
            t.responsable.toLowerCase().includes(usuarioActivo.usuario.toLowerCase())
        )
    );
}

// Funciones globales para los botones
window.cambiarEstadoTarea = function(id) {
    const estados = ['Pendiente', 'Progreso', 'Completada'];
    const tarea = tareas.find(t => t.id === id);
    
    if (tarea) {
        const indiceActual = estados.indexOf(tarea.estado);
        tarea.estado = estados[(indiceActual + 1) % estados.length];
        guardarTareasStorage();
        actualizarListadoTareas();
        actualizarMisTareas();
        refreshReportes();
    }
};

window.editarTarea = function(id) {
    if (usuarioActivo.rol !== 'administrador') {
        alert('Solo los administradores pueden editar tareas.');
        return;
    }
    
    const tarea = tareas.find(t => t.id === id);
    if (tarea) {
        document.getElementById('titulo').value = tarea.titulo;
        document.getElementById('descripcion').value = tarea.descripcion;
        document.getElementById('responsable').value = tarea.responsable;
        document.getElementById('fecha').value = tarea.fecha;
        document.getElementById('prioridad').value = tarea.prioridad;
        editandoId = tarea.id;
        
        // Scroll al formulario
        mostrarSeccion('tareas-section');
    }
};

window.eliminarTarea = function(id) {
    if (usuarioActivo.rol !== 'administrador') {
        alert('Solo los administradores pueden eliminar tareas.');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        tareas = tareas.filter(t => t.id !== id);
        guardarTareasStorage();
        actualizarListadoTareas();
        actualizarMisTareas();
        refreshReportes();
    }
};

// ===== TAREAS PERSONALES =====
function actualizarMisTareas() {
    const container = document.getElementById('listaMisTareas');
    const noMisTareas = document.getElementById('noMisTareas');
    if (!container) return;
    
    container.innerHTML = '';
    
    let misTareas = obtenerMisTareas();
    
    // Aplicar filtro si está en la sección personal
    if (filtro !== 'todas') {
        misTareas = misTareas.filter(t => t.estado === filtro);
    }
    
    if (noMisTareas) {
        noMisTareas.style.display = misTareas.length === 0 ? 'block' : 'none';
    }
    
    misTareas.forEach(tarea => {
        const tareaDiv = document.createElement('div');
        tareaDiv.className = 'tarea-personal';
        tareaDiv.innerHTML = `
            <div class="tarea-header">
                <h4>${tarea.titulo}</h4>
                <span class="estado ${tarea.estado}">${tarea.estado}</span>
            </div>
            <p class="tarea-desc">${tarea.descripcion}</p>
            <div class="tarea-meta">
                <span class="prioridad ${tarea.prioridad}">${tarea.prioridad}</span>
                <span class="fecha">Vence: ${tarea.fecha}</span>
            </div>
            <button class="btn-cambiar" onclick="cambiarEstadoTarea(${tarea.id})">Avanzar Estado</button>
        `;
        container.appendChild(tareaDiv);
    });
}

// ===== CALENDARIO =====
function actualizarCalendario() {
    const container = document.getElementById('calendarioVencimientos');
    if (!container) return;
    
    const hoy = new Date();
    const misTareas = obtenerMisTareas().filter(t => 
        t.fecha && new Date(t.fecha) >= hoy
    ).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    if (misTareas.length === 0) {
        container.innerHTML = '<p class="sin-tareas">No tienes tareas con fechas próximas.</p>';
        return;
    }
    
    let html = '<div class="calendario-tareas">';
    misTareas.slice(0, 10).forEach(tarea => {
        const fecha = new Date(tarea.fecha);
        const diasRestantes = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
        
        html += `
            <div class="calendario-item">
                <div class="calendario-fecha">
                    <strong>${fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</strong>
                    <small>${diasRestantes} días</small>
                </div>
                <div class="calendario-info">
                    <strong>${tarea.titulo}</strong>
                    <span class="estado ${tarea.estado}">${tarea.estado}</span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// ===== GESTIÓN DE EMPLEADOS =====
function guardarEmpleado() {
    if (usuarioActivo.rol !== 'administrador') {
        alert('Solo los administradores pueden gestionar empleados.');
        return;
    }
    
    const nombre = document.getElementById('nombreEmpleado').value;
    const cargo = document.getElementById('cargoEmpleado').value;
    const email = document.getElementById('emailEmpleado').value;
    const usuario = document.getElementById('usuarioEmpleado').value;
    const password = document.getElementById('passwordEmpleado').value;
    
    if (editandoEmpleadoId) {
        // Editar empleado existente
        const emp = empleados.find(e => e.id === editandoEmpleadoId);
        if (emp) {
            emp.nombre = nombre;
            emp.cargo = cargo;
            emp.email = email;
            emp.usuario = usuario;
            if (password) emp.pass = password;
        }
        editandoEmpleadoId = null;
    } else {
        // Crear nuevo empleado
        const nuevoEmpleado = {
            id: Date.now(),
            nombre,
            cargo,
            email,
            usuario,
            pass: password || 'temp123',
            rol: 'empleado',
            fechaRegistro: new Date().toISOString()
        };
        empleados.push(nuevoEmpleado);
        
        // Agregar a usuarios para login
        usuarios.push({
            usuario: usuario,
            pass: password || 'temp123',
            rol: 'empleado',
            nombre: nombre,
            email: email,
            fechaRegistro: new Date().toISOString()
        });
    }
    
    guardarEmpleadosStorage();
    guardarUsuariosStorage();
    refreshEmpleados();
    
    // Limpiar formulario
    document.getElementById('formEmpleado').reset();
}

function guardarEmpleadosStorage() {
    localStorage.setItem('empleados', JSON.stringify(empleados));
}

function guardarUsuariosStorage() {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function refreshEmpleados() {
    const tbody = document.getElementById('listaEmpleados');
    const noEmpleados = document.getElementById('noEmpleados');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (noEmpleados) {
        noEmpleados.style.display = empleados.length === 0 ? 'block' : 'none';
    }
    
    empleados.forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${emp.nombre}</td>
            <td>${emp.cargo}</td>
            <td>${emp.email}</td>
            <td>${emp.usuario}</td>
            <td>
                <button class="btn-editarEmpleado" onclick="editarEmpleado(${emp.id})">Editar</button>
                <button class="btn-eliminarEmpleado" onclick="eliminarEmpleado(${emp.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.editarEmpleado = function(id) {
    const emp = empleados.find(e => e.id === id);
    if (emp) {
        document.getElementById('nombreEmpleado').value = emp.nombre;
        document.getElementById('cargoEmpleado').value = emp.cargo;
        document.getElementById('emailEmpleado').value = emp.email;
        document.getElementById('usuarioEmpleado').value = emp.usuario;
        document.getElementById('passwordEmpleado').value = '';
        document.getElementById('passwordEmpleado').placeholder = 'Dejar vacío para no cambiar';
        editandoEmpleadoId = id;
    }
};

window.eliminarEmpleado = function(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
        const emp = empleados.find(e => e.id === id);
        if (emp) {
            // Eliminar de usuarios también
            const indexUsuario = usuarios.findIndex(u => u.usuario === emp.usuario);
            if (indexUsuario !== -1) {
                usuarios.splice(indexUsuario, 1);
                guardarUsuariosStorage();
            }
        }
        
        empleados = empleados.filter(e => e.id !== id);
        guardarEmpleadosStorage();
        refreshEmpleados();
    }
};

// ===== REPORTES =====
function refreshReportes() {
    // Reportes básicos
    const elementos = {
        'reporteTotal': tareas.length,
        'reportePendiente': tareas.filter(t => t.estado === "Pendiente").length,
        'reporteProgreso': tareas.filter(t => t.estado === "Progreso").length,
        'reporteCompletada': tareas.filter(t => t.estado === "Completada").length
    };
    
    for (const [id, valor] of Object.entries(elementos)) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }
    
    // Lista de empleados en reportes
    const empleadosReporte = document.getElementById('empleadosReporte');
    if (empleadosReporte) {
        empleadosReporte.innerHTML = '';
        empleados.forEach(emp => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${emp.nombre}</td><td>${emp.cargo}</td><td>${emp.email}</td>`;
            empleadosReporte.appendChild(row);
        });
    }
}

function actualizarReportesAvanzados() {
    actualizarProductividadEmpleados();
    actualizarTareasPorEstado();
    actualizarTiemposPromedio();
}

function actualizarProductividadEmpleados() {
    const container = document.getElementById('productividadEmpleados');
    if (!container) return;
    
    let html = '<div class="productividad-list">';
    
    // Si no hay empleados, mostrar mensaje
    if (empleados.length === 0) {
        html = '<p>No hay empleados registrados.</p>';
    } else {
        empleados.forEach(emp => {
            const tareasEmpleado = tareas.filter(t => 
                t.responsable && (
                    t.responsable.toLowerCase().includes(emp.nombre.toLowerCase()) ||
                    t.responsable.toLowerCase().includes(emp.usuario.toLowerCase())
                )
            );
            const completadas = tareasEmpleado.filter(t => t.estado === 'Completada').length;
            const productividad = tareasEmpleado.length > 0 ? Math.round((completadas / tareasEmpleado.length) * 100) : 0;
            
            html += `
                <div class="empleado-stats">
                    <span class="empleado-nombre">${emp.nombre}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${productividad}%"></div>
                    </div>
                    <span class="empleado-stats">${completadas}/${tareasEmpleado.length} (${productividad}%)</span>
                </div>
            `;
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function actualizarTareasPorEstado() {
    const container = document.getElementById('tareasPorEstado');
    if (!container) return;
    
    const pendientes = tareas.filter(t => t.estado === 'Pendiente').length;
    const progreso = tareas.filter(t => t.estado === 'Progreso').length;
    const completadas = tareas.filter(t => t.estado === 'Completada').length;
    const total = tareas.length;
    
    container.innerHTML = `
        <div class="estado-stats">
            <div class="estado-item">
                <span class="estado-label">Pendientes</span>
                <span class="estado-value">${pendientes} (${total > 0 ? Math.round((pendientes/total)*100) : 0}%)</span>
            </div>
            <div class="estado-item">
                <span class="estado-label">En Progreso</span>
                <span class="estado-value">${progreso} (${total > 0 ? Math.round((progreso/total)*100) : 0}%)</span>
            </div>
            <div class="estado-item">
                <span class="estado-label">Completadas</span>
                <span class="estado-value">${completadas} (${total > 0 ? Math.round((completadas/total)*100) : 0}%)</span>
            </div>
        </div>
    `;
}

function actualizarTiemposPromedio() {
    const container = document.getElementById('tiemposPromedio');
    if (!container) return;
    
    // Calcular tiempo promedio real
    let tiempoPromedio = 0;
    const tareasCompletadas = tareas.filter(t => t.estado === 'Completada' && t.fechaCreacion);
    
    if (tareasCompletadas.length > 0) {
        const totalDias = tareasCompletadas.reduce((sum, tarea) => {
            const fechaCreacion = new Date(tarea.fechaCreacion);
            const fechaCompletacion = new Date();
            const dias = Math.ceil((fechaCompletacion - fechaCreacion) / (1000 * 60 * 60 * 24));
            return sum + dias;
        }, 0);
        tiempoPromedio = (totalDias / tareasCompletadas.length).toFixed(1);
    }
    
    // Tareas completadas esta semana
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const tareasEstaSemana = tareas.filter(t => {
        if (t.estado !== 'Completada') return false;
        const fechaTarea = new Date(t.fechaCreacion);
        return fechaTarea >= inicioSemana;
    }).length;
    
    container.innerHTML = `
        <div class="tiempos-stats">
            <div class="tiempo-item">
                <span class="tiempo-label">Tiempo promedio por tarea</span>
                <span class="tiempo-value">${tiempoPromedio} días</span>
            </div>
            <div class="tiempo-item">
                <span class="tiempo-label">Tareas completadas esta semana</span>
                <span class="tiempo-value">${tareasEstaSemana}</span>
            </div>
            <div class="tiempo-item">
                <span class="tiempo-label">Eficiencia del equipo</span>
                <span class="tiempo-value">${calcularProductividad()}%</span>
            </div>
        </div>
    `;
}

// ===== EXPORTACIÓN =====
function exportarAExcel() {
    let ws_data = [["Título", "Descripción", "Responsable", "Fecha", "Prioridad", "Estado"]];
    tareas.forEach(t => {
        ws_data.push([t.titulo, t.descripcion, t.responsable, t.fecha, t.prioridad, t.estado]);
    });
    
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Tareas");
    XLSX.writeFile(wb, "tareas_taskflow.xlsx");
}

// ===== CAMBIO DE CONTRASEÑA =====
function cambiarContraseña() {
    const claveActual = document.getElementById('claveActual').value;
    const claveNueva = document.getElementById('claveNueva').value;
    const msgElement = document.getElementById('cambioClaveMsg');
    
    if (claveNueva.length < 6) {
        mostrarMensajeClave("La nueva contraseña debe tener al menos 6 caracteres", "err");
        return;
    }
    
    const usuario = usuarios.find(u => u.usuario === usuarioActivo.usuario);
    if (usuario && claveActual === usuario.pass) {
        usuario.pass = claveNueva;
        guardarUsuariosStorage();
        mostrarMensajeClave("✅ Contraseña cambiada correctamente", "ok");
        
        // Limpiar formulario
        document.getElementById('claveActual').value = "";
        document.getElementById('claveNueva').value = "";
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
            if (msgElement) {
                msgElement.style.display = 'none';
            }
        }, 3000);
    } else {
        mostrarMensajeClave("❌ Contraseña actual incorrecta", "err");
    }
}

function mostrarMensajeClave(mensaje, tipo) {
    const msgElement = document.getElementById('cambioClaveMsg');
    if (msgElement) {
        msgElement.textContent = mensaje;
        msgElement.className = tipo;
        msgElement.style.display = "block";
    }
}

// ===== CHATBOT =====
function addBotMessage(text) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot-message';
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addUserMessage(text) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function enviarMensajeChatbot() {
    const input = document.getElementById('chatbot-user-input');
    const message = input.value.trim();
    
    if (message) {
        addUserMessage(message);
        input.value = '';
        
        // Procesar mensaje después de un breve delay
        setTimeout(() => {
            procesarMensajeChatbot(message);
        }, 500);
    }
}

function procesarMensajeChatbot(mensaje) {
    const lowerMessage = mensaje.toLowerCase();
    
    if (!usuarioActivo) {
        addBotMessage("Por favor inicia sesión para usar el asistente.");
        return;
    }

    const esAdmin = usuarioActivo.rol === 'administrador';
    
    // Funcionalidades para Administrador
    if (esAdmin) {
        if (lowerMessage.includes('tarea') && lowerMessage.includes('pendiente')) {
            const pendientes = tareas.filter(t => t.estado === 'Pendiente');
            if (pendientes.length === 0) {
                addBotMessage('No hay tareas pendientes en este momento.');
            } else {
                addBotMessage(`Hay ${pendientes.length} tareas pendientes en total.`);
                pendientes.slice(0, 3).forEach(tarea => {
                    addBotMessage(`• ${tarea.titulo} - Asignada a: ${tarea.responsable}`);
                });
                if (pendientes.length > 3) {
                    addBotMessage(`... y ${pendientes.length - 3} tareas más.`);
                }
            }
        }
        else if (lowerMessage.includes('estadística') || lowerMessage.includes('estadisticas')) {
            const total = tareas.length;
            const completadas = tareas.filter(t => t.estado === 'Completada').length;
            const pendientes = tareas.filter(t => t.estado === 'Pendiente').length;
            const enProgreso = tareas.filter(t => t.estado === 'Progreso').length;
            addBotMessage(`📊 Estadísticas generales:
• Total: ${total} tareas
• Completadas: ${completadas} (${Math.round((completadas/total)*100)}%)
• En progreso: ${enProgreso}
• Pendientes: ${pendientes}`);
        }
        else if (lowerMessage.includes('empleado') && lowerMessage.includes('registrado')) {
            if (empleados.length === 0) {
                addBotMessage('No hay empleados registrados.');
            } else {
                addBotMessage(`Hay ${empleados.length} empleados registrados:`);
                empleados.forEach(emp => {
                    addBotMessage(`• ${emp.nombre} - ${emp.cargo}`);
                });
            }
        }
        else if (lowerMessage.includes('tarea') && lowerMessage.includes('empleado')) {
            if (empleados.length === 0) {
                addBotMessage('No hay empleados registrados.');
            } else {
                addBotMessage('Tareas por empleado:');
                empleados.forEach(emp => {
                    const tareasEmpleado = tareas.filter(t => 
                        t.responsable && t.responsable.toLowerCase().includes(emp.nombre.toLowerCase())
                    );
                    addBotMessage(`• ${emp.nombre}: ${tareasEmpleado.length} tareas`);
                });
            }
        }
        else if (lowerMessage.includes('productividad') || lowerMessage.includes('equipo')) {
            const productividad = calcularProductividad();
            addBotMessage(`La productividad general del equipo es del ${productividad}%.`);
            
            // Mostrar productividad por empleado
            empleados.forEach(emp => {
                const tareasEmpleado = tareas.filter(t => 
                    t.responsable && t.responsable.toLowerCase().includes(emp.nombre.toLowerCase())
                );
                const completadas = tareasEmpleado.filter(t => t.estado === 'Completada').length;
                const productividadEmp = tareasEmpleado.length > 0 ? 
                    Math.round((completadas / tareasEmpleado.length) * 100) : 0;
                addBotMessage(`• ${emp.nombre}: ${productividadEmp}%`);
            });
        }
        else {
            addBotMessage('Puedo ayudarte con: ver tareas pendientes, estadísticas generales, empleados registrados, tareas por empleado y productividad del equipo.');
        }
    }
    // Funcionalidades para Empleado
    else {
        if (lowerMessage.includes('tarea') && lowerMessage.includes('pendiente')) {
            const misTareasPendientes = obtenerMisTareas().filter(t => t.estado === 'Pendiente');
            if (misTareasPendientes.length === 0) {
                addBotMessage('No tienes tareas pendientes. ¡Excelente trabajo!');
            } else {
                addBotMessage(`Tienes ${misTareasPendientes.length} tareas pendientes:`);
                misTareasPendientes.forEach(tarea => {
                    addBotMessage(`• ${tarea.titulo} - Vence: ${tarea.fecha}`);
                });
            }
        }
        else if (lowerMessage.includes('tarea') && lowerMessage.includes('progreso')) {
            const misTareasProgreso = obtenerMisTareas().filter(t => t.estado === 'Progreso');
            if (misTareasProgreso.length === 0) {
                addBotMessage('No tienes tareas en progreso en este momento.');
            } else {
                addBotMessage(`Tienes ${misTareasProgreso.length} tareas en progreso:`);
                misTareasProgreso.forEach(tarea => {
                    addBotMessage(`• ${tarea.titulo}`);
                });
            }
        }
        else if (lowerMessage.includes('próximo') || lowerMessage.includes('vencimiento')) {
            const hoy = new Date();
            const misTareasProximas = obtenerMisTareas().filter(t => {
                if (!t.fecha) return false;
                const fechaTarea = new Date(t.fecha);
                const diferenciaDias = Math.ceil((fechaTarea - hoy) / (1000 * 60 * 60 * 24));
                return diferenciaDias <= 7 && diferenciaDias >= 0;
            }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            
            if (misTareasProximas.length === 0) {
                addBotMessage('No tienes tareas que venzan en los próximos 7 días.');
            } else {
                addBotMessage('Tus próximos vencimientos:');
                misTareasProximas.forEach(tarea => {
                    const fecha = new Date(tarea.fecha);
                    const diasRestantes = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
                    addBotMessage(`• ${tarea.titulo} - En ${diasRestantes} días`);
                });
            }
        }
        else if (lowerMessage.includes('cambiar') || lowerMessage.includes('estado')) {
            const misTareas = obtenerMisTareas().filter(t => t.estado !== 'Completada');
            if (misTareas.length === 0) {
                addBotMessage('No tienes tareas pendientes para cambiar de estado.');
            } else {
                addBotMessage('Puedes cambiar el estado de estas tareas:');
                misTareas.forEach(tarea => {
                    addBotMessage(`• ${tarea.titulo} (${tarea.estado}) - ID: ${tarea.id}`);
                });
                addBotMessage('Para cambiar el estado, ve a "Mis Tareas" y usa el botón "Avanzar Estado".');
            }
        }
        else if (lowerMessage.includes('productividad')) {
            const misTareas = obtenerMisTareas();
            const completadas = misTareas.filter(t => t.estado === 'Completada').length;
            const productividad = misTareas.length > 0 ? 
                Math.round((completadas / misTareas.length) * 100) : 0;
            addBotMessage(`Tu productividad personal es del ${productividad}%.`);
            addBotMessage(`Has completado ${completadas} de ${misTareas.length} tareas asignadas.`);
        }
        else {
            addBotMessage('Puedo ayudarte con: ver tus tareas pendientes, tareas en progreso, próximos vencimientos, cambiar estado de tareas y tu productividad personal.');
        }
    }
    
    // Mostrar opciones nuevamente después de la respuesta
    setTimeout(() => {
        if (esAdmin) {
            mostrarOpcionesAdmin();
        } else {
            mostrarOpcionesEmpleado();
        }
    }, 1000);
}

console.log('TaskFlow cargado correctamente');
