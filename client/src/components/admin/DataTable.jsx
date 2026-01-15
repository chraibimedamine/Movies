function DataTable({ data, columns, onEdit, onDelete }) {
    return (
        <div style={{
            background: 'var(--color-bg-glass)',
            border: 'var(--border-glass)',
            borderRadius: 'var(--border-radius-md)',
            overflow: 'hidden'
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'var(--color-bg-secondary)' }}>
                        {columns.map(col => (
                            <th key={col.key} style={{
                                padding: 'var(--spacing-md)',
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)'
                            }}>
                                {col.label}
                            </th>
                        ))}
                        <th style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'right',
                            fontWeight: '600',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)'
                        }}>
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} style={{
                            borderTop: 'var(--border-glass)'
                        }}>
                            {columns.map(col => (
                                <td key={col.key} style={{
                                    padding: 'var(--spacing-md)',
                                    fontSize: 'var(--font-size-sm)'
                                }}>
                                    {row[col.key]}
                                </td>
                            ))}
                            <td style={{
                                padding: 'var(--spacing-md)',
                                textAlign: 'right'
                            }}>
                                {onEdit && (
                                    <button
                                        onClick={() => {
                                            console.log('Edit button clicked for row:', row);
                                            onEdit(row);
                                        }}
                                        className="btn btn-ghost"
                                        style={{ marginRight: 'var(--spacing-sm)' }}
                                    >
                                        Edit
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        console.log('Delete button clicked for row:', row);
                                        onDelete(row);
                                    }}
                                    className="btn btn-ghost"
                                    style={{ color: 'var(--color-error)' }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length === 0 && (
                <div style={{
                    padding: 'var(--spacing-2xl)',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)'
                }}>
                    No data available
                </div>
            )}
        </div>
    );
}

export default DataTable;
