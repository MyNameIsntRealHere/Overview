async function createTableFromJSON(jsonPath, targetId, options = {}) {
  const target = document.getElementById(targetId);
  if (!target) return;

  try {
    const res = await fetch(jsonPath);
    if (!res.ok) throw new Error(`Failed to load ${jsonPath}`);
    let data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      target.innerHTML = "<p>No data available.</p>";
      return;
    }

    // 🔍 Optional row filtering (supports single or multiple values)
    if (options.filter && typeof options.filter === "object") {
      data = data.filter(item => {
        return Object.entries(options.filter).every(([key, value]) => {
          if (Array.isArray(value)) {
            // Example: filter: { name: ["Pickup Truck", "Van"] }
            return value.includes(item[key]);
          }
          return item[key] === value;
        });
      });
    }

    if (data.length === 0) {
      target.innerHTML = "<p>No matching data found.</p>";
      return;
    }

    // Use specified columns or detect automatically
    const columns = options.columns || Object.keys(data[0]);

    // Build table
    const table = document.createElement("table");
    table.classList.add("sortable", "styled-table");

    // Header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    columns.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col.charAt(0).toUpperCase() + col.slice(1);
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement("tbody");
    data.forEach(item => {
      const tr = document.createElement("tr");
      columns.forEach(col => {
        const td = document.createElement("td");

        // Add clickable link if item has "link" field and this is the "name" column
        if (col === "name" && item.link) {
          const a = document.createElement("a");
          a.href = item.link;
          a.textContent = item[col];
          a.classList.add("table-link");
          td.appendChild(a);
        } else {
          td.textContent = item[col] ?? "";
        }

        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    target.innerHTML = "";
    target.appendChild(table);

    enableTableSorting(table); // Make it sortable
  } catch (err) {
    console.error(err);
    target.innerHTML = "<p>Failed to load data.</p>";
  }
}

// Independent sorting for multiple tables
function enableTableSorting(table) {
  const headers = table.querySelectorAll("th");
  headers.forEach((header, index) => {
    header.addEventListener("click", () => {
      const tbody = table.querySelector("tbody");
      const rows = Array.from(tbody.querySelectorAll("tr"));
      const asc = !header.classList.contains("asc");

      headers.forEach(h => h.classList.remove("asc", "desc"));
      header.classList.toggle("asc", asc);
      header.classList.toggle("desc", !asc);

      const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
      rows.sort((a, b) => {
        const aText = a.children[index].textContent.trim();
        const bText = b.children[index].textContent.trim();
        return asc ? collator.compare(aText, bText) : collator.compare(bText, aText);
      });

      rows.forEach(row => tbody.appendChild(row));
    });
  });
}
