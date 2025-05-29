import { useSelector } from 'react-redux'
import { selectSkuinvById, useDeleteSkuinvMutation, useUpdateSkuinvMutation } from '../skuinv/skuinvApiSlice';


import useAuth from "../../hooks/useAuth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faSave } from "@fortawesome/free-solid-svg-icons"

import { useState, memo } from "react"
import { encoding } from '../../data/encoding';


const EditSku = ({ skuId }) => {

    const sku = useSelector(state => selectSkuinvById(state, skuId))

    const [name, setName] = useState(sku?.name)
    const [mrp, setMrp] = useState(sku?.MRP)
    const [mbr, setMbr] = useState(sku?.MBR)
    const [cp, setCp] = useState(sku?.CP)
    const [hsn, setHsn] = useState(sku?.HSNCode)

    const { isAdmin, isSkuManager } = useAuth()
    const [deleteSku] = useDeleteSkuinvMutation()
    const [updateSku] = useUpdateSkuinvMutation()

    const onDeleteSkuClicked = async (e) => {
        await deleteSku({ id: skuId })
    }

    const onSaveClicked = async (e) => {
        await updateSku({ id: skuId, name: name, MRP: mrp, MBR: mbr, CP: cp, HSNCode: hsn })
    }


    if (sku) {

        return (
            <tr className="table__row user" >
                <td className="table__cell sku__primary">{sku?.barcode}</td>
                <td className="table__cell sku__optional">{(sku?.barcode.length === 11 ? (encoding.colour.find(item => item.IDENTITY === sku?.barcode.substr(5, 1).toUpperCase()).COLOUR) : null)}</td>
                <td className="table__cell sku__optional">{(sku?.barcode.length === 11 ? (encoding.sizes.find(item => item.IDENTITY === sku?.barcode.substr(4, 1).toUpperCase()).SIZE) : null)}</td>
                <td className="table__cell sku__primary">
                    <input
                        id='barcode'
                        type='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </td>
                <td className="table__cell sku__primary">
                    <input
                        className='sku_edit_num'
                        id='mrp'
                        type='text'
                        value={mrp}
                        onChange={(e) => setMrp(e.target.value)}
                    />
                </td>
                <td className="table__cell sku__primary">
                    <input
                        className='sku_edit_num'
                        id='mbr'
                        type='text'
                        value={mbr}
                        onChange={(e) => setMbr(e.target.value)}
                    />
                </td>
                <td className="table__cell sku__primary">
                    <input
                        className='sku_edit_num'
                        id='cp'
                        type='text'
                        value={cp}
                        onChange={(e) => setCp(e.target.value)}
                    />
                </td>
                <td className="table__cell sku__primary">
                    <input
                        className='sku_edit_num'
                        id='hsn'
                        type='text'
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