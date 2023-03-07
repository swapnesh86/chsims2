import { memo, useState } from 'react'

//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { faUpload } from "@fortawesome/free-solid-svg-icons"


const ReturnLedger = ({ entry }) => {

    const [returnQty, setReturnQty] = useState(0)
    const [returnBool, setReturnBool] = useState(false)

    const handleToggle = () => setReturnBool(prev => !prev)

    let cellStatus

    if (returnBool) {
        cellStatus = 'table__cell--inactive'
        entry.Return = returnQty
    } else {
        cellStatus = 'table__cell ledger__primary'
        entry.Return = 0
    }

    return (
        <tr className="table__row ledger--returnrow" >
            <td className={`table__cell ${cellStatus}`}>{entry.Date}</td>
            <td className={`table__cell ${cellStatus}`}>{entry.Barcode}</td>
            <td className={`table__cell ${cellStatus}`}>{entry.Name}</td>
            <td className={`table__cell ${cellStatus}`}>{entry.Price}</td>
            <td className={`table__cell ${cellStatus}`}>{entry.Qty}</td>
            <td className={`table__cell ${cellStatus}`}>
                {returnBool ? returnQty : <input
                    className='sku_edit_qty'
                    id='qty'
                    type='text'
                    placeholder={0}
                    value={returnQty}
                    onChange={(e) => (e.target.value <= entry.Qty ? setReturnQty(e.target.value) : null)}
                />}
            </td>
            {(returnQty > 0) && <td className={`table__cell ${cellStatus}`}>
                <input
                    type="checkbox"
                    //className="form__checkbox"
                    id="persist"
                    onChange={handleToggle}
                    checked={returnBool}
                />
            </td>
            }

        </tr>
    )

}

const memoizedReturnLedger = memo(ReturnLedger)

export default memoizedReturnLedger