import { memo } from 'react'

const HsnSummary = ({ hsnrow }) => {

    //console.log(date, hsnrow[date])
    return (
        <tr className="table__row hsn--row" >
            <td className="table__cell ledger__primary">{hsnrow.HSN}</td>
            <td className="table__cell ledger__primary">{hsnrow.gst}</td>
            <td className="table__cell ledger__primary">{hsnrow.description}</td>
            <td className="table__cell ledger__primary">{hsnrow.Qty}</td>
            <td className="table__cell ledger__primary">{hsnrow.Price}</td>
            <td className="table__cell ledger__primary">{(hsnrow.Price * (1 - hsnrow.gst / 100)).toFixed(2)}</td>
            <td className="table__cell ledger__primary">{(hsnrow.Price * (hsnrow.gst / 200)).toFixed(2)}</td>
            <td className="table__cell ledger__primary">{(hsnrow.Price * (hsnrow.gst / 200)).toFixed(2)}</td>

        </tr>
    )


}

const memoizedHsnSummary = memo(HsnSummary)

export default memoizedHsnSummary