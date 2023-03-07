import { useSelector } from 'react-redux'
import { selectLedgerById } from './ledgerApiSlice'

import { memo } from 'react'

const Ledger = ({ ledgerId }) => {

    const ledger = useSelector(state => selectLedgerById(state, ledgerId))

    const date = new Date(ledger.createdAt)
    const dateStr = new Intl.DateTimeFormat('en-US').format(date)

    if (ledger) {

        return (
            <tr className="table__row ledger--row" >
                <td className="table__cell ledger__primary">{dateStr}</td>
                <td className="table__cell ledger__primary">{ledger.billno}</td>
                <td className="table__cell ledger__primary">{ledger.barcode}</td>
                <td className="table__cell ledger__primary">{ledger.name}</td>
                <td className="table__cell ledger__primary">{ledger.ordertype}</td>
                {/* <td className="table__cell ledger__primary">{ledger.seller}</td> */}
                <td className="table__cell ledger__primary">{ledger.buyer}</td>
                {/* <td className="table__cell ledger__primary">{ledger.phone}</td>
                <td className="table__cell ledger__primary">{ledger.email}</td> */}
                <td className="table__cell ledger__primary">{ledger.paymenttype}</td>
                {/* <td className="table__cell ledger__primary">{ledger.membership}</td> */}
                <td className="table__cell ledger__primary">{ledger.qty}</td>
                <td className="table__cell ledger__primary">{ledger.totalprice}</td>
                <td className="table__cell ledger__primary">{ledger.hsncode}</td>
                <td className="table__cell ledger__primary">{ledger.gst}</td>
            </tr>
        )

    } else return null
}

const memoizedLedger = memo(Ledger)

export default memoizedLedger