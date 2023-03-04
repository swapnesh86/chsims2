import { useState, useEffect } from "react"
import { useAddNewMemberMutation } from "./membersApiSlice"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from "@fortawesome/free-solid-svg-icons"
import { encoding } from "../../data/encoding"

import { useGetBillNosQuery, useUpdateBillNoMutation, categorySelect, finyearNow, pad } from "../transfers/billNoApiSlice"

import { useAddNewLedgerMutation } from "../ledger/ledgerApiSlice"
//import { useGetInventoryQuery, useUpdateInventoryMutation } from "../inventory/inventoryApiSlice"

import { useGetSkusQuery } from "../skus/skusApiSlice"
import { getGst } from "../utilities/GstCalc"


const MEMBER_REGEX = /^FB0[0-9]{5}$/
const PHONE_REGEX = /^[2-9][0-9]{9}$/

const NewMemberForm = () => {

    const [addNewMember, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewMemberMutation()

    const {
        data: billnos,
        isLoading: billLoading,
        isSuccess: billSucecss
    } = useGetBillNosQuery('billnos', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const [updatebillnos] = useUpdateBillNoMutation()

    /*     const {
            data: inventory,
            isLoading: invLoading,
            isSuccess: invSucecss
        } = useGetInventoryQuery('inventoryList', {
            pollingInterval: 60000,
            refetchOnFocus: true,
            refetchOnMountOrArgChange: true
        })
        const [updateinventory] = useUpdateInventoryMutation() */

    const [addledger] = useAddNewLedgerMutation()

    const {
        data: skus,
        isLoading: skuLoading,
        isSuccess: skuSuccess,
    } = useGetSkusQuery('skuList', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const navigate = useNavigate()

    const [memberId, setMemberId] = useState('')
    const [validMemberId, setValidMemberId] = useState(false)
    const [phone, setPhone] = useState('')
    const [name, setName] = useState('')
    const [paymentType, setPaymentType] = useState('')
    const [validPhone, setValidPhone] = useState(false)

    useEffect(() => {
        setValidMemberId(MEMBER_REGEX.test(memberId))
    }, [memberId])

    useEffect(() => {
        setValidPhone(PHONE_REGEX.test(phone))
    }, [phone])

    useEffect(() => {
        if (isSuccess) {
            setMemberId('')
            setPhone('')
            navigate('/dash/membership')
        }
    }, [isSuccess, navigate])

    let content
    if (billLoading) content = <p>Loading...</p>

    if (billSucecss) {

        const { ids, entities } = billnos

        if (skuLoading) content = <p>Loading...</p>

        if (skuSuccess) {

            const { ids: skuids, entities: skuentities } = skus

            let myUpdateStr = { id: ids[0], ad: 0, ba: 0, po: 0, ex: 0, db: 0, dn: 0, rs: 0, int: 0, os: 0, ip: 0 }

            const getbillno = (seller, buyer) => {

                if (seller === 'CH' && buyer === 'CWEFStore') { (myUpdateStr.db = 1); return (entities[ids[0]].db); }
                if (seller === 'OS' && buyer === 'CWEFStore') { (myUpdateStr.os = 1); return (entities[ids[0]].os); }
                if (seller === 'CWEF' && buyer === 'CWEFStore') { (myUpdateStr.ip = 1); return (entities[ids[0]].ip); }
                if (seller === 'CWEFStore' && buyer === 'CH') { (myUpdateStr.dn = 1); return (entities[ids[0]].dn); }
                if (seller === 'CWEFStore' && buyer === 'OS') { (myUpdateStr.rs = 1); return (entities[ids[0]].rs); }
                if ((seller === 'CWEFStore' || seller === 'Andheri' || seller === 'Bandra' || seller === 'Powai' || seller === 'Exhibition')
                    && (buyer === 'CWEFStore' || buyer === 'Andheri' || buyer === 'Bandra' || buyer === 'Powai' || buyer === 'Exhibition')) {
                    (myUpdateStr.int = 1); return (entities[ids[0]].int);
                }
                if (seller === 'Andheri') { (myUpdateStr.ad = 1); return (entities[ids[0]].ad); }
                if (seller === 'Bandra') { (myUpdateStr.ba = 1); return (entities[ids[0]].ba); }
                if (seller === 'Powai') { (myUpdateStr.po = 1); return (entities[ids[0]].po); }
                if (seller === 'Exhibition') { (myUpdateStr.ex = 1); return (entities[ids[0]].ex); }
            }

            const onMemberIdChanged = e => setMemberId(e.target.value)
            const onPhoneChanged = e => setPhone(e.target.value)

            const canSave = [validMemberId, validPhone, name, paymentType].every(Boolean) && !isLoading

            const onSaveMemberClicked = async (e) => {
                e.preventDefault()
                if (canSave) {
                    const billdigits = pad(getbillno('Andheri', name))

                    const membershipBarcode = encoding.membership.find(temp => temp.ID === Number(memberId.substr(3, 1))).barcode
                    const priceId = skuids.filter(sku => (skuentities[sku].Barcode.toLowerCase() === (membershipBarcode.toLowerCase())))
                    const membershipPrice = skuentities[priceId].MRP
                    const membershipHsn = skuentities[priceId].HSNCode

                    let membershipDuration = encoding.membership.find(temp => temp.ID === Number(memberId.substr(3, 1))).duration

                    console.log(myUpdateStr)
                    await updatebillnos(myUpdateStr)
                    let myBillno = `CH${categorySelect('Andheri', name)}${finyearNow()}-${billdigits}`
                    await addNewMember({ barcode: memberId, phone: phone, duration: membershipDuration, billno: myBillno })
                    await addledger({ billno: myBillno, barcode: membershipBarcode, ordertype: 'Sale', buyer: name, seller: 'Andheri', paymenttype: paymentType, phone: phone, membership: memberId, qty: 1, totalprice: membershipPrice, hsncode: membershipHsn, gst: getGst(membershipHsn, membershipPrice) })
                }
            }

            const errClass = isError ? "errmsg" : "offscreen"
            const validMemberClass = !validMemberId ? 'form__input--incomplete' : ''
            const validPhoneClass = !validPhone ? 'form__input--incomplete' : ''
            const validNameClass = !name ? 'form__input--incomplete' : ''
            const validPmtClass = !paymentType ? 'form__input--incomplete' : ''

            content = (
                <>
                    <p className={errClass}>{error?.data?.message}</p>

                    <form className="form" onSubmit={onSaveMemberClicked}>
                        <>
                            <div className="form__title-row">
                                <h2>New Member</h2>
                                <div className="form__action-buttons">
                                    <button
                                        className="icon-button"
                                        title="Save"
                                        disabled={!canSave}
                                    >
                                        <FontAwesomeIcon icon={faSave} />
                                    </button>
                                </div>
                            </div>
                            <label className="form__label" htmlFor="membername">
                                MemberId: <span className="nowrap">[8 letters]</span></label>
                            <input
                                className={`form__input ${validMemberClass}`}
                                id="membername"
                                name="membername"
                                type="text"
                                autoComplete="off"
                                value={memberId}
                                onChange={onMemberIdChanged}
                            />
                        </>
                        <>
                            <label className="form__label" htmlFor="phone">
                                Phone: <span className="nowrap">[Phone Number]</span></label>
                            <input
                                className={`form__input ${validPhoneClass}`}
                                id="phone"
                                name="phone"
                                type="text"
                                value={phone}
                                onChange={onPhoneChanged}
                            />
                            <label className="form__label" htmlFor="password">
                                Name: <span className="nowrap"></span></label>
                            <input
                                className={`form__input ${validNameClass}`}
                                id="name"
                                name="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <label className="form__label" htmlFor="brand"> Payment Type: </label>
                            <select className={`form__input ${validPmtClass}`} id="paymentType" name="paymentType" size="1" value={paymentType} onChange={(e) => setPaymentType(e.target.value)} >
                                {[<option></option>, <option>Cash</option>, <option>Card</option>, <option>UPI</option>, <option>Online</option>]}
                            </select>
                        </>
                    </form>
                </>
            )
        }
    }

    return content
}
export default NewMemberForm