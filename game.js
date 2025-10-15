document.addEventListener("DOMContentLoaded", () => {
  const boardDiv = document.getElementById("board");
  const reiniciarBtn = document.getElementById("reiniciar");

  const piezasUnicode = {
    'r':'♜','n':'♞','b':'♝','q':'♛','k':'♚','p':'♟',
    'R':'♖','N':'♘','B':'♗','Q':'♕','K':'♔','P':'♙'
  };

  let board = [];
  let turno = 'w';
  let selected = null;

  // Posición inicial
  function iniciarTablero() {
    board = [
      ['r','n','b','q','k','b','n','r'],
      ['p','p','p','p','p','p','p','p'],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['P','P','P','P','P','P','P','P'],
      ['R','N','B','Q','K','B','N','R']
    ];
    turno = 'w';
    selected = null;
    dibujarTablero();
  }

  function dibujarTablero() {
    boardDiv.innerHTML = '';
    for(let i=0;i<8;i++){
      for(let j=0;j<8;j++){
        const square = document.createElement('div');
        square.classList.add('square');
        square.classList.add((i+j)%2===0?'white':'black');
        square.dataset.row = i;
        square.dataset.col = j;
        square.innerText = piezasUnicode[board[i][j]] || '';
        if(selected && selected.row===i && selected.col===j){
          square.classList.add('selected');
        }
        square.addEventListener('click', onClickSquare);
        boardDiv.appendChild(square);
      }
    }
  }

  // Movimiento válido básico
  function esMovimientoValido(r1,c1,r2,c2){
    const pieza = board[r1][c1];
    if(!pieza) return false;
    const target = board[r2][c2];

    // No capturar pieza propia
    if(target && ((pieza === pieza.toUpperCase() && target === target.toUpperCase()) ||
                  (pieza === pieza.toLowerCase() && target === target.toLowerCase()))) return false;

    // Movimientos básicos por tipo de pieza
    const dr = r2 - r1;
    const dc = c2 - c1;

    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    switch(pieza.toLowerCase()){
      case 'p': // peón
        const dir = (pieza==='P')?-1:1;
        if(dc===0 && dr===dir && !target) return true;
        if(dc===0 && dr===2*dir && ((pieza==='P'&&r1===6)||(pieza==='p'&&r1===1)) && !target && !board[r1+dir][c1]) return true;
        if(absDc===1 && dr===dir && target) return true;
        return false;
      case 'r': return (dr===0 || dc===0) && esCaminoLibre(r1,c1,r2,c2);
      case 'b': return absDr===absDc && esCaminoLibre(r1,c1,r2,c2);
      case 'q': return (dr===0 || dc===0 || absDr===absDc) && esCaminoLibre(r1,c1,r2,c2);
      case 'k': return absDr<=1 && absDc<=1;
      case 'n': return (absDr===2 && absDc===1) || (absDr===1 && absDc===2);
    }
    return false;
  }

  function esCaminoLibre(r1,c1,r2,c2){
    const dr = Math.sign(r2-r1);
    const dc = Math.sign(c2-c1);
    let r=r1+dr, c=c1+dc;
    while(r!==r2 || c!==c2){
      if(board[r][c]!=='') return false;
      r+=dr; c+=dc;
    }
    return true;
  }

  function mover(r1,c1,r2,c2){
    if(!esMovimientoValido(r1,c1,r2,c2)) return false;
    const pieza = board[r1][c1];
    board[r2][c2] = pieza;
    board[r1][c1] = '';

    // Promoción simple
    if(pieza==='P' && r2===0) board[r2][c2]='Q';
    if(pieza==='p' && r2===7) board[r2][c2]='q';

    return true;
  }

  function verificarJaqueMate(color){
    let reyExiste = false;
    const rey = color==='w'?'K':'k';
    for(let i=0;i<8;i++){
      for(let j=0;j<8;j++){
        if(board[i][j]===rey) reyExiste=true;
      }
    }
    return !reyExiste;
  }

  function onClickSquare(e){
    const row = parseInt(this.dataset.row);
    const col = parseInt(this.dataset.col);
    const pieza = board[row][col];

    if(selected){
      if(mover(selected.row,selected.col,row,col)){
        selected=null;
        turno = turno==='w'?'b':'w';
        dibujarTablero();
        if(verificarJaqueMate(turno)){
          alert(turno==='w'?'¡Ganan negras!':'¡Ganan blancas!');
          return;
        }
        if(turno==='b') setTimeout(turnoIA,300);
      } else {
        selected=null;
        dibujarTablero();
      }
    } else {
      if(pieza && ((turno==='w' && pieza===pieza.toUpperCase()) || (turno==='b' && pieza===pieza.toLowerCase()))){
        selected={row,col};
        dibujarTablero();
      }
    }
  }

  // IA básica: movimiento aleatorio legal
  function turnoIA(){
    const piezasIA = [];
    for(let i=0;i<8;i++){
      for(let j=0;j<8;j++){
        const p=board[i][j];
        if(p && p===p.toLowerCase()) piezasIA.push({row:i,col:j});
      }
    }

    let movido=false;
    while(!movido && piezasIA.length){
      const idx = Math.floor(Math.random()*piezasIA.length);
      const pieza=piezasIA[idx];
      const posibles=[];
      for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){
          if(esMovimientoValido(pieza.row,pieza.col,r,c)) posibles.push({r,c});
        }
      }
      if(posibles.length){
        const mv=posibles[Math.floor(Math.random()*posibles.length)];
        mover(pieza.row,pieza.col,mv.r,mv.c);
        movido=true;
      } else {
        piezasIA.splice(idx,1);
      }
    }
    turno='w';
    dibujarTablero();
    if(verificarJaqueMate(turno)){
      alert('¡Ganan negras!');
    }
  }

  reiniciarBtn.addEventListener('click',iniciarTablero);
  iniciarTablero();
});
