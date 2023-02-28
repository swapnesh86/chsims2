import { useSelector } from 'react-redux'
import { selectSkuById } from './skusApiSlice'

//import { useGetSkusQuery } from "./skusApiSlice"
import { memo } from 'react'

const Sku = ({ skuId }) => {

    const sku = useSelector(state => selectSkuById(state, skuId))

    /* const { sku } = useGetSkusQuery("skuList", {
        selectFromResult: ({ data }) => ({
            sku: data?.entities[skuId]
        }),
    }) */

    if (sku) {

        return (
            <tr className="table__row user" >
                <td className="table__cell sku__primary">{sku.Barcode}</td>
                <td className="table__cell sku__optional">{sku.SKU}</td>
                <td className="table__cell sku__primary">{sku.Name}</td>
                <td className="table__cell sku__primary">{sku.MRP}</td>
                <td className="table__cell sku__optional">{sku.MBR}</td>
                <td className="table__cell sku__optional">{sku.HSNCode}</td>
            </tr>
        )

    } else return null
}

const memoizedSku = memo(Sku)

export default memoizedSku