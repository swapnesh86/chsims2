import { useSelector } from 'react-redux'
import { selectInventoryById } from './inventoryApiSlice'
//import { encoding } from '../../data/encoding'

import { memo } from 'react'

const Inventory = ({ inventoryId }) => {

    const inventory = useSelector(state => selectInventoryById(state, inventoryId))

    if (inventory) {

        return (
            <tr className="table__row inventory--row" >
                <td className="table__cell inventory__primary">{inventory.barcode}</td>
                <td className="table__cell inventory__primary">{inventory.name}</td>
                <td className="table__cell inventory__primary">{inventory.colour}</td>
                <td className="table__cell inventory__primary">{inventory.size}</td>
                {/* <td className="table__cell inventory__primary">{(inventory.barcode.length === 11 ? (encoding.colour.find(item => item.IDENTITY === inventory.barcode.substr(5, 1).toUpperCase()).COLOUR) : null)}</td>
                <td className="table__cell inventory__primary">{(inventory.barcode.length === 11 ? (encoding.sizes.find(item => item.IDENTITY === inventory.barcode.substr(4, 1).toUpperCase()).SIZE) : null)}</td> */}
                <td className="table__cell inventory__primary">{inventory.source}</td>
                <td className="table__cell inventory__primary">{inventory.cwefstore}</td>
                <td className="table__cell inventory__primary">{inventory.andheri}</td>
                <td className="table__cell inventory__primary">{inventory.bandra}</td>
                <td className="table__cell inventory__primary">{inventory.powai}</td>
                <td className="table__cell inventory__primary">{inventory.exhibition}</td>
                <td className="table__cell inventory__primary">{inventory.sales}</td>
            </tr>
        )

    } else return null
}

const memoizedInventory = memo(Inventory)

export default memoizedInventory