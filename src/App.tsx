import {produce} from 'immer'
import {useState, useMemo, useCallback} from 'react'
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
type PlayerCell = boolean

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
    const [state, setState] = useState(createField(() => false as PlayerCell))

    const mark = useCallback((rowIndex: number, colIndex: number) => {
        setState(
            produce((draft) => {
                draft[rowIndex][colIndex] = true
            })
        )
    }, [])

    const reset = useCallback(() => {
        setState(createField(() => false))
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

function App() {
    const [currentSign, setCurrentSign] = useState<PlayerSign>(Sign.Cross)
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
        setCurrentSign(Sign.Cross)
    }, [player1, player2])

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
                                          setCurrentSign((currentSign) => {
                                              playersMap[currentSign].mark(rowIndex, cellIndex)
                                              return currentSign === Sign.Cross
                                                  ? Sign.Zero
                                                  : Sign.Cross
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
            <h2>Текущий ход: {currentSign}</h2>
            <button onClick={reset}>Сброс</button>
            <div style={{display: 'flex'}}>
                {field.map((row, rowIndex) => {
                    return (
                        <Row>
                            {row.map((cell, cellIndex) => {
                                return (
                                    <Cell
                                        onClick={
                                            cell.onClick
                                                ? () => cell.onClick?.(rowIndex, cellIndex)
                                                : undefined
                                        }
                                    >
                                        {cell.sign === Sign.Cross
                                            ? 'X'
                                            : cell.sign === Sign.Zero
                                            ? 'O'
                                            : ' '}
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
