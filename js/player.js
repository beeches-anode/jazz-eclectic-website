(function () {
  const audio = document.getElementById("player");
  const rows = Array.from(document.querySelectorAll("#tracklist li"));
  if (!audio || rows.length === 0) return;

  let current = null; // the row currently loaded

  function fmt(s) {
    if (!isFinite(s)) return "";
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ":" + String(r).padStart(2, "0");
  }

  function setPlaying(row, playing) {
    row.classList.toggle("playing", playing);
    row.querySelector(".num").textContent = playing ? "❚❚" : row.dataset.num;
    row.setAttribute("aria-pressed", playing ? "true" : "false");
  }

  function reset(row) {
    if (!row) return;
    setPlaying(row, false);
    row.querySelector(".progress").style.width = "0";
    row.querySelector(".time").textContent = row.dataset.time;
  }

  rows.forEach(function (row) {
    row.dataset.num = row.querySelector(".num").textContent;   // remember "01"…"07"
    row.dataset.time = row.querySelector(".time").textContent; // remember "4:45"…

    function toggle() {
      if (current === row && !audio.paused) { audio.pause(); return; }
      if (current !== row) {
        reset(current);
        current = row;
        audio.src = row.dataset.src;
      }
      audio.play();
    }

    row.addEventListener("click", toggle);
    row.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });

  audio.addEventListener("play",  function () { if (current) setPlaying(current, true); });
  audio.addEventListener("pause", function () { if (current) setPlaying(current, false); });
  audio.addEventListener("timeupdate", function () {
    if (!current || !isFinite(audio.duration)) return;
    current.querySelector(".progress").style.width = (audio.currentTime / audio.duration * 100) + "%";
    current.querySelector(".time").textContent = "-" + fmt(audio.duration - audio.currentTime);
  });
  audio.addEventListener("ended", function () {
    const next = rows[rows.indexOf(current) + 1];
    reset(current); current = null;
    if (next) { current = next; audio.src = next.dataset.src; audio.play(); } // roll into next track, Side A style
  });
})();
