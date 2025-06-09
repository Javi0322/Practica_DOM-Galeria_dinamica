const container = document.getElementById('vehicle-result')
const verMasBtn = document.getElementById('ver-mas')
const cochesPorPagina = 12
let paginaActual = 0
let totalCoches = []
let cochesAMostrarGlobal = []

function crearHTMLCoche(coche) {
  return `
    <div class="vehicle-result-1">
      <div class="vehicle-result-1-img img-1" style="background-image: url('${coche.foto}');">
        <div class="vehicle-result-1-img-options">
          <img src="./assets/images/favoritos.png" alt="favorito" />
          <img src="./assets/images/comparativa.png" alt="comparar" />
        </div>
        <div class="vehicle-result-1-img-arrow">
          <img src="./assets/images/flecha_izq.png" alt="flecha_izq" />
          <img src="./assets/images/flecha_der.png" alt="flecha_der" />
        </div>
        <div class="vehicle-result-1-img-distinctive">
          <img src="./assets/images/etiqueta_c.png" alt="etiqueta ambiental" />
        </div>
      </div>
      <div class="vehicle-result-1-data">
        <div class="vehicle-result-1-data-header">
          <a href="${coche.url}">
            <h2>${coche.marcaModelo}</h2>
            <p>${coche.version}</p>
          </a>
        </div>
        <div class="vehicle-result-1-data-data">
          <ul>
            <li><p>${coche.km}</p></li>
            <li><p>${coche.año}</p></li>
            <li><p>${coche.combustible}</p></li>
            <li><p>${coche.potencia}</p></li>
            <li><p>${coche.cambio}</p></li>
          </ul>
          <div>
            <p>Precio contado</p>
            <p><strong>${coche.precio}</strong></p>
          </div>
        </div>
      </div>
      <div class="vehicle-result-1-contact">
        <div class="vehicle-result-1-contact-contact">
          <a href="#">Contactar</a>
        </div>
        <div class="vehicle-result-1-contact-phone">
          <a href="#">Ver teléfono</a>
        </div>
      </div>
    </div>
  `
}

function renderizarCoches() {
  const origen = cochesAMostrarGlobal.length
    ? cochesAMostrarGlobal
    : totalCoches
  const inicio = paginaActual * cochesPorPagina
  const fin = inicio + cochesPorPagina
  const cochesAMostrar = origen.slice(inicio, fin)

  if (paginaActual === 0) container.innerHTML = ''

  cochesAMostrar.forEach((coche) => {
    container.insertAdjacentHTML('beforeend', crearHTMLCoche(coche))
  })

  paginaActual++

  document.getElementById('vehicle-count').textContent = origen.length
  document.getElementById('vehicle-count2').textContent = Math.min(
    fin,
    origen.length
  )
  document.getElementById('vehicle-count3').textContent = 'de ' + origen.length

  verMasBtn.style.display = fin < origen.length ? 'block' : 'none'
}

fetch('./stock1.xml')
  .then((response) => response.text())
  .then((str) => {
    const parser = new DOMParser()
    const xml = parser.parseFromString(str, 'application/xml')
    const vehiculos = xml.getElementsByTagName('anuncio')

    for (let i = 0; i < vehiculos.length; i++) {
      const v = vehiculos[i]
      const marca = v.getElementsByTagName('marca')[0]?.textContent ?? ''
      const modelo = v.getElementsByTagName('modelo')[0]?.textContent ?? ''
      const kmRaw = v.getElementsByTagName('kilometros')[0]?.textContent ?? '0'
      const kmNum = parseInt(kmRaw.replace(/\D/g, '')) || 0
      const potenciaNum =
        parseInt(v.getElementsByTagName('potencia')[0]?.textContent) || 0
      const precioNum =
        parseInt(v.getElementsByTagName('precio')[0]?.textContent) || 0
      const añoNum =
        v
          .getElementsByTagName('fechaMatriculacion')[0]
          ?.textContent.trim()
          .split('/')
          .pop()
          .trim() ?? ''
      const carroceriaRaw =
        v.getElementsByTagName('carroceria')[0]?.textContent ?? ''
      const carroceria = carroceriaRaw.toLowerCase().replace(/[\/\s]+/g, '-')
      const motorflashID =
        v.getElementsByTagName('motorflashID')[0]?.textContent ?? '0'

      totalCoches.push({
        marcaModelo: `${marca} ${modelo}`,
        marca: marca,
        modelo: modelo,
        version: v.getElementsByTagName('version')[0]?.textContent ?? '',
        km: `${kmNum.toLocaleString('es-ES')} KM`,
        kmNum,
        año: añoNum.toString(),
        añoNum,
        combustible:
          v.getElementsByTagName('combustible')[0]?.textContent ?? '',
        potencia: `${potenciaNum} CV`,
        potenciaNum,
        cambio: v.getElementsByTagName('cambio')[0]?.textContent ?? '',
        precio: isNaN(precioNum)
          ? 'Consultar'
          : `${precioNum.toLocaleString('es-ES')} €`,
        precioNum,
        color: (
          v.getElementsByTagName('color')[0]?.textContent ?? ''
        ).toLowerCase(),
        puertas: v.getElementsByTagName('puertas')[0]?.textContent ?? '',
        distintivo: v.getElementsByTagName('distintivo')[0]?.textContent ?? '',
        carroceria,
        url: `https://www.bymycar.madrid/ficha-vehiculo-ocasion/${carroceria}/${motorflashID}`,
        foto: v.getElementsByTagName('foto')[0]?.textContent ?? ''
      })
    }

    cochesAMostrarGlobal = [...totalCoches]
    renderizarCoches()
    rellenarFiltrosDinamicos(totalCoches)
  })

