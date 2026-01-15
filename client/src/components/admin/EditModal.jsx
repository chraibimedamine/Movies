import React, { useState, useEffect } from 'react';

function EditModal({ isOpen, onClose, onSave, title, initialValue, type = 'text', options = [] }) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(value);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'var(--color-bg-secondary)', // Using theme background
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--border-radius-lg)',
                border: 'var(--border-glass)',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}>
                <h2 style={{ marginBottom: 'var(--spacing-lg)', fontSize: 'var(--font-size-xl)' }}>{title}</h2>
                <form onSubmit={handleSubmit}>
                    {type === 'select' ? (
                        <select
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-md)',
                                background: 'var(--color-bg-primary)',
                                border: 'var(--border-glass)',
                                borderRadius: 'var(--border-radius-sm)',
                                color: 'var(--color-text-primary)',
                                marginBottom: 'var(--spacing-lg)',
                                appearance: 'none' // Remove default arrow if desired, or keep it
                            }}
                        >
                            {options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={type}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-md)',
                                background: 'var(--color-bg-primary)',
                                border: 'var(--border-glass)',
                                borderRadius: 'var(--border-radius-sm)',
                                color: 'var(--color-text-primary)',
                                marginBottom: 'var(--spacing-lg)'
                            }}
                        />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditModal;
