import { useSelector } from 'react-redux'
import { selectSkuinvById } from '../skuinv/skuinvApiSlice'
import { encoding } from '../../data/encoding'

import { memo } from 'react'

const Sku = ({ skuId }) => {

    const sku = useSelector(state => selectSkuinvById(state, skuId))

    /* const { sku } = useGetSkusQuery("skuList", {
        selectFromResult: ({ data }) => ({
            sku: data?.entities[skuId]
        }),
    }) */

    if (sku) {

        return (
            <tr className="table__row user" >
                <td className="table__cell sku__primary">{sku.barcode}</td>
                <td className="table__cell sku__optional">{(sku.barcode.length === 11 ? (encoding.colour.find(item => item.IDENTITY === sku.barcode.substr(5, 1).toUpperCase()).COLOUR) : null)}</td>
                <td className="table__cell sku__optional">{(sku.barcode.length === 11 ? (encoding.sizes.find(item => item.IDENTITY === sku.barcode.substr(4, 1).toUpperCase()).SIZE) : null)}</td>
                <td className="table__cell sku__primary">{sku.name}</td>
                <td className="table__cell sku__primary">{sku.MRP}</td>
                <td className="table__cell sku__optional">{sku.MBR}</td>
                <td className="table__cell sku__optional">{sku.CP}</td>
                <td className="table__cell sku__optional">{sku.HSNCode}</td>
            </tr>
        )

    } else return null
}

const memoizedSku = memo(Sku)

export default memoizedSku