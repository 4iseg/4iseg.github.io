(function () {
  'use strict';

  var STATE_COLOR = { segura: 'var(--green)', mejorable: 'var(--amber)', peligrosa: 'var(--red)' };
  var STATE_TAG = { segura: '[OK]', mejorable: '[WARNING]', peligrosa: '[CRITICAL]' };
  var POINTS = { segura: 10, mejorable: 5, peligrosa: 0 };

  var questions = [
    { title: '01. ¿UNA CONTRASEÑA PARA CADA SERVICIO O UNA PARA DOMINARLOS A TODOS?',
      options: [
        { key: 'A', text: 'Cada servicio tiene una contraseña diferente.', state: 'segura' },
        { key: 'B', text: 'Tengo varias y las reparto estratégicamente. Más o menos.', state: 'mejorable' },
        { key: 'C', text: 'Uso la misma en todas partes. La eficiencia es importante.', state: 'peligrosa' }
      ],
      diagnostic: '[EFECTO DOMINÓ ACTIVADO] Cuando una web filtra tu contraseña, los atacantes la prueban automáticamente en el correo, las redes sociales y los servicios corporativos. Reutilizarla les ahorra trabajo. Muy considerado por tu parte.',
      confirmSecure: '[OK] Contraseñas únicas detectadas. Hoy no se lo estás poniendo fácil.',
      vulnLabel: 'Contraseñas reutilizadas' },
    { title: '02. ¿TU CONTRASEÑA RESISTIRÍA UN ATAQUE O SOLO UNA MIRADA SERIA?',
      options: [
        { key: 'A', text: 'Tiene 16 caracteres o más y no sigue patrones.', state: 'segura' },
        { key: 'B', text: 'Tiene entre 12 y 15 caracteres.', state: 'mejorable' },
        { key: 'C', text: 'Tiene menos de 12, pero le puse una mayúscula y un "!". Inexpugnable.', state: 'peligrosa' }
      ],
      diagnostic: '[FUERZA BRUTA PREPARANDO CAFÉ] No existe un tiempo universal: depende del algoritmo, del hardware y de lo predecible que sea la contraseña. En un ataque fuera de línea, una clave corta o común podría caer inmediatamente o en pocos minutos. "Empresa2026!" cumple muchas reglas y sigue siendo un regalo.',
      confirmSecure: '[OK] Buena longitud y sin patrones evidentes. La máquina tendrá que ganarse el sueldo.',
      vulnLabel: 'Contraseña débil o corta' },
    { title: '03. ¿DÓNDE GUARDAS TUS CONTRASEÑAS?',
      options: [
        { key: 'A', text: 'En un gestor de contraseñas.', state: 'segura' },
        { key: 'B', text: 'En el navegador.', state: 'mejorable' },
        { key: 'C', text: 'En un documento, una nota o un mensaje.', state: 'peligrosa' },
        { key: 'D', text: 'En mi cabeza. Excepto cuando necesito recordarlas.', state: 'mejorable' }
      ],
      diagnostic: '[CONTRASEÑAS.XLSX ENCONTRADO] Guardarlas en texto claro no es gestionar contraseñas: es preparar el inventario para el atacante. Usa un gestor reconocido y protégelo con autenticación multifactor.',
      confirmSecure: '[OK] Gestor localizado. Memorizar "Gatito1", "Gatito2" y "Gatito3" no era un plan.',
      vulnLabel: 'Contraseñas mal almacenadas' },
    { title: '04. SI CONSIGUEN TU CONTRASEÑA, ¿QUÉ SE ENCUENTRAN DESPUÉS?',
      options: [
        { key: 'A', text: 'Una aplicación de autenticación o una llave física.', state: 'segura' },
        { key: 'B', text: 'Un código enviado por SMS.', state: 'mejorable' },
        { key: 'C', text: 'MFA en algunos servicios, donde me acordé de activarlo.', state: 'mejorable' },
        { key: 'D', text: 'Nada. Ya han llegado al salón.', state: 'peligrosa' }
      ],
      diagnostic: '[PUERTA ABIERTA. ALARMA DECORATIVA] El MFA no hace invulnerable una cuenta, pero evita que una contraseña robada sea suficiente. Empieza por el correo: suele ser la llave para restablecer todas las demás.',
      confirmSecure: '[OK] Segunda barrera activa. Robar la contraseña ya no completa la misión.',
      vulnLabel: 'Sin doble factor (MFA)' },
    { title: '05. ¿QUÉ HACES CUANDO TU EQUIPO PIDE ACTUALIZARSE?',
      options: [
        { key: 'A', text: 'Actualizo automáticamente o cuanto antes.', state: 'segura' },
        { key: 'B', text: 'Pulso "Recordármelo mañana" desde hace tres semanas.', state: 'mejorable' },
        { key: 'C', text: 'Espero a que el programa prácticamente me suplique.', state: 'peligrosa' },
        { key: 'D', text: 'No actualizo algo que ya funciona. Soy una persona de principios.', state: 'peligrosa' }
      ],
      diagnostic: '[VULNERABILIDAD DE COLECCIONISTA] Mientras conservas software antiguo por nostalgia, los atacantes conservan exploits que funcionan contra él. Las actualizaciones de seguridad no son decoración.',
      confirmSecure: '[OK] Parches al día. Tu equipo vive en el presente.',
      vulnLabel: 'Software sin actualizar' },
    { title: '06. ¿TIENES COPIAS DE SEGURIDAD O UN OPTIMISMO EXTRAORDINARIO?',
      options: [
        { key: 'A', text: 'Sí: periódicas, verificadas y con alguna copia desconectada.', state: 'segura' },
        { key: 'B', text: 'Sí, aunque todas permanecen conectadas.', state: 'mejorable' },
        { key: 'C', text: 'Copio algunas carpetas cuando me acuerdo.', state: 'peligrosa' },
        { key: 'D', text: 'No. Pero hasta ahora nunca ha pasado nada.', state: 'peligrosa' }
      ],
      diagnostic: '[PLAN DE RECUPERACIÓN: CRUZAR LOS DEDOS] Una copia que nunca has restaurado es una teoría. Si además permanece conectada, el ransomware puede cifrar el original y la copia en una sola visita.',
      confirmSecure: '[OK] Copias verificadas y aisladas. La fe puede dedicarse a otros asuntos.',
      vulnLabel: 'Copias de seguridad inexistentes o mal aisladas' },
    { title: '07. RECIBES UNA FACTURA URGENTE QUE NADIE ESPERABA. ¿QUÉ HACES?',
      options: [
        { key: 'A', text: 'Verifico el remitente, el dominio y la petición por otro canal.', state: 'segura' },
        { key: 'B', text: 'Me parece sospechosa, pero la curiosidad también cuenta.', state: 'mejorable' },
        { key: 'C', text: 'Tiene el logotipo de la empresa. Debe ser auténtica.', state: 'peligrosa' },
        { key: 'D', text: 'Abro el archivo. Si fuera peligroso, seguramente avisaría.', state: 'peligrosa' }
      ],
      diagnostic: '[PHISHING: EL LOGOTIPO ERA MUY CONVINCENTE] Copiar una imagen corporativa lleva segundos. Comprueba el dominio y confirma por otro canal cualquier pago, cambio de cuenta o petición urgente.',
      confirmSecure: '[OK] Verificación completada. La urgencia no ha conseguido apagar tu cerebro.',
      vulnLabel: 'Vulnerable a phishing' },
    { title: '08. TE ALEJAS DEL ORDENADOR "SOLO UN MOMENTO". ¿QUÉ DEJAS ABIERTO?',
      options: [
        { key: 'A', text: 'Nada: se bloquea automáticamente.', state: 'segura' },
        { key: 'B', text: 'Normalmente lo bloqueo.', state: 'mejorable' },
        { key: 'C', text: 'Lo dejo abierto si estoy entre personas de confianza.', state: 'peligrosa' },
        { key: 'D', text: 'Todo. Aquí nos conocemos.', state: 'peligrosa' }
      ],
      diagnostic: '[HACKING AVANZADO: SENTARSE EN TU SILLA] No hace falta vulnerar una contraseña si entregas una sesión abierta. Activa el bloqueo automático y utiliza Windows + L cuando te levantes.',
      confirmSecure: '[OK] Sesión bloqueada. El ataque de la silla vacía ha fracasado.',
      vulnLabel: 'Sesión desatendida sin bloqueo' },
    { title: '09. APARECE UNA WI-FI LLAMADA "WIFI_GRATIS_CLIENTES". ¿QUÉ HACES?',
      options: [
        { key: 'A', text: 'Compruebo que sea la red legítima.', state: 'segura' },
        { key: 'B', text: 'Me conecto con precauciones y evito operaciones sensibles.', state: 'segura' },
        { key: 'C', text: 'Tiene cobertura completa. Parece una empresa seria.', state: 'mejorable' },
        { key: 'D', text: 'Es gratis y no pide contraseña. Hoy es mi día de suerte.', state: 'peligrosa' }
      ],
      diagnostic: '[TRAMPA CON CINCO RAYAS DE COBERTURA] Cualquiera puede crear una red con un nombre tranquilizador. Comprueba la red, utiliza HTTPS y considera una VPN fiable cuando la conexión no sea de confianza.',
      confirmSecure: '[OK] Red verificada. Cinco rayas de cobertura no constituyen una auditoría.',
      vulnLabel: 'Conexión a redes Wi-Fi no verificadas' },
    { title: '10. ¿QUIÉN CONSERVA ACCESO A LOS SISTEMAS DE TU EMPRESA?',
      options: [
        { key: 'A', text: 'Solo quien lo necesita y durante el tiempo necesario.', state: 'segura' },
        { key: 'B', text: 'Probablemente alguna persona más de la cuenta.', state: 'mejorable' },
        { key: 'C', text: 'Existen cuentas antiguas "por si algún día hacen falta".', state: 'peligrosa' },
        { key: 'D', text: 'No lo sé. Eso lo controlaba alguien que se marchó.', state: 'peligrosa' }
      ],
      diagnostic: '[EMPLEADO ELIMINADO. CUENTA TODAVÍA ACTIVA] Las cuentas abandonadas son empleados fantasma con credenciales reales. Elimina accesos antiguos, revisa permisos y aplica el mínimo privilegio.',
      confirmSecure: '[OK] Mínimo privilegio aplicado. Aquí no se coleccionan cuentas fantasma.',
      vulnLabel: 'Control de accesos deficiente' }
  ];

  var recMap = {
    'Contraseñas reutilizadas': 'Usa contraseñas únicas por servicio con ayuda de un gestor.',
    'Contraseña débil o corta': 'Aumenta la longitud a 16+ caracteres sin patrones.',
    'Contraseñas mal almacenadas': 'Migra a un gestor de contraseñas cifrado.',
    'Sin doble factor (MFA)': 'Activa MFA con app de autenticación en tus cuentas críticas.',
    'Software sin actualizar': 'Activa las actualizaciones automáticas de seguridad.',
    'Copias de seguridad inexistentes o mal aisladas': 'Implementa copias periódicas, verificadas y una copia offline.',
    'Vulnerable a phishing': 'Verifica remitente y dominio antes de pagar o abrir adjuntos.',
    'Sesión desatendida sin bloqueo': 'Activa el bloqueo automático de pantalla.',
    'Conexión a redes Wi-Fi no verificadas': 'Confirma la red con el establecimiento y usa VPN si dudas.',
    'Control de accesos deficiente': 'Revisa y elimina periódicamente accesos y cuentas antiguas.'
  };

  var logPool = ['[OK] analizando credenciales...', '[OK] buscando copias de seguridad...', '[WARNING] exceso de confianza detectado', '[!!] comportamiento explotable localizado', '> recalculando superficie de exposición...', '> inspeccionando factor humano...'];
  var scanSteps = ['> consolidando respuestas...', '> buscando malas costumbres...', '> calculando superficie de exposición...', '> generando diagnóstico...', '[SCAN COMPLETED]'];

  var state = { stage: 'intro', qIndex: 0, answers: new Array(10).fill(null), scanTimer: null, finishTimer: null };

  function $(id) { return document.getElementById(id); }
  function reducedMotion() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  var stageEls = { intro: $('stageIntro'), quiz: $('stageQuiz'), scanning: $('stageScanning'), result: $('stageResult') };

  function showStage(name) {
    state.stage = name;
    Object.keys(stageEls).forEach(function (k) {
      stageEls[k].hidden = k !== name;
    });
  }

  function buildProgressBar() {
    var bar = $('progressBar');
    bar.innerHTML = '';
    for (var i = 0; i < 10; i++) {
      var seg = document.createElement('div');
      seg.className = 'seg';
      bar.appendChild(seg);
    }
  }

  function renderQuiz() {
    var qIndex = state.qIndex;
    var q = questions[qIndex];
    var answered = state.answers[qIndex];
    var answeredOpt = answered ? q.options.filter(function (o) { return o.key === answered; })[0] : null;

    $('qNumberLabel').textContent = '[' + String(qIndex + 1).padStart(2, '0') + '/10]';

    var answeredSoFar = state.answers.filter(function (a) { return a !== null; }).length;
    var nonSecure = state.answers.reduce(function (acc, a, i) {
      if (!a) return acc;
      var opt = questions[i].options.filter(function (o) { return o.key === a; })[0];
      return acc + (opt.state !== 'segura' ? 1 : 0);
    }, 0);
    var ratio = answeredSoFar ? nonSecure / answeredSoFar : 0;
    var level = ratio === 0 ? 'BAJA' : ratio <= 0.4 ? 'MEDIA' : 'ALTA';
    var expEl = $('exposureLevel');
    expEl.textContent = level;
    expEl.style.color = level === 'BAJA' ? 'var(--green)' : level === 'MEDIA' ? 'var(--amber)' : 'var(--red)';

    var segs = document.querySelectorAll('#progressBar .seg');
    segs.forEach(function (seg, i) { seg.classList.toggle('filled', i <= qIndex); });

    $('questionTitle').textContent = q.title;

    var optionsList = $('optionsList');
    optionsList.innerHTML = '';
    q.options.forEach(function (o) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.setAttribute('aria-pressed', answered === o.key ? 'true' : 'false');
      if (answered === o.key) {
        btn.style.borderColor = STATE_COLOR[o.state];
        btn.style.color = STATE_COLOR[o.state];
      }
      var keySpan = document.createElement('span');
      keySpan.className = 'opt-key';
      keySpan.textContent = '[' + o.key + ']';
      btn.appendChild(keySpan);
      btn.appendChild(document.createTextNode(o.text));
      btn.addEventListener('click', function () { selectOption(qIndex, o.key); });
      optionsList.appendChild(btn);
    });

    var diagBox = $('diagnosticBox');
    if (answeredOpt) {
      diagBox.hidden = false;
      $('diagTag').textContent = STATE_TAG[answeredOpt.state];
      $('diagTag').style.color = STATE_COLOR[answeredOpt.state];
      diagBox.style.borderLeftColor = STATE_COLOR[answeredOpt.state];
      $('diagText').textContent = answeredOpt.state === 'segura' ? q.confirmSecure : q.diagnostic;
      diagBox.classList.remove('risk-flash');
      if (answeredOpt.state === 'peligrosa' && !reducedMotion()) {
        void diagBox.offsetWidth;
        diagBox.classList.add('risk-flash');
      }
    } else {
      diagBox.hidden = true;
    }

    var btnPrev = $('btnPrev'), btnNext = $('btnNext');
    btnPrev.disabled = qIndex === 0;
    btnNext.disabled = !answered;
    btnNext.textContent = qIndex === 9 ? 'EJECUTAR_DIAGNÓSTICO' : 'SIGUIENTE >';

    var log1 = logPool[qIndex % logPool.length], log2 = logPool[(qIndex + 1) % logPool.length];
    $('logLines').innerHTML = '<div>' + log1 + '</div><div>' + log2 + '</div>';

    var main = document.querySelector('.quiz-main');
    if (!reducedMotion()) {
      main.classList.remove('q-anim');
      void main.offsetWidth;
      main.classList.add('q-anim');
    }
  }

  function selectOption(idx, key) {
    state.answers[idx] = key;
    renderQuiz();
  }

  function prevQuestion() {
    if (state.qIndex > 0) { state.qIndex--; renderQuiz(); }
  }

  function nextQuestion() {
    if (state.qIndex === 9) { runDiagnostic(); return; }
    state.qIndex++;
    renderQuiz();
  }

  function runDiagnostic() {
    showStage('scanning');
    var scanLinesEl = $('scanLines');
    scanLinesEl.innerHTML = '';
    var reduced = reducedMotion();
    if (reduced) {
      scanSteps.forEach(function (s) {
        var d = document.createElement('div');
        d.textContent = s;
        scanLinesEl.appendChild(d);
      });
      state.finishTimer = setTimeout(showResult, 250);
      return;
    }
    var i = 0;
    function tick() {
      var d = document.createElement('div');
      d.className = 'q-anim';
      d.textContent = scanSteps[i];
      scanLinesEl.appendChild(d);
      i++;
      if (i < scanSteps.length) state.scanTimer = setTimeout(tick, 550);
      else state.finishTimer = setTimeout(showResult, 750);
    }
    state.scanTimer = setTimeout(tick, 400);
  }

  function computeResults() {
    var score = 0, secure = 0, improvable = 0, dangerous = 0;
    var vulns = [];
    questions.forEach(function (q, idx) {
      var key = state.answers[idx];
      if (!key) return;
      var opt = q.options.filter(function (o) { return o.key === key; })[0];
      score += POINTS[opt.state];
      if (opt.state === 'segura') secure++;
      else if (opt.state === 'mejorable') { improvable++; vulns.push({ label: q.vulnLabel, sev: 1 }); }
      else { dangerous++; vulns.push({ label: q.vulnLabel, sev: 2 }); }
    });
    vulns.sort(function (a, b) { return b.sev - a.sev; });
    var seen = {}, topVulns = [];
    for (var i = 0; i < vulns.length && topVulns.length < 3; i++) {
      if (!seen[vulns[i].label]) { seen[vulns[i].label] = true; topVulns.push(vulns[i].label); }
    }
    var band;
    if (score >= 80) band = { tag: '[OK] SISTEMA ENDURECIDO', color: 'var(--green)', desc: 'Buena higiene digital. No eres invulnerable —nadie lo es—, pero al menos no estás dejando las llaves puestas por fuera.' };
    else if (score >= 55) band = { tag: '[WARNING] SUPERFICIE EXPUESTA', color: 'var(--amber)', desc: 'Hay defensas, pero también unas cuantas puertas esperando que alguien pruebe el picaporte.' };
    else band = { tag: '[CRITICAL] DEMASIADAS PUERTAS ABIERTAS', color: 'var(--red)', desc: 'No hace falta un atacante extraordinario. Con uno paciente podría bastar.' };
    return { score: score, secure: secure, improvable: improvable, dangerous: dangerous, topVulns: topVulns, band: band };
  }

  function showResult() {
    var r = computeResults();
    showStage('result');
    $('bandTag').textContent = r.band.tag;
    $('bandTag').style.color = r.band.color;
    $('bandDesc').textContent = r.band.desc;
    $('scoreFill').style.width = r.score + '%';
    $('scoreFill').style.background = r.band.color;
    $('secureCount').textContent = r.secure;
    $('improvableCount').textContent = r.improvable;
    $('dangerousCount').textContent = r.dangerous;

    var vulnsBlock = $('vulnsBlock');
    var recEl = $('recommendations');
    recEl.innerHTML = '';
    if (r.topVulns.length) {
      vulnsBlock.hidden = false;
      r.topVulns.forEach(function (label) {
        var div = document.createElement('div');
        div.className = 'rec-line';
        div.innerHTML = '<span class="bullet">▸</span><strong>' + label + ':</strong> ' + recMap[label];
        recEl.appendChild(div);
      });
    } else {
      vulnsBlock.hidden = true;
    }

    var body = $('stageResult');
    if (!reducedMotion()) {
      body.classList.remove('q-anim');
      void body.offsetWidth;
      body.classList.add('q-anim');
    }
  }

  function resetQuiz() {
    clearTimeout(state.scanTimer);
    clearTimeout(state.finishTimer);
    state.qIndex = 0;
    state.answers = new Array(10).fill(null);
    showStage('intro');
  }

  function startQuiz() {
    showStage('quiz');
    renderQuiz();
  }

  buildProgressBar();
  $('btnStart').addEventListener('click', startQuiz);
  $('btnPrev').addEventListener('click', prevQuestion);
  $('btnNext').addEventListener('click', nextQuestion);
  $('btnReset').addEventListener('click', resetQuiz);
})();
