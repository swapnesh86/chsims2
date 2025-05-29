import { useSelector } from 'react-redux'
import { selectSkuinvById } from '../skuinv/skuinvApiSlice'
import { encoding } from '../../data/encoding'

import { memo } from 'react'

const Inventory = ({ skuinvId }) => {

    const skuinv = useSelector(state => selectSkuinvById(state, skuinvId))

    if (skuinv) {

        return (
            <tr className="table__row skuinv--row" >
                <td className="table__cell skuinv__primary">{skuinv.barcode}</td>
                <td className="table__cell skuinv__primary">{skuinv.name}</td>
                <td className="table__cell skuinv__primary">{(skuinv.barcode.length === 11 ? (encoding.colour.find(item => item.IDENTITY === skuinv.barcode.substr(5, 1).toUpperCase()).COLOUR) : null)}</td>
                <td className="table__cell skuinv__primary">{(skuinv.barcode.length === 11 ? (encoding.sizes.find(item => item.IDENTITY === skuinv.barcode.substr(4, 1).toUpperCase()).SIZE) : null)}</td>
                <td className="table__cell skuinv__primary">{skuinv.MRP}</td>
                <td className="table__cell skuinv__primary">{skuinv.MBR}</td>
                <td className="table__cell skuinv__primary">{skuinv.CP}</td>
                <td className="table__cell skuinv__primary">{skuinv.source}</td>
                <td className="table__cell skuinv__primary">{skuinv.cwefstore}</td>
                <td className="table__cell skuinv__primary">{skuinv.andheri}</td>
                <td className="table__cell skuinv__primary">{skuinv.bandra}</td>
                <td className="table__cell skuinv__primary">{skuinv.powai}</td>
                <td className="table__cell skuinv__primary">{skuinv.exhibition}</td>
                <td className="table__cell skuinv__primary">{skuinv.sales}</td>
            </tr>
        )

    } else return null
}

const memoizedInventory = memo(Inventory)

export default memoizedInventory