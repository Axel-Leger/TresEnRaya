
    let modelo;
    let tablero = tf.zeros([9]);

    const tableroHTML = document.getElementById("tablero");

    async function cargarModelo() {
      modelo = await tf.loadLayersModel('./model.json');
      crearTableroHTML();
      actualizarTablero();
    }

    function crearTableroHTML() {
      tableroHTML.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        const celda = document.createElement("div");
        celda.className = "celda";
        celda.dataset.index = i;
        celda.addEventListener("click", () => jugarTurnoHumano(i));
        tableroHTML.appendChild(celda);
      }
    }

    function simbolo(valor) {
      if (valor === -1) return 'X';
      if (valor === 1) return 'O';
      return '';
    }

    async function jugarTurnoHumano(pos) {
      const estado = await tablero.data();
      if (estado[pos] !== 0) return; // celda ocupada

      // Poner X
      const actualizado = estado.slice();
      actualizado[pos] = -1;
      tablero = tf.tensor1d(actualizado);

      actualizarTablero();

      if (verificarGanador(actualizado)) return;

      await turnoIA();
    }

    async function turnoIA() {
      const prediccion = modelo.predict(tablero.reshape([1, 9]));
      const salida = await prediccion.data();
      const estado = await tablero.data();

      let mejorIndice = -1;
      let mejorValor = -Infinity;

      for (let i = 0; i < 9; i++) {
        if (estado[i] === 0 && salida[i] > mejorValor) {
          mejorValor = salida[i];
          mejorIndice = i;
        }
      }

      if (mejorIndice !== -1) {
        estado[mejorIndice] = 1;
        tablero = tf.tensor1d(estado);
        actualizarTablero();

        verificarGanador(estado);
      }
    }

    function actualizarTablero() {
      tablero.data().then(datos => {
        const celdas = tableroHTML.children;
        for (let i = 0; i < 9; i++) {
          celdas[i].textContent = simbolo(datos[i]);
        }
      });
    }

    function verificarGanador(estado) {
      const lineas = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];
      for (const [a,b,c] of lineas) {
        const suma = estado[a] + estado[b] + estado[c];
        if (suma === -3) {
          alert("¡Ganaste!");
          return true;
        }
        if (suma === 3) {
          alert("Perdiste");
          return true;
        }
      }

      if (!estado.includes(0)) {
        alert("Empate.");
        return true;
      }

      return false;
    }

    cargarModelo();