import { memo } from 'react'

const GstSummary = ({ gstrow }) => {

    //console.log(date, gstrow[date])
    return (
        <tr className="table__row gst--row" >
            <td className="table__cell ledger__primary">{gstrow.Date}</td>
            <td className="table__cell ledger__primary">{gstrow.gst}</td>
            <td className="table__cell ledger__primary">{gstrow.Customer}</td>
            <td className="table__cell ledger__primary">{gstrow.BillNo}</td>
            <td className="table__cell ledger__primary">{gstrow.name}</td>
            <td className="table__cell ledger__primary">{(gstrow.Price / (1 + gstrow.gst / 100)).toFixed(2)}</td>
            <td className="table__cell ledger__primary">{(gstrow.Price * (gstrow.gst * 0.5 / (100 + gstrow.gst))).toFixed(2)}</td>
            <td className="table__cell ledger__primary">{(gstrow.Price * (gstrow.gst * 0.5 / (100 + gstrow.gst))).toFixed(2)}</td>
            <td className="table__cell ledger__primary">{gstrow.Price}</td>

        </tr>
    )


}

const memoizedGstSummary = memo(GstSummary)

export default memoizedGstSummary