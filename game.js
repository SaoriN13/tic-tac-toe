// Tic-Tac-Toe con IA Minimax
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');

let state = ["","","","","","","","",""];
let human = 'X', ai = 'O';
let gameOver = false;

function render(){
  boardEl.innerHTML = '';
  state.forEach((cell, idx) => {
    const div = document.createElement('div');
    div.className = 'cell' + (cell ? ' disabled' : '');
    div.textContent = cell;
    div.addEventListener('click', ()=> onCellClick(idx));
    boardEl.appendChild(div);
  });
  const t = checkWinner(state);
  if(t){
    gameOver = true;
    if(t.winner === 'draw') statusEl.textContent = 'Empate.';
    else statusEl.textContent = (t.winner === human ? '¡Ganaste!' : 'La IA gana.');
    Array.from(boardEl.children).forEach(c=>c.classList.add('disabled'));
  } else {
    statusEl.textContent = 'Tu turno (X)';
  }
}

function onCellClick(idx){
  if(gameOver || state[idx]) return;
  state[idx] = human;
  render();
  const t = checkWinner(state);
  if(t) return;
  setTimeout(()=> {
    const mv = bestMove(state.slice(), ai);
    if(mv !== -1) state[mv] = ai;
    render();
  }, 200);
}

function checkWinner(s){
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for(const l of lines){
    const [a,b,c]=l;
    if(s[a] && s[a]===s[b] && s[a]===s[c]) return {winner: s[a]};
  }
  if(s.every(c=>c)) return {winner:'draw'};
  return null;
}

function bestMove(s, player){
  const avail = s.reduce((acc, val, i)=> { if(!val) acc.push(i); return acc; }, []);
  if(avail.length === 0) return -1;
  let bestScore = (player === ai) ? -Infinity : Infinity;
  let move = -1;
  for(const i of avail){
    s[i] = player;
    const score = minimax(s, 0, player === human ? ai : human);
    s[i] = "";
    if(player === ai){
      if(score > bestScore){ bestScore = score; move = i;}
    } else {
      if(score < bestScore){ bestScore = score; move = i;}
    }
  }
  return move;
}

function minimax(s, depth, player){
  const result = checkWinner(s);
  if(result){
    if(result.winner === ai) return 10 - depth;
    if(result.winner === human) return depth - 10;
    if(result.winner === 'draw') return 0;
  }
  const avail = s.reduce((acc, val, i)=> { if(!val) acc.push(i); return acc; }, []);
  if(player === ai){
    let maxEval = -Infinity;
    for(const i of avail){
      s[i] = ai;
      const evalScore = minimax(s, depth+1, human);
      s[i] = "";
      maxEval = Math.max(maxEval, evalScore);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for(const i of avail){
      s[i] = human;
      const evalScore = minimax(s, depth+1, ai);
      s[i] = "";
      minEval = Math.min(minEval, evalScore);
    }
    return minEval;
  }
}

resetBtn.addEventListener('click', ()=>{
  state = ["","","","","","","","",""];
  gameOver = false;
  render();
});

render();
