// ---- Bulmaca Verileri ----
const clues = [
  {
    word: "ÖZŞEFKAT",
    clue: "Kendine karşı nazik ve anlayışlı olma.",
    positions: [ [2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[2,9] ],
    clueNum: 1
  },
  {
    word: "ŞEFKAT",
    clue: "Başkalarına karşı duyulan içten merhamet.",
    positions: [ [2,4],[3,4],[4,4],[5,4],[6,4],[7,4] ],
    clueNum: 2
  },
  {
    word: "FARKINDALIK",
    clue: "Duygu, düşünce ve davranışların bilincinde olma.",
    positions: [ [2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],[12,6] ],
    clueNum: 3
  },
  {
    word: "TRAVMA",
    clue: "Zihinsel ve duygusal açıdan sarsıcı olay.",
    positions: [ [2,9],[3,9],[4,9],[5,9],[6,9],[7,9] ],
    clueNum: 4
  },
  {
    word: "MUTLULUK",
    clue: "Sevinç ve memnuniyet duygusu.",
    positions: [ [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[6,15],[6,16] ],
    clueNum: 5
  },
  {
    word: "UMUT",
    clue: "İyi bir şey olacağına dair inanç.",
    positions: [ [6,15],[7,15],[8,15],[9,15] ],
    clueNum: 6
  },
  {
    word: "KAYGI",
    clue: "Geleceğe dair endişe, huzursuzluk.",
    positions: [ [6,16],[6,17],[6,18],[6,19],[6,20] ],
    clueNum: 7
  },
  {
    word: "KARARLILIK",
    clue: "Bir işi başarmak için azimli olma durumu.",
    positions: [ [6,16],[7,16],[8,16],[9,16],[10,16],[11,16],[12,16],[13,16],[14,16],[15,16] ],
    clueNum: 8
  },
  {
    word: "YALNIZLIK",
    clue: "Kendi başına olma durumu.",
    positions: [ [11,14],[11,15],[11,16],[11,17],[11,18],[11,19],[11,20],[11,21],[11,22] ],
    clueNum: 9
  },
  {
    word: "KABUL",
    clue: "Kendini ve başkalarını olduğu gibi benimseme.",
    positions: [ [11,22],[12,22],[13,22],[14,22],[15,22] ],
    clueNum: 10
  }
];

// ---- Grid Ayarları ----
function getGridBounds() {
  let minR = Infinity, maxR = -1, minC = Infinity, maxC = -1;
  clues.forEach(clue => {
    clue.positions.forEach(([r, c]) => {
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    });
  });
  return { minR, maxR, minC, maxC };
}

const ROWS = 30, COLS = 30;
let solved = clues.map(_=>false);
let tried = clues.map(_=>false);
let selectedClue = null;
let inputLocked = false;

const puzzleDiv = document.getElementById('puzzle');
const clueDiv = document.getElementById('clue');
const answerInput = document.getElementById('answer-input');
const feedbackDiv = document.getElementById('feedback');
const resultDiv = document.getElementById('result');

let cellMap = Array.from({length:ROWS},()=>Array(COLS).fill(null));
let blackCells = Array.from({length:ROWS},()=>Array(COLS).fill(true));
let clueNums = Array.from({length:ROWS},()=>Array(COLS).fill(""));

function genGridData() {
  clues.forEach((clue,ci) => {
    clue.positions.forEach((pos,i) => {
      let [r,c] = pos;
      if (!cellMap[r][c]) cellMap[r][c] = [];
      cellMap[r][c].push({clueIndex:ci, letterIndex:i});
      blackCells[r][c] = false;
    });
    let [r,c]=clue.positions[0];
    if (!clueNums[r][c]) clueNums[r][c]="";
    if (clueNums[r][c]==="") clueNums[r][c]=clue.clueNum;
  });
}

// ---- Grid Çizimi ----
function renderGrid() {
  const { minR, maxR, minC, maxC } = getGridBounds();
  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  puzzleDiv.innerHTML = "";
  puzzleDiv.style.gridTemplateColumns = `repeat(${cols}, 26px)`;
  puzzleDiv.style.gridTemplateRows = `repeat(${rows}, 26px)`;
  for(let r = minR; r <= maxR; r++) {
    for(let c = minC; c <= maxC; c++) {
      const cell = document.createElement('div');
      cell.className = "cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      if (blackCells[r][c]) {
        cell.classList.add('black');
      } else {
        cell.onclick = () => selectCell(r, c);
        if (clueNums[r][c]) {
          const numSpan = document.createElement('span');
          numSpan.className = "cell-clue-num";
          numSpan.innerText = clueNums[r][c];
          cell.appendChild(numSpan);
        }
        cell.innerText += getSolvedLetter(r, c);
      }
      cell.id = `cell-${r}-${c}`;
      puzzleDiv.appendChild(cell);
    }
  }
}

function getSolvedLetter(r,c) {
  if (!cellMap[r][c]) return "";
  for (const entry of cellMap[r][c]) {
    if (solved[entry.clueIndex]) {
      return clues[entry.clueIndex].word[entry.letterIndex];
    }
  }
  return "";
}

function selectCell(r,c) {
  if (inputLocked || blackCells[r][c]) return;
  let found = null;
  for (const entry of cellMap[r][c]) {
    if (!solved[entry.clueIndex]) {
      found = entry.clueIndex;
      break;
    }
  }
  if (found === null) return;
  selectClue(found);
}

function selectClue(idx) {
  if (inputLocked) return;
  selectedClue = idx;
  clueDiv.innerText = clues[idx].clue;
  feedbackDiv.innerText = "";
  answerInput.value = "";
  answerInput.style.display = "inline-block";
  answerInput.maxLength = clues[idx].word.length;
  answerInput.disabled = false;
  Array.from(puzzleDiv.children).forEach(cell=>{
    let r = Number(cell.dataset.r), c = Number(cell.dataset.c);
    cell.classList.remove('selected');
    cell.classList.remove('solved');
    if (clues[idx].positions.some(([rr,cc])=>rr===r&&cc===c)) {
      if (solved[idx]) cell.classList.add('solved');
      else cell.classList.add('selected');
    }
    cell.innerText = "";
    if (!blackCells[r][c]) {
      if (clueNums[r][c]) {
        const numSpan = document.createElement('span');
        numSpan.className = "cell-clue-num";
        numSpan.innerText = clueNums[r][c];
        cell.appendChild(numSpan);
      }
      cell.innerText += getSolvedLetter(r,c);
    }
  });
  answerInput.focus();
}

function checkAnswer() {
  if (inputLocked || selectedClue === null) return;
  const guess = answerInput.value.trim().toUpperCase();
  tried[selectedClue] = true;
  if (guess === clues[selectedClue].word.toUpperCase()) {
    feedbackDiv.style.color = "#2e7d32";
    feedbackDiv.innerText = "Doğru! 🎉";
    solved[selectedClue] = true;
    fillWord(selectedClue);
    answerInput.disabled = true;
    setTimeout(()=>{
      if (solved.every(v=>v)) {
        finishPuzzle();
      } else {
        let next = solved.findIndex((v,i)=>!v && i!==selectedClue);
        if (next!==-1) selectClue(next);
      }
    }, 900);
  } else {
    feedbackDiv.style.color = "#c62828";
    feedbackDiv.innerText = "Yanlış! Tekrar dene.";
  }
}

function fillWord(idx) {
  clues[idx].positions.forEach(([r,c],i)=>{
    let cell = document.getElementById(`cell-${r}-${c}`);
    cell.innerText = clues[idx].word[i];
    cell.classList.add('solved');
    cell.classList.remove('selected');
    if (clueNums[r][c]) {
      const numSpan = document.createElement('span');
      numSpan.className = "cell-clue-num";
      numSpan.innerText = clueNums[r][c];
      cell.appendChild(numSpan);
    }
  });
}

function finishPuzzle() {
  inputLocked = true;
  clueDiv.innerText = "";
  answerInput.style.display = "none";
  feedbackDiv.innerText = "";
  Array.from(puzzleDiv.children).forEach(cell=>{
    if(cell.classList.contains('solved')) {
      cell.style.background = "#43a047";
      cell.style.color = "#fff";
      cell.style.border = "2px solid #2e7d32";
    }
  });
  resultDiv.innerHTML = `Tebrikler! Tüm kelimeleri buldun.<br>
    Doğru sayısı: <strong>${solved.filter(Boolean).length} / ${clues.length}</strong>`;

  // --- GOOGLE SHEETS'E SONUÇ YOLLA ---
  const sonuc = {};
  clues.forEach((clue, i) => {
    if (solved[i]) {
      sonuc[clue.word] = "doğru";
    } else if (tried[i]) {
      sonuc[clue.word] = "yanlış";
    } else {
      sonuc[clue.word] = "boş";
    }
  });

  // Öğrenci adı/id'si varsa ekle
  const ogrenciAdi = window.localStorage.getItem("kullanici_adi") || "";

  // *** YENİ PROXY ÜZERİNDEN GÖNDERİYORUZ ***
  fetch("https://separated-noiseless-juice.glitch.me/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ogrenci: ogrenciAdi,
      sonuc: sonuc
    })
  })
  .then(response => response.text())
  .then(data => {
    console.log("Sonuç başarıyla gönderildi:", data);
  })
  .catch(err => {
    console.error("Hata oluştu:", err);
  });
}

// --- Event Listener ---
answerInput.addEventListener('keyup', function(e){
  if (e.key === "Enter") {
    checkAnswer();
  }
});

// --- Başlat ---
genGridData();
renderGrid();
selectClue(0);