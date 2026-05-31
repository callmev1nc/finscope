interface ResultTableProps {
  headers: string[];
  rows: (string | number)[][];
}

export function ResultTable({ headers, rows }: ResultTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-50 dark:bg-zinc-800/50">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-t border-border transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