verMasBtn.addEventListener('click', renderizarCoches)

function rellenarFiltrosDinamicos(coches) {
  const marcaSelect = document.getElementById('marcaListado')
  const modeloSelect = document.getElementById('modeloListado')
  const carroceriaSelect = document.getElementById('carroceriaListado')
  const colorSelect = document.getElementById('colorListado')

  const marcasModelos = {}
  const carrocerias = new Set()
  const colores = new Set()
  const cambios = new Set()
  const combustibles = new Set()
  const puertas = new Set()
  const distintivos = new Set()

  coches.forEach((coche) => {
    const marca = coche.marca?.trim()
    const modelo = coche.modelo?.trim()

    if (!marcasModelos[marca]) marcasModelos[marca] = new Set()
    if (modelo) marcasModelos[marca].add(modelo)

    if (coche.carroceria) carrocerias.add(coche.carroceria)
    if (coche.color) colores.add(coche.color)
    if (coche.cambio) cambios.add(coche.cambio.toUpperCase())
    if (coche.combustible) combustibles.add(coche.combustible)
    if (coche.puertas) puertas.add(coche.puertas)
    if (coche.distintivo) distintivos.add(coche.distintivo)
  })

  marcaSelect.innerHTML = '<option value="-1">Marca</option>'
  Object.keys(marcasModelos)
    .sort()
    .forEach((marca) => {
      marcaSelect.innerHTML += `<option value="${marca}">${marca}</option>`
    })

  modeloSelect.innerHTML = '<option value="-1">Modelo</option>'
  Object.entries(marcasModelos)
    .sort()
    .forEach(([marca, modelos]) => {
      const optgroup = document.createElement('optgroup')
      optgroup.label = marca
      Array.from(modelos)
        .sort()
        .forEach((modelo) => {
          const opt = document.createElement('option')
          opt.value = modelo
          opt.textContent = modelo
          optgroup.appendChild(opt)
        })
      modeloSelect.appendChild(optgroup)
    })

  carroceriaSelect.innerHTML = '<option value="-1">Carrocería</option>'
  Array.from(carrocerias)
    .sort()
    .forEach((c) => {
      carroceriaSelect.innerHTML += `<option value="${c}">${c}</option>`
    })

  colorSelect.innerHTML = '<option value="-1">Color</option>'
  Array.from(colores)
    .sort()
    .forEach((c) => {
      colorSelect.innerHTML += `<option value="${c}">${c}</option>`
    })

  const cambioSelect = document.getElementById('cambio')
  cambioSelect.innerHTML = '<option value="-1">Cambio</option>'
  Array.from(cambios)
    .sort()
    .forEach((valor) => {
      cambioSelect.innerHTML += `<option value="${valor}">${valor}</option>`
    })

  const combustibleSelect = document.getElementById('combustibleListado')
  combustibleSelect.innerHTML = '<option value="-1">Selecciona</option>'
  Array.from(combustibles)
    .sort()
    .forEach((valor) => {
      combustibleSelect.innerHTML += `<option value="${valor}">${valor}</option>`
    })

  const puertasSelect = document.getElementById('puertas')
  puertasSelect.innerHTML = '<option value="-1">Selecciona</option>'
  Array.from(puertas)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((valor) => {
      puertasSelect.innerHTML += `<option value="${valor}">${valor}</option>`
    })

  const distintivoSelect = document.getElementById('distintivo')
  distintivoSelect.innerHTML = '<option value="-1">Selecciona</option>'
  Array.from(distintivos)
    .sort()
    .forEach((valor) => {
      distintivoSelect.innerHTML += `<option value="${valor}">${valor}</option>`
    })
}

