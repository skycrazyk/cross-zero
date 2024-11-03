import {produce} from 'immer'
import {isDeepEqual} from 'remeda'
import {useState, useMemo, useCallback, useEffect, useRef} from 'react'
import {Cell} from './Cell'
import {Row} from './Rol'
import './App.css'

enum Sign {
    Cross = 'cross',
    Zero = 'zero',
    Empty = 'empty',
}

type Row<T> = [T, T, T]
type Field<T> = Row<Row<T>>

type PlayerSign = Sign.Cross | Sign.Zero
type PlayerCell = number

type GameSign = PlayerSign | Sign.Empty
type GameCell = {
    sign: GameSign
    onClick?: (rowIndex: number, colIndex: number) => void
}

type GameRow = Row<GameCell>

function createField<C>(generator: () => C) {
    return Array.from({length: 3}, () => Array.from({length: 3}, () => generator())) as Field<C>
}

function usePlayer({sign}: {sign: PlayerSign}) {
    const [state, setState] = useState(createField(() => 0 as PlayerCell))

    const mark = useCallback((rowIndex: number, colIndex: number) => {
        setState(
            produce((draft) => {
                draft[rowIndex][colIndex] = 1
            })
        )
    }, [])

    const reset = useCallback(() => {
        setState(createField(() => 0))
    }, [])

    return useMemo(
        () => ({
            state,
            sign,
            mark,
            reset,
        }),
        [sign, state, mark, reset]
    )
}

type Player = ReturnType<typeof usePlayer>

const winPositions = [
    [
        [1, 1, 1],
        [0, 0, 0],
        [0, 0, 0],
    ],
    [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    [
        [0, 0, 0],
        [0, 0, 0],
        [1, 1, 1],
    ],
    [
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
    ],
    [
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
    ],
    [
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0],
    ],
    [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ],
]

function SignView({sign}: {sign: GameSign}) {
    return sign === Sign.Cross ? 'X' : sign === Sign.Zero ? 'O' : ' '
}

function App() {
    const firstStep = useRef<PlayerSign>(Sign.Cross)
    const [currentSign, setCurrentSign] = useState<PlayerSign>(firstStep.current)
    const [winner, setWinner] = useState<Player>()
    const player1 = usePlayer({sign: Sign.Cross})
    const player2 = usePlayer({sign: Sign.Zero})

    const playersMap = useMemo(() => {
        return {
            [player1.sign]: player1,
            [player2.sign]: player2,
        }
    }, [player1, player2])

    const reset = useCallback(() => {
        ;[player1, player2].forEach((p) => p.reset())
        firstStep.current = firstStep.current === Sign.Cross ? Sign.Zero : Sign.Cross
        setCurrentSign(firstStep.current)
        setWinner(undefined)
    }, [player1, player2])

    useEffect(() => {
        const player = Object.values(playersMap).find((player) => {
            return winPositions.some((wp) => isDeepEqual(wp, player.state))
        })

        if (player) {
            setWinner(player)
        }
    }, [playersMap])

    const field = useMemo(() => {
        return Object.values(playersMap).reduce(
            (acc, player) => {
                player.state.forEach((row, rowIndex) => {
                    return row.forEach((cell, cellIndex) => {
                        if (!acc[rowIndex]) {
                            acc[rowIndex] = [] as unknown as GameRow
                        }

                        if (acc[rowIndex][cellIndex].sign === Sign.Empty) {
                            acc[rowIndex][cellIndex] = {
                                sign: cell ? player.sign : Sign.Empty,
                                onClick: cell
                                    ? undefined
                                    : (rowIndex: number, cellIndex: number) => {
                                          setCurrentSign((sign) => {
                                              playersMap[sign].mark(rowIndex, cellIndex)
                                              return sign === Sign.Cross ? Sign.Zero : Sign.Cross
                                          })
                                      },
                            } as GameCell
                        }
                    })
                })

                return acc
            },
            createField(
                () =>
                    ({
                        sign: Sign.Empty,
                    } as GameCell)
            )
        )
    }, [playersMap])

    return (
        <>
            {winner ? (
                <h2>
                    Победитель: <SignView sign={winner.sign} />{' '}
                    <button onClick={reset}>Сброс</button>
                </h2>
            ) : (
                <h2>
                    Текущий ход: <SignView sign={currentSign} />
                </h2>
            )}
            <div style={{display: 'flex'}}>
                {field.map((row, rowIndex) => {
                    return (
                        <Row>
                            {row.map((cell, cellIndex) => {
                                return (
                                    <Cell
                                        disabled={!!winner}
                                        onClick={
                                            cell.onClick
                                                ? () => cell.onClick?.(rowIndex, cellIndex)
                                                : undefined
                                        }
                                    >
                                        <SignView sign={cell.sign} />
                                    </Cell>
                                )
                            })}
                        </Row>
                    )
                })}
            </div>
        </>
    )
}

export default App
