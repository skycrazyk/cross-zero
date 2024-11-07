export function Cell({
    children,
    onClick,
    disabled,
    win,
}: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    win?: boolean
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            style={{
                width: '30px',
                height: '30px',
                display: 'block',
                ...(win && {background: 'gold'}),
            }}
        >
            {children}
        </button>
    )
}
