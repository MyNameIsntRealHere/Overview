async function createTableFromJSON(jsonPath, containerId, options = {}) {
  try {
    const res = await fetch(jsonPath);
    const data = await res.json();

    if (!data.length) {
      document.getElementById(containerId).innerHTML = "<p>No data found.</p>";
      return;
    }

    // Allow filtering (if keys specified in options.columns)
    const keys = options.columns || Object.keys(data[0]);

    const table = document.createElement("table");
    table.classList.add("sortable");

    // Build header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    keys.forEach(key => {
      const th = document.createElement("th");
      th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      th.addEventListener("click", () => sortTable(table, key)); // optional if you add sorting
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Build body
    const tbody = document.createElement("tbody");
    data.forEach(item => {
      const row = document.createElement("tr");
      keys.forEach(key => {
        const td = document.createElement("td");
        td.textContent = item[key];
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Insert into container
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    container.appendChild(table);
  } catch (err) {
    console.error("Error loading JSON:", err);
  }
}

// (Optional) very simple sort function
function sortTable(table, key) {
  const rows = Array.from(table.querySelectorAll("tbody tr"));
  const headerCells = Array.from(table.querySelectorAll("th"));
  const columnIndex = headerCells.findIndex(th => th.textContent.toLowerCase() === key.toLowerCase());

  const sorted = rows.sort((a, b) => {
    const A = a.children[columnIndex].textContent;
    const B = b.children[columnIndex].textContent;
    const numA = parseFloat(A.replace(/[^0-9.]/g, ""));
    const numB = parseFloat(B.replace(/[^0-9.]/g, ""));
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return A.localeCompare(B);
  });

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";
  sorted.forEach(row => tbody.appendChild(row));
}
