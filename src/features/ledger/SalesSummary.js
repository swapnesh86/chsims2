import { memo } from 'react'

const SalesSummary = ({ summaryrow }) => {

    //console.log(date, summaryrow[date])
    return (
        <tr className="table__row salessummary--row" >
            <td className="table__cell ledger__primary">{summaryrow.Date}</td>
            <td className="table__cell ledger__primary">{summaryrow.adcash}</td>
            <td className="table__cell ledger__primary">{summaryrow.adcard}</td>
            <td className="table__cell ledger__primary">{summaryrow.adupi}</td>
            <td className="table__cell ledger__primary">{summaryrow.adonline}</td>
            <td className="table__cell ledger__primary">{summaryrow.adtotal}</td>
            <td className="table__cell ledger__primary">{summaryrow.bacash}</td>
            <td className="table__cell ledger__primary">{summaryrow.bacard}</td>
            <td className="table__cell ledger__primary">{summaryrow.baupi}</td>
            <td className="table__cell ledger__primary">{summaryrow.baonline}</td>
            <td className="table__cell ledger__primary">{summaryrow.batotal}</td>
            <td className="table__cell ledger__primary">{summaryrow.pocash}</td>
            <td className="table__cell ledger__primary">{summaryrow.pocard}</td>
            <td className="table__cell ledger__primary">{summaryrow.poupi}</td>
            <td className="table__cell ledger__primary">{summaryrow.poonline}</td>
            <td className="table__cell ledger__primary">{summaryrow.pototal}</td>
            <td className="table__cell ledger__primary">{summaryrow.excash}</td>
            <td className="table__cell ledger__primary">{summaryrow.excard}</td>
            <td className="table__cell ledger__primary">{summaryrow.exupi}</td>
            <td className="table__cell ledger__primary">{summaryrow.exonline}</td>
            <td className="table__cell ledger__primary">{summaryrow.extotal}</td>

        </tr>
    )


}

const memoizedSalesSummary = memo(SalesSummary)

export default memoizedSalesSummary