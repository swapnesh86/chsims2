import { useSelector } from 'react-redux'
import { selectSkuById } from './skusApiSlice'
//import { useGetSkusQuery } from "./skusApiSlice"

import useAuth from "../../hooks/useAuth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faSave } from "@fortawesome/free-solid-svg-icons"
import { useDeleteSkuMutation, useUpdateSkuMutation } from "./skusApiSlice"

import { useState, memo } from "react"

const EditSku = ({ skuId }) => {

    const sku = useSelector(state => selectSkuById(state, skuId))

    /* const { sku } = useGetSkusQuery("skuList", {
        selectFromResult: ({ data }) => ({
            sku: data?.entities[skuId]
        }),
    }) */

    const [name, setName] = useState(sku.Name)
    const [mrp, setMrp] = useState(sku.MRP)
    const [mbr, setMbr] = useState(sku.MBR)
    const [hsn, setHsn] = useState(sku.HSNCode)

    const { isAdmin, isSkuManager } = useAuth()
    const [deleteSku] = useDeleteSkuMutation()
    const [updateSku] = useUpdateSkuMutation()

    const onDeleteSkuClicked = async (e) => {
        await deleteSku({ id: skuId, })
    }

    const onSaveClicked = async (e) => {
        await updateSku({ id: skuId, Barcode: sku.Barcode, Name: name, MRP: mrp, MBR: mbr, HSNCode: hsn })
    }


    if (sku) {

        return (
            <tr className="table__row user" >
                <td className="table__cell sku__primary">{sku.Barcode}</td>
                <td className="table__cell sku__optional">{sku.SKU}</td>
                <td className="table__cell sku__primary">
                    <input
                        id='barcode'
                        type='text'
                        placeholder={sku.Name}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </td>
                <td className="table__cell sku__primary">
                    <input
                        className='sku_edit_num'
                        id='mrp'
                        type='text'
                        placeholder={sku.MRP}
                        value={mrp}
                        onChange={(e) => setMrp(e.target.value)}
                    />
                </td>
                <td className="table__cell sku__primary">
                    <input
                        className='sku_edit_num'
                        id='mbr'
                        type='text'
                        placeholder={sku.MBR}
                        value={mbr}
                        onChange={(e) => setMbr(e.target.value)}
                    />
                </td>
                <td className="table__cell sku__primary">
                    <input
                        className='sku_edit_num'
                        id='hsn'
                        type='text'
                        placeholder={sku.HSNCode}
                        value={hsn}
                        onChange={(e) => setHsn(e.target.value)}
                    />
                </td>
                {(isAdmin || isSkuManager) && <td className="table__cell sku__delete">
                    <button
                        className="icon-skudelbutton"
                        title="Save"
                        onClick={onSaveClicked}
                    >
                        <FontAwesomeIcon icon={faSave} />
                    </button>
                </td>
                }
                {isAdmin && <td className="table__cell sku__delete">
                    <button
                        className="icon-skudelbutton"
                        value={skuId}
                        onClick={onDeleteSkuClicked}
                    >
                        <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                </td>
                }
            </tr>
        )

    } else return null
}

const memoizedEditSku = memo(EditSku)

export default memoizedEditSku