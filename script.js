const STORAGE_KEY = "luxe_income_data";

let incomes = JSON.parse(
  localStorage.getItem(STORAGE_KEY) || "[]"
);


// ==========================
// ELEMENT
// ==========================

const $ = (id) =>
  document.getElementById(id);


const totalIncome =
  $("totalIncome");

const monthIncome =
  $("monthIncome");

const largestIncome =
  $("largestIncome");

const transactionCount =
  $("transactionCount");

const incomeList =
  $("incomeList");

const emptyState =
  $("emptyState");

const chart =
  $("chart");

const modal =
  $("modal");

const incomeForm =
  $("incomeForm");

const amountInput =
  $("amount");

const sourceInput =
  $("source");

const dateInput =
  $("date");

const noteInput =
  $("note");


// ==========================
// FORMAT RUPIAH
// ==========================

function formatRupiah(value) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(value);

}


// ==========================
// FORMAT TANGGAL
// ==========================

function formatDate(dateString) {

  const date =
    new Date(
      dateString + "T00:00:00"
    );

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  ).format(date);

}


// ==========================
// SIMPAN DATA
// ==========================

function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(incomes)
  );

}


// ==========================
// FORMAT NOMINAL SAAT DIKETIK
// ==========================

amountInput.addEventListener(
  "input",
  () => {

    let angka =
      amountInput.value
        .replace(/\D/g, "");

    if (!angka) {

      amountInput.value = "";

      return;

    }


    amountInput.value =
      Number(angka)
        .toLocaleString("id-ID");

  }
);


// ==========================
// RENDER DASHBOARD
// ==========================

function render() {

  const total =
    incomes.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );


  const now =
    new Date();

  const currentMonth =
    now.getMonth();

  const currentYear =
    now.getFullYear();


  const monthTotal =
    incomes
      .filter(item => {

        const d =
          new Date(
            item.date +
            "T00:00:00"
          );

        return (
          d.getMonth() ===
            currentMonth
          &&
          d.getFullYear() ===
            currentYear
        );

      })
      .reduce(
        (sum, item) =>
          sum + item.amount,
        0
      );


  const biggest =
    incomes.length
      ? Math.max(
          ...incomes.map(
            item =>
              item.amount
          )
        )
      : 0;


  totalIncome.textContent =
    formatRupiah(total);

  monthIncome.textContent =
    formatRupiah(monthTotal);

  largestIncome.textContent =
    formatRupiah(biggest);

  transactionCount.textContent =
    incomes.length;


  renderList();

  renderChart();

}


// ==========================
// RIWAYAT
// ==========================

function renderList() {

  incomeList.innerHTML = "";


  if (
    incomes.length === 0
  ) {

    emptyState.style.display =
      "block";

    return;

  }


  emptyState.style.display =
    "none";


  const sorted =
    [...incomes].sort(
      (a, b) => {

        return (
          new Date(b.date) -
          new Date(a.date)
          ||
          b.id - a.id
        );

      }
    );


  sorted.forEach(item => {

    const row =
      document.createElement(
        "div"
      );


    row.className =
      "income-item";


    row.innerHTML = `

      <div class="income-symbol">
        ↗
      </div>

      <div class="income-info">

        <strong>
          ${escapeHTML(
            item.source
          )}
        </strong>

        <span>

          ${formatDate(
            item.date
          )}

          ${
            item.note
              ? " • " +
                escapeHTML(
                  item.note
                )
              : ""
          }

        </span>

      </div>

      <div class="income-right">

        <div class="income-amount">

          +${formatRupiah(
            item.amount
          )}

        </div>

        <button
          class="delete-btn"
          data-id="${item.id}">

          Hapus

        </button>

      </div>

    `;


    row
      .querySelector(
        ".delete-btn"
      )
      .addEventListener(
        "click",
        () => {

          deleteIncome(
            item.id
          );

        }
      );


    incomeList.appendChild(
      row
    );

  });

}


// ==========================
// GRAFIK
// ==========================