document.getElementById('ordenar').addEventListener('change', function () {
  const valor = this.value
  ordenarCoches(valor)
  paginaActual = 0
  renderizarCoches()
})

function ordenarCoches(criterio) {
  switch (criterio) {
    case 'Precio Ascendente':
      cochesAMostrarGlobal.sort((a, b) => a.precioNum - b.precioNum)
      break
    case 'Precio Descendente':
      cochesAMostrarGlobal.sort((a, b) => b.precioNum - a.precioNum)
      break
    case 'Potencia Ascendente':
      cochesAMostrarGlobal.sort((a, b) => a.potenciaNum - b.potenciaNum)
      break
    case 'Potencia Descendente':
      cochesAMostrarGlobal.sort((a, b) => b.potenciaNum - a.potenciaNum)
      break
    default:
      break
  }
}

const marcaSelect = document.getElementById('marcaListado')
const modeloSelect = document.getElementById('modeloListado')

let cochesFiltrados = []

function actualizarOpcionesModelo(marcaSeleccionada) {
  modeloSelect.innerHTML = '<option value="-1">Modelo</option>'

  if (marcaSeleccionada === '-1') {
    const marcasModelos = {}
    totalCoches.forEach((coche) => {
      if (!marcasModelos[coche.marca]) marcasModelos[coche.marca] = new Set()
      marcasModelos[coche.marca].add(coche.modelo)
    })

    Object.entries(marcasModelos)
      .sort()
      .forEach(([marca, modelos]) => {
        const optgroup = document.createElement('optgroup')
        optgroup.label = marca
        Array.from(modelos)
          .sort()
          .forEach((modelo) => {
            const opt = document.createElement('option')
            opt.value = modelo
            opt.textContent = modelo
            optgroup.appendChild(opt)
          })
        modeloSelect.appendChild(optgroup)
      })
  } else {
    const modelosUnicos = new Set()
    totalCoches.forEach((coche) => {
      if (coche.marca === marcaSeleccionada) {
        modelosUnicos.add(coche.modelo)
      }
    })

    Array.from(modelosUnicos)
      .sort()
      .forEach((modelo) => {
        const opt = document.createElement('option')
        opt.value = modelo
        opt.textContent = modelo
        modeloSelect.appendChild(opt)
      })
  }
}

function filtrarCoches() {
  const marcaSeleccionada = marcaSelect.value
  const modeloSeleccionado = modeloSelect.value

  cochesAMostrarGlobal = totalCoches.filter((coche) => {
    const coincideMarca =
      marcaSeleccionada === '-1' || coche.marca === marcaSeleccionada
    const coincideModelo =
      modeloSeleccionado === '-1' || coche.modelo === modeloSeleccionado
    return coincideMarca && coincideModelo
  })

  paginaActual = 0
  renderizarCoches()
}

function renderizarFiltrados() {
  const origen = cochesFiltrados.length ? cochesFiltrados : totalCoches
  const inicio = paginaActual * cochesPorPagina
  const fin = inicio + cochesPorPagina
  const cochesAMostrar = origen.slice(inicio, fin)

  container.innerHTML = ''
  cochesAMostrar.forEach((coche) => {
    container.insertAdjacentHTML('beforeend', crearHTMLCoche(coche))
  })

  document.getElementById('vehicle-count').textContent = origen.length
  document.getElementById('vehicle-count2').textContent = Math.min(
    fin,
    origen.length
  )
  document.getElementById('vehicle-count3').textContent = 'de ' + origen.length

  verMasBtn.style.display = fin < origen.length ? 'block' : 'none'
}

marcaSelect.addEventListener('change', () => {
  actualizarOpcionesModelo(marcaSelect.value)
  modeloSelect.value = '-1'
  filtrarCoches()
})

modeloSelect.addEventListener('change', () => {
  const modeloSeleccionado = modeloSelect.value
  if (modeloSeleccionado !== '-1') {
    const cocheConModelo = totalCoches.find(
      (coche) => coche.modelo === modeloSeleccionado
    )
    if (cocheConModelo) {
      marcaSelect.value = cocheConModelo.marca
      actualizarOpcionesModelo(cocheConModelo.marca)
      modeloSelect.value = modeloSeleccionado
    }
  }
  filtrarCoches()
})
