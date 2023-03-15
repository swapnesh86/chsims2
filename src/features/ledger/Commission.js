import { memo } from 'react'

const Commission = ({ entry }) => {

    return (
        <tr className="table__row" >
            <td className="table__cell sku__primary">{entry.name}</td>
            <td className="table__cell sku__primary">{entry.low}</td>
            <td className="table__cell sku__primary">{entry.mid}</td>
            <td className="table__cell sku__primary">{entry.high}</td>
            <td className="table__cell sku__primary">{entry.tot}</td>
        </tr>
    )


}

const memoizedCommission = memo(Commission)

export default memoizedCommission