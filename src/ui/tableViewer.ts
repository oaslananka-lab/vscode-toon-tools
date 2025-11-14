import * as vscode from 'vscode';
import { parseToonBlocks } from '../parser/toonParser';

export async function openTableViewerCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active TOON document to view.');
    return;
  }

  try {
    const blocks = parseToonBlocks(editor.document.getText());
    if (blocks.length === 0) {
      vscode.window.showInformationMessage('No TOON blocks found to display.');
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'toonTableViewer',
      'TOON Table Viewer',
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    panel.webview.html = getWebviewHtml(blocks);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Failed to open TOON Table Viewer: ${message}`);
  }
}

function getWebviewHtml(blocks: ReturnType<typeof parseToonBlocks>): string {
  const payload = blocks.map((block) => ({
    name: block.name,
    fields: block.fields,
    rows: block.rows.map((row) => row.values)
  }));
  const data = JSON.stringify(payload).replace(/</g, '\\u003c');
  const nonce = createNonce();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';" />
<style nonce="${nonce}">
  body { font-family: Segoe UI, sans-serif; margin: 0; padding: 16px; }
  header { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
  select, input { padding: 6px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; }
  th { cursor: pointer; background: #f3f3f3; }
  tbody tr:nth-child(even) { background: #fafafa; }
</style>
</head>
<body>
  <header>
    <label>Block:
      <select id="blockSelect"></select>
    </label>
    <label>Filter:
      <input id="filter" type="text" placeholder="Contains..." />
    </label>
  </header>
  <div id="table"></div>
  <script nonce="${nonce}">
    const data = ${data};
    const select = document.getElementById('blockSelect');
    const filterInput = document.getElementById('filter');
    const tableContainer = document.getElementById('table');
    const sort = { index: 0, asc: true };

    function init() {
      data.forEach((block, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = block.name;
        select.appendChild(option);
      });
      select.addEventListener('change', render);
      filterInput.addEventListener('input', render);
      select.value = '0';
      render();
    }

    function render() {
      const blockIndex = Number(select.value) || 0;
      const block = data[blockIndex];
      if (!block) {
        tableContainer.textContent = 'No block selected';
        return;
      }

      const filter = filterInput.value.toLowerCase();
      const filteredRows = block.rows.filter((row) =>
        row.some((value) => String(value ?? '').toLowerCase().includes(filter))
      );

      const sortedRows = [...filteredRows].sort((a, b) => {
        const av = String(a[sort.index] ?? '').toLowerCase();
        const bv = String(b[sort.index] ?? '').toLowerCase();
        if (av === bv) {
          return 0;
        }
        return sort.asc ? av.localeCompare(bv) : bv.localeCompare(av);
      });

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');

      block.fields.forEach((field, index) => {
        const th = document.createElement('th');
        th.textContent = field || 'Field ' + (index + 1);
        th.addEventListener('click', () => {
          if (sort.index === index) {
            sort.asc = !sort.asc;
          } else {
            sort.index = index;
            sort.asc = true;
          }
          render();
        });
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      const tbody = document.createElement('tbody');
      if (sortedRows.length === 0) {
        const emptyRow = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = Math.max(1, block.fields.length);
        cell.textContent = 'No rows match the current filter.';
        emptyRow.appendChild(cell);
        tbody.appendChild(emptyRow);
      } else {
        sortedRows.forEach((row) => {
          const tr = document.createElement('tr');
          block.fields.forEach((_, index) => {
            const td = document.createElement('td');
            td.textContent = String(row[index] ?? '');
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
      }

      table.appendChild(thead);
      table.appendChild(tbody);
      tableContainer.innerHTML = '';
      tableContainer.appendChild(table);
    }

    init();
  </script>
</body>
</html>`;
}

function createNonce(): string {
  return Math.random().toString(36).slice(2, 15);
}