function renderChart() {

  chart.innerHTML = "";


  const sorted =
    [...incomes]
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
          ||
          a.id - b.id
      )
      .slice(-7);


  if (
    sorted.length === 0
  ) {

    for (
      let i = 0;
      i < 7;
      i++
    ) {

      const wrap =
        document.createElement(
          "div"
        );

      wrap.className =
        "bar-wrap";


      wrap.innerHTML = `

        <div
          class="bar"
          style="height:5%">
        </div>

        <small>—</small>

      `;


      chart.appendChild(
        wrap
      );

    }

    return;

  }


  const max =
    Math.max(
      ...sorted.map(
        item =>
          item.amount
      ),
      1
    );


  sorted.forEach(item => {

    const wrap =
      document.createElement(
        "div"
      );


    wrap.className =
      "bar-wrap";


    const height =
      Math.max(
        (
          item.amount /
          max
        ) * 100,
        8
      );


    const day =
      new Date(
        item.date +
        "T00:00:00"
      ).getDate();


    wrap.innerHTML = `

      <div
        class="bar"
        style="height:${height}%">
      </div>

      <small>
        ${day}
      </small>

    `;


    chart.appendChild(
      wrap
    );

  });

}


// ==========================
// HAPUS SATU DATA
// ==========================

function deleteIncome(id) {

  const item =
    incomes.find(
      x => x.id === id
    );


  if (!item) return;


  const yakin =
    confirm(
      `Hapus pemasukan "${item.source}"?`
    );


  if (!yakin) return;


  incomes =
    incomes.filter(
      x => x.id !== id
    );


  saveData();

  render();

}


// ==========================
// AMANKAN TEKS
// ==========================

function escapeHTML(text) {

  return String(text)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


// ==========================
// BUKA FORM
// ==========================

$("openModalBtn")
  .addEventListener(
    "click",
    () => {

      modal.classList.add(
        "show"
      );


      dateInput.value =
        new Date()
          .toISOString()
          .split("T")[0];


      setTimeout(
        () => {

          amountInput.focus();

        },
        150
      );

    }
  );


// ==========================
// TUTUP FORM
// ==========================

$("closeModalBtn")
  .addEventListener(
    "click",
    () => {

      modal.classList.remove(
        "show"
      );

    }
  );


// ==========================
// KLIK LUAR MODAL
// ==========================

modal.addEventListener(
  "click",
  event => {

    if (
      event.target === modal
    ) {

      modal.classList.remove(
        "show"
      );

    }

  }
);


// ==========================
// SIMPAN PEMASUKAN
// ==========================

incomeForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const amount =
      Number(
        amountInput.value
          .replace(/\./g, "")
          .replace(/,/g, "")
      );


    const source =
      sourceInput.value.trim();


    const date =
      dateInput.value;


    const note =
      noteInput.value.trim();


    if (
      !amount ||
      amount <= 0 ||
      !source ||
      !date
    ) {

      return;

    }


    incomes.push({

      id: Date.now(),

      amount,

      source,

      date,

      note

    });


    saveData();

    render();


    incomeForm.reset();


    modal.classList.remove(
      "show"
    );


    setTimeout(
      () => {

        totalIncome.animate(

          [
            {
              transform:
                "scale(1)"
            },

            {
              transform:
                "scale(1.05)"
            },

            {
              transform:
                "scale(1)"
            }

          ],

          {
            duration: 350
          }

        );

      },
      50
    );

  }
);


// ==========================
// HAPUS SEMUA
// ==========================

$("clearAllBtn")
  .addEventListener(
    "click",
    () => {

      if (
        !incomes.length
      ) {

        alert(
          "Belum ada data pemasukan."
        );

        return;

      }


      const yakin =
        confirm(
          "Yakin mau menghapus SEMUA data pemasukan?"
        );


      if (yakin) {

        incomes = [];

        saveData();

        render();

      }

    }
  );


// ==========================
// SAPAAN
// ==========================

function updateGreeting() {

  const hour =
    new Date().getHours();


  let greeting =
    "Good morning";


  if (
    hour >= 12 &&
    hour < 18
  ) {

    greeting =
      "Good afternoon";

  }


  if (
    hour >= 18
  ) {

    greeting =
      "Good evening";

  }


  $("greeting")
    .textContent =
    `${greeting}, Fharel`;

}


// ==========================
// MULAI
// ==========================

updateGreeting();

render();

// ==========================
// SERVICE WORKER PWA
// ==========================

if ("serviceWorker" in navigator) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => {

          console.log(
            "LUXE INCOME berhasil menjadi PWA"
          );

        })
        .catch(error => {

          console.log(
            "Service Worker gagal:",
            error
          );

        });

    }
  );

}