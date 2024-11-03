export function Cell({
    children,
    onClick,
    disabled,
}: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            style={{width: '30px', height: '30px', display: 'block'}}
        >
            {children}
        </button>
    )
}
