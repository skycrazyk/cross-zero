export function Cell({children, onClick}: {children: React.ReactNode; onClick?: () => void}) {
    return (
        <button onClick={onClick} style={{width: '30px', height: '30px', display: 'block'}}>
            {children}
        </button>
    )
}
